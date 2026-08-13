/**
 * app/api/medfeed/route.ts
 * Fetches recent PubMed articles by specialty
 * No API key required for low volume (NCBI_API_KEY optional in .env.local)
 */

import { NextRequest, NextResponse } from "next/server";

const SPECIALTY_TERMS: Record<string, string> = {
  all: "clinical guidelines[ti] 2025[dp]",
  cardiology: "cardiology heart failure SGLT2 guidelines[ti]",
  emergency: "emergency medicine resuscitation guidelines[ti]",
  internal: "internal medicine diabetes hypertension guidelines[ti]",
  neurology: "neurology stroke management guidelines[ti]",
  surgery: "surgery perioperative management guidelines[ti]",
};

const NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const API_KEY = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : "";

export async function GET(req: NextRequest) {
  const specialty = req.nextUrl.searchParams.get("specialty") || "all";
  const term = SPECIALTY_TERMS[specialty] || SPECIALTY_TERMS.all;

  try {
    // Step 1: Search for PMIDs
    const searchUrl =
      `${NCBI_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}` +
      `&retmax=10&sort=date&retmode=json${API_KEY}`;

    const searchRes = await fetch(searchUrl, { next: { revalidate: 3600 } });
    if (!searchRes.ok) throw new Error("PubMed search failed");
    const searchData = await searchRes.json();
    const ids: string[] = searchData.esearchresult?.idlist || [];

    if (ids.length === 0) {
      return NextResponse.json({ ok: true, items: [] });
    }

    // Step 2: Fetch summaries
    const summaryUrl =
      `${NCBI_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(",")}` +
      `&retmode=json${API_KEY}`;

    const summaryRes = await fetch(summaryUrl, { next: { revalidate: 3600 } });
    if (!summaryRes.ok) throw new Error("PubMed summary failed");
    const summaryData = await summaryRes.json();
    const result = summaryData.result || {};

    const items = ids
      .filter((id) => result[id])
      .map((id) => {
        const doc = result[id];
        const pubYear = doc.pubdate?.split(" ")[0] || "2025";
        const isNew = parseInt(pubYear) >= 2025;
        const authors =
          doc.authors?.slice(0, 2).map((a: { name: string }) => a.name).join(", ") +
          (doc.authors?.length > 2 ? " et al." : "");

        return {
          pmid: id,
          title: doc.title || "Untitled",
          authors: authors || "Unknown authors",
          journal: doc.source || "",
          year: pubYear,
          isNew,
          specialty,
        };
      });

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("MedFeed error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load feed", items: [] },
      { status: 500 }
    );
  }
}
