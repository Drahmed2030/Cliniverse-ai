import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://www.cliniverseai.com';

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars at runtime', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      return NextResponse.json({ error: 'Server misconfiguration: missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { case_number } = await req.json();

    if (!case_number) {
      return NextResponse.json({ error: 'case_number required' }, { status: 400 });
    }

    const { data: evalCase, error: caseErr } = await supabase
      .from('evaluation_cases')
      .select('*')
      .eq('case_number', case_number)
      .maybeSingle();

    if (caseErr) {
      console.error('Supabase select error:', caseErr);
      return NextResponse.json({ error: 'Supabase query failed', detail: caseErr }, { status: 500 });
    }

    if (!evalCase) {
      return NextResponse.json({ error: 'Case not found for case_number ' + case_number }, { status: 404 });
    }

    const draftPrompt = `Based on this clinical vignette, write ONE multiple-choice question with exactly 4 options (A-D), one correct answer, and a 2-3 sentence explanation citing the key clinical reasoning.

Vignette: ${evalCase.vignette}

Respond ONLY in this exact JSON format, no other text:
{"question":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_answer":"A","explanation":"..."}`;

    const draftRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: draftPrompt }],
      }),
    });

    if (!draftRes.ok) {
      const errText = await draftRes.text();
      console.error('Claude draft call failed:', draftRes.status, errText);
      return NextResponse.json({ error: 'Claude draft call failed', status: draftRes.status, detail: errText }, { status: 502 });
    }

    const draftData = await draftRes.json();
    const draftText = draftData?.content?.[0]?.text || '';

    let mcq;
    try {
      const jsonMatch = draftText.match(/\{[\s\S]*\}/);
      mcq = JSON.parse(jsonMatch ? jsonMatch[0] : draftText);
    } catch (parseErr) {
      console.error('MCQ parse failed:', parseErr, draftText);
      return NextResponse.json({ error: 'Failed to parse MCQ draft', raw: draftText }, { status: 500 });
    }

    const validationQuestion = `Multiple choice question: "${mcq.question}"
A) ${mcq.option_a}
B) ${mcq.option_b}
C) ${mcq.option_c}
D) ${mcq.option_d}

The proposed correct answer is ${mcq.correct_answer}. Is this correct? State clearly whether you agree with this answer.`;

    const oracleRes = await fetch(`${SITE_URL}/api/oracle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: validationQuestion }),
    });

    if (!oracleRes.ok) {
      const errText = await oracleRes.text();
      console.error('Oracle validation call failed:', oracleRes.status, errText);
      return NextResponse.json({ error: 'Oracle validation call failed', status: oracleRes.status, detail: errText }, { status: 502 });
    }

    const oracleData = await oracleRes.json();
    const consensusScore = oracleData?.consensus?.score ?? 0;

    let verdict = 'rejected';
    if (consensusScore >= 90) verdict = 'validated';
    else if (consensusScore >= 50) verdict = 'flagged';

    const { data: inserted, error: insertErr } = await supabase
      .from('question_bank')
      .insert({
        module: evalCase.module,
        question_text: mcq.question,
        option_a: mcq.option_a,
        option_b: mcq.option_b,
        option_c: mcq.option_c,
        option_d: mcq.option_d,
        correct_answer: mcq.correct_answer,
        explanation: mcq.explanation,
        source_name: evalCase.primary_source_name,
        source_id: evalCase.primary_source_id,
        source_updated: evalCase.primary_source_updated,
        oracle_verdict: verdict,
        oracle_confidence: consensusScore,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Insert failed:', insertErr);
      return NextResponse.json({ error: 'Insert failed', detail: insertErr }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      question: inserted,
      oracle_consensus_score: consensusScore,
      verdict,
    });
  } catch (err) {
    console.error('Unhandled error in /api/ingest/questions:', err);
    return NextResponse.json({ error: 'Unhandled error', detail: String(err) }, { status: 500 });
  }
}
