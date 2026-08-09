
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/app/lib/embeddings';

export const maxDuration = 60; // Vercel function timeout ceiling

const sb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * One-time seeding endpoint: finds all clinical_case_embeddings rows
 * with placeholder zero-vectors and replaces them with real OpenAI
 * embeddings generated from their case_summary text.
 *
 * Every code path below returns a JSON response — no silent hangs.
 */
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
      const { error: updateError } = await db
        .from('clinical_case_embeddings')
        .update({ embedding })
        .eq('id', row.id);

      results.push({
        id: row.id,
        status: updateError ? 'error' : 'seeded',
        error: updateError?.message,
      });
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
