/**
 * app/api/ward/case-evidence/route.ts
 * Returns related PubMed evidence for a Ward patient case
 */

import { NextRequest, NextResponse } from "next/server";

// Maps templateId → PubMed search terms
const EVIDENCE_MAP: Record<string, string> = {
  stemi_anterior:   "STEMI anterior myocardial infarction treatment guidelines 2025",
  cap_severe:       "community acquired pneumonia severe treatment guidelines",
  dka:              "diabetic ketoacidosis management guidelines",
  stroke_ischemic:  "ischemic stroke thrombolysis guidelines 2025",
  preeclampsia:     "preeclampsia management treatment guidelines",
  postop_ulcer:     "peptic ulcer perforation postoperative management",
};

const NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const API_KEY = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : "";

// Relevance scoring — simple keyword match
function scoreRelevance(title: string, term: string): "High" | "Moderate" {
  const keywords = term.toLowerCase().split(" ").filter((w) => w.length > 4);
  const titleLower = title.toLowerCase();
  const matches = keywords.filter((k) => titleLower.includes(k)).length;
  return matches >= 3 ? "High" : "Moderate";
}

export async function GET(req: NextRequest) {
  const templateId = req.nextUrl.searchParams.get("templateId") || "";
  const diagnosis  = req.nextUrl.searchParams.get("diagnosis") || "";

  // Resolve search term
  const term =
    EVIDENCE_MAP[templateId] ||
    (diagnosis ? `${diagnosis} management guidelines` : "clinical guidelines 2025");

  try {
    // Step 1: Search
    const searchUrl =
      `${NCBI_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}` +
      `&retmax=6&sort=relevance&retmode=json${API_KEY}`;

    const searchRes = await fetch(searchUrl, { next: { revalidate: 7200 } });
    if (!searchRes.ok) throw new Error("PubMed search failed");
    const searchData = await searchRes.json();
    const ids: string[] = searchData.esearchresult?.idlist || [];

    if (ids.length === 0) {
      return NextResponse.json({ ok: true, items: [] });
    }

    // Step 2: Summaries
    const summaryUrl =
      `${NCBI_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(",")}` +
      `&retmode=json${API_KEY}`;

    const summaryRes = await fetch(summaryUrl, { next: { revalidate: 7200 } });
    if (!summaryRes.ok) throw new Error("PubMed summary failed");
    const summaryData = await summaryRes.json();
    const result = summaryData.result || {};

    const items = ids
      .filter((id) => result[id])
      .map((id) => {
        const doc = result[id];
        const pubYear = doc.pubdate?.split(" ")[0] || "2025";
        const authors =
          doc.authors?.slice(0, 2).map((a: { name: string }) => a.name).join(", ") +
          (doc.authors?.length > 2 ? " et al." : "");

        return {
          pmid:      id,
          title:     doc.title || "Untitled",
          authors:   authors || "Unknown authors",
          journal:   doc.source || "",
          year:      pubYear,
          relevance: scoreRelevance(doc.title || "", term),
        };
      })
      // High relevance first
      .sort((a, b) => (a.relevance === "High" ? -1 : 1));

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("Case evidence error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load evidence", items: [] },
      { status: 500 }
    );
  }
}
