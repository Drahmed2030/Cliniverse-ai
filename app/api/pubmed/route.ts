import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "cardiology";
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json&sort=relevance`;
  
  try {
    const search = await fetch(url);
    const data = await search.json();
    const ids = data.esearchresult?.idlist || [];
    
    if (ids.length === 0) return NextResponse.json({ results: [] });
    
    const summary = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`);
    const sumData = await summary.json();
    
    const results = ids.map((id: string) => {
      const article = sumData.result?.[id];
      return {
        id,
        title: article?.title || "",
        authors: article?.authors?.map((a: any) => a.name).join(", ") || "",
        journal: article?.fulljournalname || "",
        year: article?.pubdate?.split(" ")[0] || "",
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      };
    });
    
    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ error: "PubMed fetch failed" }, { status: 500 });
  }
}
