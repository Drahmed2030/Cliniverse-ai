import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drug = searchParams.get("drug") || "metformin";
  
  try {
    // WHO Essential Medicines List (static curated data + PubMed)
    const pubmedRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(drug)}+WHO+essential+medicine+guideline&retmax=3&retmode=json&sort=relevance`
    );
    const pubmedData = await pubmedRes.json();
    const ids = pubmedData.esearchresult?.idlist || [];
    
    let articles = [];
    if (ids.length > 0) {
      const summaryRes = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`
      );
      const summaryData = await summaryRes.json();
      articles = ids.map((id: string) => {
        const a = summaryData.result?.[id];
        return {
          title: a?.title || "",
          journal: a?.fulljournalname || "",
          year: a?.pubdate?.split(" ")?.[0] || "",
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
        };
      });
    }

    return NextResponse.json({
      drug,
      whoStatus: "Essential Medicine",
      articles,
      source: "WHO + PubMed"
    });
  } catch (e) {
    return NextResponse.json({ error: "WHO fetch failed" }, { status: 500 });
  }
}
