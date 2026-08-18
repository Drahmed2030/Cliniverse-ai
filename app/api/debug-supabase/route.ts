import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const diagnostics: any = {
    url_present: !!url,
    key_present: !!key,
    url_value: url || 'MISSING',
    key_length: key ? key.length : 0,
    key_first_20: key ? key.slice(0, 20) : 'MISSING',
    key_last_10: key ? key.slice(-10) : 'MISSING',
    vercel_env: process.env.VERCEL_ENV || 'unknown',
    node_env: process.env.NODE_ENV || 'unknown',
  };

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars', diagnostics });
  }

  try {
    const supabase = createClient(url, key);

    const { data, error, count } = await supabase
      .from('evaluation_cases')
      .select('case_number, title', { count: 'exact' })
      .order('case_number')
      .limit(5);

    return NextResponse.json({
      diagnostics,
      query_error: error,
      count,
      data,
    });
  } catch (err) {
    return NextResponse.json({
      diagnostics,
      unhandled_error: String(err),
    });
  }
}
