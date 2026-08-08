
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const question = formData.get('question') as string || 'Summarize this document';

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  // Save temp file
  const bytes = await file.arrayBuffer();
  const tmpPath = path.join(os.tmpdir(), `cliniverse_${Date.now()}_${file.name}`);
  await writeFile(tmpPath, Buffer.from(bytes));

  try {
    // Convert to markdown via firecrawl/anydoc
    const mdPath = tmpPath + '.md';
    await execAsync(`npx @firecrawl/anydoc "${tmpPath}" -o "${mdPath}"`);
    const markdown = await readFile(mdPath, 'utf-8');

    // Clean up
    await unlink(tmpPath).catch(() => {});
    await unlink(mdPath).catch(() => {});

    // Send to Claude for analysis
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
          content: `Document content:\n\n${markdown.slice(0, 8000)}\n\nQuestion: ${question}`,
        }],
      }),
    });

    const aiData = await aiRes.json();
    const analysis = aiData.content?.[0]?.text || 'Analysis failed';

    return NextResponse.json({ 
      success: true,
      filename: file.name,
      analysis,
      markdownPreview: markdown.slice(0, 500),
    });

  } catch (e: any) {
    await unlink(tmpPath).catch(() => {});
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
