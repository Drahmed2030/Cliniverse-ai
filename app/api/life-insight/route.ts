import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { score, physicalSummary, professionalSummary, mentalSummary, deltas } = body;

  const XAI_KEY = process.env.XAI_API_KEY;
  if (!XAI_KEY) {
    return NextResponse.json({
      insight: "Keep up your clinical excellence today.",
      suggestion: "Take a short walk between cases.",
      tone: "encouraging",
    });
  }

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${XAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        max_tokens: 150,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are a supportive clinical lifestyle coach inside Cliniverse AI. Write 1 short insight (max 2 sentences) and 1 practical suggestion for a physician. Be encouraging, precise, never diagnostic. No medication advice. Return ONLY valid JSON.",
          },
          {
            role: "user",
            content: `Life score: ${score}/100\nPhysical: ${physicalSummary}\nMental: ${mentalSummary}\nProfessional: ${professionalSummary}${deltas ? "\nChange: " + deltas : ""}\n\nReturn JSON: { "insight": string, "suggestion": string, "tone": "encouraging"|"neutral"|"caution" }`,
          },
        ],
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/\`\`\`json|\`\`\`/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      insight: "Your dedication to clinical excellence is building momentum.",
      suggestion: "A 10-minute mindfulness break can sharpen your focus.",
      tone: "encouraging",
    });
  }
}
