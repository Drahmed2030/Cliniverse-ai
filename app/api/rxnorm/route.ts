import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Batch 8 fix: this route was previously mislabeled — despite the "RxNorm
// Lookup" catalog title, its implementation actually called openFDA +
// PubMed (duplicating app/api/fda/route.ts) and never touched RxNorm at
// all. This rewrite makes it a real RxNorm identity adapter against NLM's
// public RxNav REST API (no API key required) — see
// app/lib/clinicalReference/drugIdentity.ts for the normalized
// DrugIdentity contract this feeds.

const RXNAV_BASE = "https://rxnav.nlm.nih.gov/REST";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drug = searchParams.get("drug");

  if (!drug || !drug.trim()) {
    return NextResponse.json({ error: "Missing required 'drug' query parameter" }, { status: 400 });
  }

  try {
    const rxcuiRes = await fetch(`${RXNAV_BASE}/rxcui.json?name=${encodeURIComponent(drug)}&search=1`);
    const rxcuiData = await rxcuiRes.json();
    const rxcui: string | undefined = rxcuiData?.idGroup?.rxnormId?.[0];

    if (!rxcui) {
      return NextResponse.json({
        query: drug,
        found: false,
        error: "No RxNorm identity found for this name",
      });
    }

    const [propsRes, relatedRes] = await Promise.all([
      fetch(`${RXNAV_BASE}/rxcui/${rxcui}/properties.json`),
      fetch(`${RXNAV_BASE}/rxcui/${rxcui}/related.json?tty=BN+IN+SBD+SCD`),
    ]);
    const propsData = await propsRes.json();
    const relatedData = await relatedRes.json();

    const groups: Array<{ tty?: string; conceptProperties?: Array<{ name: string; rxcui: string }> }> =
      relatedData?.relatedGroup?.conceptGroup ?? [];

    const brandNames = groups
      .filter(group => group.tty === "BN")
      .flatMap(group => group.conceptProperties ?? [])
      .map(concept => concept.name);

    const ingredients = groups
      .filter(group => group.tty === "IN")
      .flatMap(group => group.conceptProperties ?? [])
      .map(concept => ({ rxcui: concept.rxcui, name: concept.name }));

    return NextResponse.json({
      query: drug,
      found: true,
      rxcui,
      genericName: propsData?.properties?.name ?? drug,
      synonym: propsData?.properties?.synonym ?? null,
      tty: propsData?.properties?.tty ?? null,
      brandNames: [...new Set(brandNames)],
      ingredientIds: ingredients,
      sourceVersion: "RxNav REST (NLM RxNorm)",
      retrievedAt: new Date().toISOString(),
      source: "RxNorm",
    });
  } catch (e: any) {
    return NextResponse.json({ error: "RxNorm lookup failed", details: e?.message }, { status: 500 });
  }
}
