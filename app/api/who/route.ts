import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") || "hypertension";
  const url = `https://www.who.int/api/news/newsitems?sf_culture=en&$filter=contains(Title,%27${encodeURIComponent(topic)}%27)&$top=3`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = data.value || [];
    
    const results = items.map((item: any) => ({
      title: item.Title || "",
      date: item.PublicationDateAndTime || "",
      url: `https://www.who.int${item.Url || ""}`,
      source: "WHO"
    }));
    
    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ error: "WHO fetch failed" }, { status: 500 });
  }
}
