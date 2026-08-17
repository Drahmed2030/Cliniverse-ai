import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { case_number } = await req.json();

  if (!case_number) {
    return NextResponse.json({ error: 'case_number required' }, { status: 400 });
  }

  const { data: evalCase, error: caseErr } = await supabase
    .from('evaluation_cases')
    .select('*')
    .eq('case_number', case_number)
    .single();

  if (caseErr || !evalCase) {
    return NextResponse.json({ error: 'Case not found', detail: caseErr }, { status: 404 });
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

  const draftData = await draftRes.json();
  const draftText = draftData?.content?.[0]?.text || '';

  let mcq;
  try {
    const jsonMatch = draftText.match(/\{[\s\S]*\}/);
    mcq = JSON.parse(jsonMatch ? jsonMatch[0] : draftText);
  } catch {
    return NextResponse.json({ error: 'Failed to parse MCQ draft', raw: draftText }, { status: 500 });
  }

  const validationQuestion = `Multiple choice question: "${mcq.question}"
A) ${mcq.option_a}
B) ${mcq.option_b}
C) ${mcq.option_c}
D) ${mcq.option_d}

The proposed correct answer is ${mcq.correct_answer}. Is this correct? State clearly whether you agree with this answer.`;

  const oracleRes = await fetch(`${req.nextUrl.origin}/api/oracle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: validationQuestion }),
  });

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
    return NextResponse.json({ error: 'Insert failed', detail: insertErr }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    question: inserted,
    oracle_consensus_score: consensusScore,
    verdict,
  });
}
