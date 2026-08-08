
import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_KEY  = process.env.OPENROUTER_API_KEY!;
const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY!;

const MODELS = {
  claude: {
    name: 'Claude 3.5 Sonnet',
    icon: '🔵',
    color: '#0D9488',
    desc: 'Evidence-based reasoning',
    type: 'anthropic',
  },
  gemini: {
    name: 'Gemini 2.0 Flash',
    icon: '🟠',
    color: '#F59E0B',
    desc: 'Google Research AI',
    type: 'openrouter',
    model: 'google/gemini-2.0-flash-exp:free',
  },
  deepseek: {
    name: 'DeepSeek V3',
    icon: '🟢',
    color: '#10B981',
    desc: 'Clinical guidelines expert',
    type: 'openrouter',
    model: 'deepseek/deepseek-chat-v3-0324:free',
  },
  llama: {
    name: 'Llama 3.1 70B',
    icon: '🟣',
    color: '#7C3AED',
    desc: 'Medical knowledge base',
    type: 'openrouter',
    model: 'meta-llama/llama-3.1-70b-instruct:free',
  },
};

const SYSTEM = `You are a senior clinical expert. Answer concisely.
Format your response EXACTLY like this:
ANSWER: [direct clinical answer in 1-2 sentences]
CONFIDENCE: [number 0-100]
EVIDENCE: [guideline or study, e.g. "ESC 2023" or "NEJM 2024"]
CAUTION: [important warning or "None"]
Respond in the same language as the question.`;

async function callOpenRouter(model: string, question: string): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cliniverseai.com',
      'X-Title': 'Cliniverse AI Oracle',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: question },
      ],
      max_tokens: 400,
      temperature: 0.3,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || '';
}

async function callClaude(question: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: 'user', content: question }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || '';
}

function parse(text: string) {
  const get = (key: string) => {
    const m = text.match(new RegExp(`${key}:\\s*([^\\n]+)`, 'i'));
    return m ? m[1].trim() : '';
  };
  const conf = parseInt(get('CONFIDENCE') || '75');
  return {
    answer:     get('ANSWER')     || text.slice(0, 150),
    confidence: isNaN(conf) ? 75 : Math.min(100, Math.max(0, conf)),
    evidence:   get('EVIDENCE')   || 'Clinical judgment',
    caution:    get('CAUTION')    || '',
    raw:        text,
  };
}

export async function POST(req: NextRequest) {
  const { question, models: sel = ['claude','gemini','deepseek','llama'] } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: 'No question' }, { status: 400 });

  const results = await Promise.allSettled(
    sel.map(async (id: string) => {
      const cfg = MODELS[id as keyof typeof MODELS];
      if (!cfg) throw new Error(`Unknown model: ${id}`);
      const start = Date.now();
      const raw = cfg.type === 'anthropic'
        ? await callClaude(question)
        : await callOpenRouter(cfg.model!, question);
      const parsed = parse(raw);
      return {
        id,
        name: cfg.name,
        icon: cfg.icon,
        color: cfg.color,
        desc: cfg.desc,
        ...parsed,
        latency: Date.now() - start,
        status: 'ok',
      };
    })
  );

  const responses = results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          id: sel[i],
          name: MODELS[sel[i] as keyof typeof MODELS]?.name || sel[i],
          icon: '❌', color: '#EF4444', desc: '',
          answer: 'Failed to respond',
          confidence: 0, evidence: '', caution: '', raw: '',
          latency: 0, status: 'error',
          error: (r.reason as Error)?.message,
        }
  );

  const ok = responses.filter(r => r.status === 'ok');
  const avgConf = ok.length ? Math.round(ok.reduce((s, r) => s + r.confidence, 0) / ok.length) : 0;
  const spread = ok.length ? Math.max(...ok.map(r => r.confidence)) - Math.min(...ok.map(r => r.confidence)) : 0;
  const hasConsensus = spread < 25 && ok.length >= 2;

  return NextResponse.json({
    question,
    responses,
    consensus: {
      score: avgConf,
      hasConsensus,
      spread,
      verdict: hasConsensus
        ? avgConf >= 80 ? 'HIGH CONFIDENCE' : 'MODERATE CONFIDENCE'
        : 'CONFLICTING VIEWS',
      color: hasConsensus ? (avgConf >= 80 ? '#10B981' : '#F59E0B') : '#EF4444',
      dissenters: responses.filter(r => Math.abs(r.confidence - avgConf) > 20).map(r => r.name),
    },
    timestamp: new Date().toISOString(),
  });
}
