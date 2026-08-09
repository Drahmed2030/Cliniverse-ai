
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/app/lib/embeddings';

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * One-time seeding endpoint: finds all clinical_case_embeddings rows
 * with placeholder zero-vectors and replaces them with real OpenAI
 * embeddings generated from their case_summary text.
 * Protected by CRON_SECRET — same pattern as content engine routes.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = sb();

  const { data: rows, error } = await db
    .from('clinical_case_embeddings')
    .select('id, case_summary');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rows?.length) return NextResponse.json({ message: 'No rows to seed' });

  const results: any[] = [];

  for (const row of rows) {
    try {
      const embedding = await generateEmbedding(row.case_summary);
      const { error: updateError } = await db
        .from('clinical_case_embeddings')
        .update({ embedding })
        .eq('id', row.id);

      results.push({ id: row.id, status: updateError ? 'error' : 'seeded', error: updateError?.message });
    } catch (e: any) {
      results.push({ id: row.id, status: 'error', error: e.message });
    }
  }

  return NextResponse.json({
    stage: 'knowledge_graph_seed',
    processed: results.length,
    seeded: results.filter(r => r.status === 'seeded').length,
    results,
  });
}
