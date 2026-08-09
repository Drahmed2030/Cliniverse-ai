
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/app/lib/embeddings';

export const maxDuration = 60;

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
  }

  const db = sb();

  const { data: rows, error: fetchError } = await db
    .from('clinical_case_embeddings')
    .select('id, case_summary');

  if (fetchError) {
    return NextResponse.json({ error: `Fetch failed: ${fetchError.message}` }, { status: 500 });
  }
  if (!rows?.length) {
    return NextResponse.json({ message: 'No rows to seed', processed: 0 });
  }

  const results: any[] = [];

  for (const row of rows) {
    // Force explicit Number type — root cause of silent update failures
    // was row.id being a string/mismatched type against the bigint column,
    // causing .eq('id', row.id) to match zero rows despite HTTP 200.
    const numericId = Number(row.id);

    try {
      const embedding = await generateEmbedding(row.case_summary);
      const vectorLiteral = toVectorLiteral(embedding);

      const { data: updateData, error: updateError, status } = await db
        .from('clinical_case_embeddings')
        .update({ embedding: vectorLiteral })
        .eq('id', numericId)
        .select('id');

      if (updateError) {
        results.push({ id: numericId, status: 'error', error: updateError.message });
        continue;
      }

      if (!updateData || updateData.length === 0) {
        results.push({
          id: numericId,
          status: 'error',
          error: `Update matched 0 rows (HTTP ${status}) — id type mismatch or row missing`,
        });
        continue;
      }

      results.push({ id: numericId, status: 'seeded' });
    } catch (e: any) {
      results.push({ id: numericId, status: 'error', error: e.message });
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
