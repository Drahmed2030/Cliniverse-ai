
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/app/lib/embeddings';

export const maxDuration = 30;

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Keywords that trigger an elevated emergency warning — not exhaustive,
// just a first-pass safety net on top of the AI's own judgement.
const EMERGENCY_KEYWORDS = [
  'chest pain', 'can\'t breathe', 'cannot breathe', 'difficulty breathing',
  'severe bleeding', 'unconscious', 'suicide', 'stroke', 'numbness one side',
  'ألم صدر', 'ضيق تنفس شديد', 'فقدان وعي', 'نزيف شديد', 'تفكير بالانتحار',
];

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

export async function POST(req: NextRequest) {
  const { symptoms, age, sex } = await req.json();

  if (!symptoms?.trim() || symptoms.trim().length < 5) {
    return NextResponse.json({ error: 'Please describe your symptoms in a bit more detail.' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 });
  }

  const lowerSymptoms = symptoms.toLowerCase();
  const emergencyFlag = EMERGENCY_KEYWORDS.some(k => lowerSymptoms.includes(k.toLowerCase()));

  // ── Ask Claude for patient-friendly guidance (NOT a diagnosis) ──
  let guidance = '';
  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: `You are a careful, empathetic health information assistant for
the general public (NOT doctors). You NEVER provide a diagnosis.
Instead you:
1. Explain in plain, warm language what the symptoms COULD be related to (general categories, not a diagnosis)
2. Suggest sensible self-care if mild
3. Clearly state when to see a doctor, and how urgently
4. If anything sounds potentially serious or an emergency, say so explicitly and tell them to seek care immediately or call emergency services
Always respond in the same language the user wrote in.
Keep it concise — 4-6 sentences maximum.
Never sound alarmist for mild symptoms, but never downplay serious ones.`,
        messages: [{
          role: 'user',
          content: `Patient describes: "${symptoms}"${age ? ` (Age: ${age})` : ''}${sex ? ` (Sex: ${sex})` : ''}`,
        }],
      }),
    });
    const aiData = await aiRes.json();
    guidance = aiData.content?.[0]?.text || 'Unable to generate guidance right now — please consult a doctor if you are concerned.';
  } catch {
    guidance = 'Unable to generate guidance right now — please consult a doctor if you are concerned.';
  }

  // ── Anonymously store this symptom pattern in the Knowledge Graph ──
  // NO name, NO id, NO phone, NO device info — only the symptom text,
  // optional age band, and sex, exactly like an anonymized case note.
  let stored = false;
  try {
    const db = sb();
    const embedding = await generateEmbedding(symptoms);
    const vectorLiteral = toVectorLiteral(embedding);

    const { error } = await db.from('clinical_documents').insert({
      doc_type: 'patient_symptom_report',
      title: 'Anonymous symptom report',
      raw_text: symptoms,
      specialty: 'General',
    }).select('id').single().then(async ({ data: doc, error: docErr }) => {
      if (docErr || !doc) return { error: docErr };
      return db.from('clinical_case_embeddings').insert({
        document_id: doc.id,
        case_summary: symptoms,
        primary_diagnosis: 'Unconfirmed — patient-reported symptoms',
        specialty: 'General',
        key_findings: age || sex ? { age_band: age, sex } : null,
        embedding: vectorLiteral,
      });
    });
    stored = !error;
  } catch {
    stored = false; // non-fatal — guidance still returned even if storage fails
  }

  return NextResponse.json({
    guidance,
    emergencyFlag,
    stored,
  });
}
