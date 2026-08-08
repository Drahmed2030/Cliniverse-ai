
import { NextRequest, NextResponse } from 'next/server';

const MODELS = {
  claude: {
    name: 'Claude 3.5',
    icon: '🔵',
    color: '#0D9488',
    baseURL: 'https://api.anthropic.com/v1',
    key: process.env.ANTHROPIC_API_KEY!,
    type: 'anthropic',
  },
  deepseek: {
    name: 'DeepSeek V3',
    icon: '🟢',
    color: '#10B981',
    baseURL: 'https://api.deepseek.com/v1',
    key: process.env.DEEPSEEK_API_KEY!,
    type: 'openai',
  },
  nvidia: {
    name: 'NVIDIA Llama Medical',
    icon: '🟣',
    color: '#7C3AED',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    key: process.env.NVIDIA_API_KEY!,
    type: 'openai',
    model: 'meta/llama-3.1-70b-instruct',
  },
  gemini: {
    name: 'Gemini 2.0 Flash',
    icon: '🟠',
    color: '#F59E0B',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    key: process.env.GEMINI_API_KEY!,
    type: 'gemini',
    model: 'gemini-2.0-flash',
  },
};

const SYSTEM_PROMPT = `You are a clinical expert AI. Answer concisely and precisely.
Format: 
1. ANSWER: [direct clinical answer]
2. CONFIDENCE: [0-100]%
3. EVIDENCE: [guideline or study name]
4. CAUTION: [any warning if needed]
Respond in the same language as the question.`;

async function queryOpenAI(cfg: any, question: string): Promise<any> {
  const model = cfg.model || 'deepseek-chat';
  const res = await fetch(`${cfg.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response';
}

async function queryGemini(cfg: any, question: string): Promise<string> {
  const res = await fetch(
    `${cfg.baseURL}/models/${cfg.model}:generateContent?key=${cfg.key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nQuestion: ${question}` }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

async function queryClaude(cfg: any, question: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': cfg.key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || 'No response';
}

function extractConfidence(text: string): number {
  const match = text.match(/CONFIDENCE[:\s]+(\d+)/i);
  return match ? parseInt(match[1]) : 75;
}

function extractEvidence(text: string): string {
  const match = text.match(/EVIDENCE[:\s]+([^\n]+)/i);
  return match ? match[1].trim() : 'Clinical judgment';
}

function extractAnswer(text: string): string {
  const match = text.match(/ANSWER[:\s]+([^\n]+)/i);
  return match ? match[1].trim() : text.slice(0, 120);
}

export async function POST(req: NextRequest) {
  const { question, models: selectedModels = ['claude', 'deepseek', 'nvidia', 'kimi'] } = await req.json();

  if (!question) return NextResponse.json({ error: 'No question' }, { status: 400 });

  // Query all selected models in parallel
  const results = await Promise.allSettled(
    selectedModels.map(async (modelId: string) => {
      const cfg = MODELS[modelId as keyof typeof MODELS];
      if (!cfg || !cfg.key) throw new Error(`No key for ${modelId}`);

      const start = Date.now();
      let rawText = '';

      if (cfg.type === 'anthropic') {
        rawText = await queryClaude(cfg, question);
      } else if (cfg.type === 'gemini') {
        rawText = await queryGemini(cfg, question);
      } else {
        rawText = await queryOpenAI(cfg, question);
      }

      return {
        id: modelId,
        name: cfg.name,
        icon: cfg.icon,
        color: cfg.color,
        answer: extractAnswer(rawText),
        confidence: extractConfidence(rawText),
        evidence: extractEvidence(rawText),
        rawText,
        latency: Date.now() - start,
        status: 'success',
      };
    })
  );

  const responses = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      id: selectedModels[i],
      name: MODELS[selectedModels[i] as keyof typeof MODELS]?.name || selectedModels[i],
      icon: '❌',
      color: '#EF4444',
      answer: 'Failed to respond',
      confidence: 0,
      evidence: '',
      rawText: '',
      latency: 0,
      status: 'error',
      error: r.reason?.message,
    };
  });

  // Calculate consensus
  const successful = responses.filter(r => r.status === 'success');
  const avgConfidence = successful.length
    ? Math.round(successful.reduce((a, b) => a + b.confidence, 0) / successful.length)
    : 0;

  // Detect dissent (confidence variance > 25)
  const confidences = successful.map(r => r.confidence);
  const maxDiff = Math.max(...confidences) - Math.min(...confidences);
  const hasConsensus = maxDiff < 25 && successful.length >= 2;

  return NextResponse.json({
    question,
    responses,
    consensus: {
      score: avgConfidence,
      hasConsensus,
      verdict: hasConsensus
        ? avgConfidence >= 80
          ? 'HIGH CONFIDENCE'
          : 'MODERATE CONFIDENCE'
        : 'CONFLICTING VIEWS',
      color: hasConsensus
        ? avgConfidence >= 80 ? '#10B981' : '#F59E0B'
        : '#EF4444',
      dissentCount: responses.filter(r => Math.abs(r.confidence - avgConfidence) > 25).length,
    },
    timestamp: new Date().toISOString(),
  });
}
