
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/app/lib/embeddings';

export const maxDuration = 60;

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * pgvector expects a string literal like "[0.1,0.2,0.3]" when sent
 * through PostgREST (which is what supabase-js uses under the hood).
 * Sending a raw JS number[] can silently fail to persist correctly
 * depending on the PostgREST/pgvector version combination — this
 * was the root cause of "seeded" being reported for rows that
 * still held their placeholder zero-vectors.
 */
function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server' }, { status: 500 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server' }, { status: 500 });
  }

  let db;
  try {
    db = sb();
  } catch (e: any) {
    return NextResponse.json({ error: `Supabase client init failed: ${e.message}` }, { status: 500 });
  }

  let rows;
  try {
    const { data, error } = await db
      .from('clinical_case_embeddings')
      .select('id, case_summary');
    if (error) throw new Error(error.message);
    rows = data;
  } catch (e: any) {
    return NextResponse.json({ error: `Supabase query failed: ${e.message}` }, { status: 500 });
  }

  if (!rows?.length) {
    return NextResponse.json({ message: 'No rows to seed', processed: 0 });
  }

  const results: any[] = [];

  for (const row of rows) {
    try {
      const embedding = await generateEmbedding(row.case_summary);
      const vectorLiteral = toVectorLiteral(embedding);

      const { error: updateError } = await db
        .from('clinical_case_embeddings')
        .update({ embedding: vectorLiteral })
        .eq('id', row.id);

      if (updateError) {
        results.push({ id: row.id, status: 'error', error: updateError.message });
        continue;
      }

      // Verify the write actually persisted — don't trust a clean
      // response alone, given the silent-failure history here.
      const { data: verifyRow, error: verifyError } = await db
        .from('clinical_case_embeddings')
        .select('embedding')
        .eq('id', row.id)
        .single();

      if (verifyError) {
        results.push({ id: row.id, status: 'error', error: `Verify failed: ${verifyError.message}` });
        continue;
      }

      const embeddingStr = String(verifyRow?.embedding ?? '');
      const isStillZero = embeddingStr.startsWith('[0,0,0') || embeddingStr.startsWith('{0,0,0');

      if (isStillZero) {
        results.push({ id: row.id, status: 'error', error: 'Update reported success but embedding is still zero-vector' });
        continue;
      }

      results.push({ id: row.id, status: 'seeded' });
    } catch (e: any) {
      results.push({ id: row.id, status: 'error', error: e.message });
    }
  }

  return NextResponse.json({
    stage: 'knowledge_graph_seed',
    processed: results.length,
    seeded: results.filter(r => r.status === 'seeded').length,
    failed: results.filter(r => r.status === 'error').length,
    results,
  });
}
