
import { NextRequest, NextResponse } from 'next/server';

/**
 * SAFE diagnostic — reveals structure of env vars (length, prefix,
 * whether they contain whitespace/newlines) WITHOUT exposing the
 * actual secret values. Protected by CRON_SECRET like other routes.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  function inspect(name: string, value: string | undefined) {
    if (!value) return { name, present: false };
    return {
      name,
      present: true,
      length: value.length,
      startsWithHttps: value.startsWith('https://'),
      first20: value.slice(0, 20),
      last10: value.slice(-10),
      hasLeadingWhitespace: value !== value.trimStart(),
      hasTrailingWhitespace: value !== value.trimEnd(),
      hasNewline: value.includes('\n') || value.includes('\r'),
      hasSpaceAnywhere: value.includes(' '),
    };
  }

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: inspect('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: inspect('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
    OPENAI_API_KEY: inspect('OPENAI_API_KEY', process.env.OPENAI_API_KEY),
  });
}
