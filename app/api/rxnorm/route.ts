import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drug = searchParams.get("drug") || "aspirin";
  
  try {
    // Get RxCUI
    const searchRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drug)}&search=2`
    );
    const searchData = await searchRes.json();
    const rxcui = searchData.idGroup?.rxnormId?.[0];
    
    if (!rxcui) return NextResponse.json({ error: "Drug not found" });

    // Get drug info
    const [propertiesRes, interactionsRes] = await Promise.all([
      fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`),
      fetch(`https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${rxcui}`)
    ]);

    const properties = await propertiesRes.json();
    const interactions = await interactionsRes.json();

    const interactionList = interactions.interactionTypeGroup?.[0]?.interactionType?.[0]
      ?.interactionPair?.slice(0,5).map((pair: any) => ({
        drug: pair.interactionConcept?.[1]?.minConceptItem?.name || "",
        severity: pair.severity || "unknown",
        description: pair.description || ""
      })) || [];

    return NextResponse.json({
      name: properties.properties?.name || drug,
      rxcui,
      synonym: properties.properties?.synonym || "",
      interactions: interactionList,
      source: "RxNorm/NIH"
    });
  } catch (e) {
    return NextResponse.json({ error: "RxNorm fetch failed" }, { status: 500 });
  }
}
