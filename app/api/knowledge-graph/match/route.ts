
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/app/lib/embeddings';

const RELEASE_KNOWLEDGE_MATCH_ENABLED = process.env.RELEASE_ENABLE_KNOWLEDGE_MATCH === 'true';

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Accepts a clinical text (new case summary, or extracted document text)
 * and returns the top 3 most similar past cases with similarity % and
 * key differences the physician should note.
 */
export async function POST(req: NextRequest) {
  if (!RELEASE_KNOWLEDGE_MATCH_ENABLED) {
    return NextResponse.json(
      { error: 'Knowledge matching is disabled in this release pending AI consent and security review.' },
      { status: 503 },
    );
  }

  const { queryText, matchThreshold = 0.75, matchCount = 3 } = await req.json();

  if (!queryText?.trim())
    return NextResponse.json({ error: 'queryText is required' }, { status: 400 });

  const db = sb();

  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(queryText);
  } catch (e: any) {
    return NextResponse.json({ error: `Embedding failed: ${e.message}` }, { status: 500 });
  }

  const { data: matches, error } = await db.rpc('match_clinical_cases', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Compute simple key-difference callouts by comparing key_findings JSON
  const enriched = (matches || []).map((m: any) => ({
    id: m.id,
    diagnosis: m.primary_diagnosis,
    specialty: m.specialty,
    similarity: Math.round(m.similarity * 100),
    summary: m.case_summary,
    keyFindings: m.key_findings,
  }));

  return NextResponse.json({
    query: queryText,
    matchCount: enriched.length,
    matches: enriched,
    timestamp: new Date().toISOString(),
  });
}
