import { NextResponse } from "next/server";

export const runtime = "nodejs";

// DailyMed/SPL adapter — Batch 8. Server-side proxy to NLM DailyMed's
// public v2 REST API (no API key required, no scraping of arbitrary HTML
// pages). Returns normalized, concise label evidence metadata and a
// source link — never large protected label text. See
// app/lib/clinicalReference/drugLabelEvidence.ts for the normalized
// DrugLabelEvidence contract this feeds.

const DAILYMED_BASE = "https://dailymed.nlm.nih.gov/dailymed/services/v2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drug = searchParams.get("drug");
  const setId = searchParams.get("setId");

  if (!drug && !setId) {
    return NextResponse.json({ error: "Provide either 'drug' or 'setId'" }, { status: 400 });
  }

  try {
    if (setId) {
      const res = await fetch(`${DAILYMED_BASE}/spls/${encodeURIComponent(setId)}.json`);
      if (!res.ok) return NextResponse.json({ error: "Label not found for setId" }, { status: 404 });
      const data = await res.json();
      return NextResponse.json({
        found: true,
        setId,
        title: data?.data?.title ?? null,
        labelVersion: data?.data?.spl_version ?? null,
        effectiveDate: data?.data?.published_date ?? null,
        sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${encodeURIComponent(setId)}`,
        retrievedAt: new Date().toISOString(),
        source: "DailyMed",
      });
    }

    const searchRes = await fetch(`${DAILYMED_BASE}/spls.json?drug_name=${encodeURIComponent(drug as string)}&pagesize=5`);
    const searchData = await searchRes.json();
    const entries: Array<{ setid: string; title: string; spl_version: number; published_date: string }> = searchData?.data ?? [];

    return NextResponse.json({
      query: drug,
      found: entries.length > 0,
      results: entries.map(entry => ({
        setId: entry.setid,
        title: entry.title,
        labelVersion: entry.spl_version,
        effectiveDate: entry.published_date,
        sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${encodeURIComponent(entry.setid)}`,
      })),
      retrievedAt: new Date().toISOString(),
      source: "DailyMed",
    });
  } catch (e: any) {
    return NextResponse.json({ error: "DailyMed lookup failed", details: e?.message }, { status: 500 });
  }
}
