import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drug = searchParams.get("drug") || "aspirin";
  
  try {
    // Step 1: Get RxCUI
    const searchRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drug)}&search=2`,
      { headers: { "Accept": "application/json" } }
    );
    
    if (!searchRes.ok) throw new Error("RxNorm search failed");
    
    const searchData = await searchRes.json();
    const rxcui = searchData.idGroup?.rxnormId?.[0];
    
    if (!rxcui) return NextResponse.json({ 
      drug, 
      error: "Drug not found in RxNorm",
      suggestion: "Try generic name (e.g. acetylsalicylic acid)"
    });

    // Step 2: Get properties
    const propRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`,
      { headers: { "Accept": "application/json" } }
    );
    const propData = await propRes.json();

    // Step 3: Get interactions
    const intRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${rxcui}&sources=ONCHigh`,
      { headers: { "Accept": "application/json" } }
    );
    const intData = await intRes.json();

    const interactions = intData.interactionTypeGroup?.[0]?.interactionType?.[0]
      ?.interactionPair?.slice(0,5).map((pair: any) => ({
        drug: pair.interactionConcept?.[1]?.minConceptItem?.name || "",
        severity: pair.severity || "unknown",
        description: pair.description || ""
      })) || [];

    return NextResponse.json({
      name: propData.properties?.name || drug,
      rxcui,
      tty: propData.properties?.tty || "",
      language: propData.properties?.language || "",
      interactions,
      interactionCount: interactions.length,
      source: "RxNorm/NIH",
      url: `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${rxcui}`
    });

  } catch (e: any) {
    return NextResponse.json({ 
      error: "RxNorm fetch failed", 
      details: e.message 
    }, { status: 500 });
  }
}
