
/**
 * OpenAI text-embedding-3-small helper.
 * 1536 dimensions, $0.02/1M tokens — chosen for cost + simplicity
 * over Voyage Medical / Cohere for this stage. Revisit only if
 * clinical text matching accuracy proves insufficient in testing.
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY!;

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // safety truncation
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data[0].embedding as number[];
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  // OpenAI supports batch input directly — cheaper than N separate calls
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts.map(t => t.slice(0, 8000)),
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data.map((d: any) => d.embedding as number[]);
}
