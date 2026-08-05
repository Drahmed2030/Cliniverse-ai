import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { question, specialty } = await request.json();
  
  // 1. Fetch PubMed
  const pubmedRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://cliniverse-ai-u7gi.vercel.app"}/api/pubmed?q=${encodeURIComponent(question)}`);
  const pubmedData = await pubmedRes.json();
  const articles = pubmedData.results?.slice(0, 3) || [];
  
  // 2. Fetch FDA if drug-related
  let fdaData = null;
  const drugKeywords = ["dose", "drug", "medication", "mg", "treatment"];
  const isDrug = drugKeywords.some(k => question.toLowerCase().includes(k));
  if (isDrug) {
    const drugName = question.split(" ").find((w: string) => w.length > 4) || question;
    const fdaRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://cliniverse-ai-u7gi.vercel.app"}/api/fda?drug=${encodeURIComponent(drugName)}`);
    fdaData = await fdaRes.json();
  }

  // 3. Build context
  const pubmedContext = articles.map((a: any) => 
    `- ${a.title} (${a.journal}, ${a.year}) — ${a.url}`
  ).join("\n");
  
  const fdaContext = fdaData && !fdaData.error 
    ? `FDA Drug Info: ${fdaData.name} — Dosage: ${fdaData.dosage?.substring(0, 200)}...`
    : "";

  // 4. Ask Claude
  const prompt = `You are a senior clinical consultant. Answer this medical question concisely and accurately.

Question: ${question}
Specialty: ${specialty || "General Medicine"}

Latest PubMed Evidence:
${pubmedContext || "No recent articles found."}

${fdaContext}

Provide a structured clinical answer with:
1. Direct answer (2-3 sentences)
2. Key evidence points
3. Clinical pearl
4. Sources cited

Keep it practical for a working doctor. Use evidence-based medicine.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const answer = data.content?.[0]?.text || "Unable to generate answer.";

  return NextResponse.json({
    answer,
    sources: articles,
    fdaData: fdaData && !fdaData.error ? fdaData : null
  });
}
