import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drug = searchParams.get("drug") || "aspirin";
  
  try {
    // Use OpenFDA for drug info + interactions
    const [fdaRes, pubmedRes] = await Promise.all([
      fetch(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(drug)}"&limit=1`),
      fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(drug)}+drug+interaction&retmax=3&retmode=json`)
    ]);

    const fdaData = await fdaRes.json();
    const pubmedData = await pubmedRes.json();
    const result = fdaData.results?.[0];

    if (!result) return NextResponse.json({ 
      drug,
      error: "Drug not found",
      suggestion: "Try generic name"
    });

    // Get PubMed articles
    const ids = pubmedData.esearchresult?.idlist || [];
    let articles = [];
    if (ids.length > 0) {
      const sumRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`);
      const sumData = await sumRes.json();
      articles = ids.map((id: string) => ({
        title: sumData.result?.[id]?.title || "",
        year: sumData.result?.[id]?.pubdate?.split(" ")?.[0] || "",
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      }));
    }

    return NextResponse.json({
      name: result.openfda?.generic_name?.[0] || drug,
      brandName: result.openfda?.brand_name?.[0] || "",
      manufacturer: result.openfda?.manufacturer_name?.[0] || "",
      drugClass: result.openfda?.pharm_class_epc?.[0] || "",
      dosage: result.dosage_and_administration?.[0]?.substring(0, 300) || "",
      warnings: result.warnings?.[0]?.substring(0, 300) || "",
      contraindications: result.contraindications?.[0]?.substring(0, 200) || "",
      interactions: result.drug_interactions?.[0]?.substring(0, 300) || "",
      sideEffects: result.adverse_reactions?.[0]?.substring(0, 200) || "",
      pubmedArticles: articles,
      source: "FDA + PubMed"
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: "Drug lookup failed",
      details: e.message 
    }, { status: 500 });
  }
}
