import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const condition = searchParams.get("condition") || "heart failure";
  
  try {
    const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(condition)}&pageSize=5&sort=LastUpdatePostDate&filter.overallStatus=RECRUITING`;
    const res = await fetch(url);
    const data = await res.json();
    
    const trials = data.studies?.map((study: any) => ({
      nctId: study.protocolSection?.identificationModule?.nctId,
      title: study.protocolSection?.identificationModule?.briefTitle,
      status: study.protocolSection?.statusModule?.overallStatus,
      phase: study.protocolSection?.designModule?.phases?.[0] || "N/A",
      sponsor: study.protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name,
      lastUpdated: study.protocolSection?.statusModule?.lastUpdatePostDateStruct?.date,
      url: `https://clinicaltrials.gov/study/${study.protocolSection?.identificationModule?.nctId}`
    })) || [];

    return NextResponse.json({ trials, condition });
  } catch (e) {
    return NextResponse.json({ error: "ClinicalTrials fetch failed" }, { status: 500 });
  }
}
