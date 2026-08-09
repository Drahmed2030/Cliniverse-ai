
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

/**
 * Extracts plain text from PDF, DOCX, or TXT files using pure-JS
 * libraries that run directly in the Node runtime — no shell exec,
 * no npx, no external process spawning. This is required for Vercel
 * Serverless Functions, which cannot run ad-hoc CLI installs.
 */
async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    // unpdf is built for serverless/edge Node runtimes — no DOM
    // dependency (unlike pdf-parse, which needs DOMMatrix/Canvas
    // from pdfjs-dist and fails with "DOMMatrix is not defined"
    // on Vercel's server environment).
    const { extractText } = await import('unpdf');
    const uint8 = new Uint8Array(buffer);
    const { text } = await extractText(uint8, { mergePages: true });
    return Array.isArray(text) ? text.join('\n') : text;
  }

  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (name.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${file.name}. Please upload PDF, DOCX, or TXT.`);
}

export async function POST(req: NextRequest) {
  let file: File;
  let question: string;

  try {
    const formData = await req.formData();
    file = formData.get('file') as File;
    question = (formData.get('question') as string) || 'Summarize this document clinically';
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to read upload: ${e.message}` }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured on the server' }, { status: 500 });
  }

  let extractedText: string;
  try {
    extractedText = await extractText(file);
  } catch (e: any) {
    return NextResponse.json({ error: `Text extraction failed: ${e.message}` }, { status: 500 });
  }

  if (!extractedText || extractedText.trim().length < 10) {
    return NextResponse.json({ error: 'Could not extract readable text from this document. It may be a scanned image without OCR, or empty.' }, { status: 422 });
  }

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are a clinical expert analyzing medical documents.
Extract key clinical information: diagnoses, medications, lab results, recommendations.
Format clearly with sections. Be concise and clinically focused.`,
        messages: [{
          role: 'user',
          content: `Document content:\n\n${extractedText.slice(0, 8000)}\n\nQuestion: ${question}`,
        }],
      }),
    });

    const aiData = await aiRes.json();
    if (aiData.error) {
      return NextResponse.json({ error: `Claude API error: ${aiData.error.message}` }, { status: 500 });
    }

    const analysis = aiData.content?.[0]?.text;
    if (!analysis) {
      return NextResponse.json({ error: 'Claude returned an empty response', raw: aiData }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      filename: file.name,
      analysis,
      markdownPreview: extractedText.slice(0, 500),
    });

  } catch (e: any) {
    return NextResponse.json({ error: `AI analysis failed: ${e.message}` }, { status: 500 });
  }
}
