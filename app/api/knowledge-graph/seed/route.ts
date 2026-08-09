
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/app/lib/embeddings';

export const maxDuration = 60;
const CODE_VERSION = 'v3-debug-' + Date.now();

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
    return NextResponse.json({ error: 'Unauthorized', version: CODE_VERSION }, { status: 401 });
  }

  const db = sb();

  const { data: rows, error: fetchError } = await db
    .from('clinical_case_embeddings')
    .select('id, case_summary')
    .neq('id', 1); // skip the manually-set row 1 for this test

  if (fetchError) {
    return NextResponse.json({ error: `Fetch failed: ${fetchError.message}`, version: CODE_VERSION }, { status: 500 });
  }

  if (!rows?.length) {
    return NextResponse.json({ message: 'No rows found', version: CODE_VERSION });
  }

  // Only process the FIRST row, with FULL raw error detail
  const row = rows[0];
  const debug: any = { rowId: row.id, version: CODE_VERSION };

  try {
    const embedding = await generateEmbedding(row.case_summary);
    debug.embeddingGenerated = true;
    debug.embeddingLength = embedding.length;
    debug.embeddingSample = embedding.slice(0, 3);

    const vectorLiteral = toVectorLiteral(embedding);
    debug.vectorLiteralPreview = vectorLiteral.slice(0, 50);

    const updateResult = await db
      .from('clinical_case_embeddings')
      .update({ embedding: vectorLiteral })
      .eq('id', row.id)
      .select(); // .select() forces return of updated row — reveals more

    debug.updateError = updateResult.error ? {
      message: updateResult.error.message,
      details: updateResult.error.details,
      hint: updateResult.error.hint,
      code: updateResult.error.code,
    } : null;
    debug.updateData = updateResult.data;
    debug.updateStatus = updateResult.status;
    debug.updateStatusText = updateResult.statusText;

  } catch (e: any) {
    debug.caughtException = e.message;
    debug.stack = e.stack?.slice(0, 500);
  }

  return NextResponse.json(debug);
}
