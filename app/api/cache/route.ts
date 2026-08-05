import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });
    
    const { data } = await supabase
      .from("api_cache")
      .select("*")
      .eq("cache_key", key)
      .gt("expires_at", new Date().toISOString())
      .single();
      
    return NextResponse.json({ data: data?.content || null, hit: !!data });
  } catch (e) {
    return NextResponse.json({ error: "Cache error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { key, content, hours = 24 } = await request.json();
    const expires = new Date();
    expires.setHours(expires.getHours() + hours);
    
    await supabase.from("api_cache").upsert({
      cache_key: key,
      content,
      expires_at: expires.toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "cache_key" });
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Cache error" }, { status: 500 });
  }
}
