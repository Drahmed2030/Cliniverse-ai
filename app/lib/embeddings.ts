
/**
 * OpenAI text-embedding-3-small helper.
 * 1536 dimensions, $0.02/1M tokens — chosen for cost + simplicity
 * over Voyage Medical / Cohere for this stage.
 *
 * IMPORTANT: explicit 15s timeout via AbortController — without this,
 * a slow/unreachable OpenAI call hangs the entire request with NO
 * response at all (not even an error), which is very hard to debug
 * from outside (curl just shows nothing, browser shows nothing).
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY!;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error(`OpenAI request timed out after ${timeoutMs}ms`);
    }
    throw e;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY is not set');

  const res = await fetchWithTimeout('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.data?.[0]?.embedding) throw new Error('Unexpected OpenAI response shape: ' + JSON.stringify(data).slice(0, 200));
  return data.data[0].embedding as number[];
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY is not set');

  const res = await fetchWithTimeout('https://api.openai.com/v1/embeddings', {
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
