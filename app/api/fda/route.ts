import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drug = searchParams.get("drug") || "metformin";
  const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${encodeURIComponent(drug)}&limit=1`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const result = data.results?.[0];
    
    if (!result) return NextResponse.json({ error: "Drug not found" });
    
    return NextResponse.json({
      name: result.openfda?.generic_name?.[0] || drug,
      brand: result.openfda?.brand_name?.[0] || "",
      dosage: result.dosage_and_administration?.[0] || "See label",
      warnings: result.warnings?.[0] || "",
      contraindications: result.contraindications?.[0] || "",
      source: "FDA"
    });
  } catch (e) {
    return NextResponse.json({ error: "FDA fetch failed" }, { status: 500 });
  }
}
