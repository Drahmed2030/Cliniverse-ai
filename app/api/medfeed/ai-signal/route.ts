/**
 * app/api/medfeed/ai-signal/route.ts
 * Generates AI clinical summary for a PubMed article (PRO only — enforce on client)
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { title, pmid } = await req.json();

    if (!title) {
      return NextResponse.json({ ok: false, error: "No title provided" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content:
            `You are a senior clinician summarizing a medical paper for busy doctors.\n\n` +
            `Paper title: "${title}"\nPubMed ID: ${pmid}\n\n` +
            `Give a 2-3 sentence clinical signal: What changed? What should doctors know? ` +
            `What is the practice implication? Be precise and evidence-based. ` +
            `Do not say "I" or "this paper". Start directly with the finding.`,
        },
      ],
    });

    const signal =
      response.content[0]?.type === "text" ? response.content[0].text : "Signal unavailable.";

    return NextResponse.json({ ok: true, signal });
  } catch (err) {
    console.error("AI Signal error:", err);
    return NextResponse.json({ ok: false, error: "Signal generation failed" }, { status: 500 });
  }
}
