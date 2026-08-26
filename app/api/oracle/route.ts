import { NextRequest, NextResponse } from 'next/server';

const OR_BASE  = 'https://openrouter.ai/api/v1';
const OR_KEY   = process.env.OPENROUTER_API_KEY!;
const AN_KEY   = process.env.ANTHROPIC_API_KEY!;
const XAI_KEY  = process.env.XAI_API_KEY!;
const GM_KEY   = process.env.GOOGLE_AI_API_KEY!;

const RELEASE_ORACLE_ENABLED = process.env.RELEASE_ENABLE_ORACLE === 'true';

// ── Model Registry ─────────────────────────────────────────────────────
const MODELS: Record<string, any> = {
  claude: {
    name: 'Claude 4', icon: '🔵', color: '#0D9488',
    desc: 'Evidence & reasoning', type: 'anthropic', weight: 1.0,
  },
  grok: {
    name: 'Grok 2', icon: '⚡', color: '#1DA1F2',
    desc: 'Real-time medical knowledge', type: 'xai',
    model: 'grok-2-latest', weight: 0.90,
  },
  deepseek: {
    name: 'DeepSeek V3', icon: '🟢', color: '#10B981',
    desc: 'Guidelines & literature', type: 'openrouter',
    model: 'deepseek/deepseek-chat-v3-0324', weight: 0.80,
  },
  llama: {
    name: 'Llama 3.1 70B', icon: '🟣', color: '#7C3AED',
    desc: 'Broad medical knowledge', type: 'openrouter',
    model: 'meta-llama/llama-3.1-70b-instruct', weight: 0.70,
  },
};

const SYS = `You are a senior clinical expert providing evidence-based educational support.
Format your response EXACTLY like this:
ANSWER: [direct educational answer, 1-3 sentences]
CONFIDENCE: [0-100, your model certainty level]
EVIDENCE: [specific guideline, study, or source]
KEY_POINTS: [3 key educational points, semicolon-separated]
CAUTION: [important warning or contraindication, or None]
Respond in the same language as the question.`;

async function callClaude(q: string): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': AN_KEY, 'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6', max_tokens: 500, system: SYS,
      messages: [{ role: 'user', content: q }],
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.content?.[0]?.text || '';
}

async function callGrok(q: string): Promise<string> {
  const r = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${XAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-2-latest',
      messages: [
        { role: 'system', content: SYS },
        { role: 'user', content: q },
      ],
      max_tokens: 500, temperature: 0.3,
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
  return d.choices?.[0]?.message?.content || '';
}

async function callGemini(q: string): Promise<string> {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GM_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYS }] },
        contents: [{ parts: [{ text: q }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
      }),
    }
  );
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOR(model: string, q: string): Promise<string> {
  const r = await fetch(`${OR_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OR_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cliniverseai.com',
      'X-Title': 'Cliniverse Oracle',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYS },
        { role: 'user', content: q },
      ],
      max_tokens: 500, temperature: 0.3,
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices?.[0]?.message?.content || '';
}

function parse(text: string) {
  const g = (k: string) => {
    const m = text.match(new RegExp(`${k}:\\s*([^\\n]+)`, 'i'));
    return m ? m[1].trim() : '';
  };
  const c = parseInt(g('CONFIDENCE') || '75');
  const keyPointsRaw = g('KEY_POINTS');
  const keyPoints = keyPointsRaw
    ? keyPointsRaw.split(';').map(p => p.trim()).filter(Boolean)
    : [];
  return {
    answer: g('ANSWER') || text.slice(0, 200),
    confidence: isNaN(c) ? 75 : Math.min(100, Math.max(0, c)),
    evidence: g('EVIDENCE') || 'Clinical judgment',
    keyPoints,
    caution: g('CAUTION') || '',
    raw: text,
  };
}

function analyzeConsensus(responses: any[]) {
  const ok = responses.filter(r => r.status === 'ok');
  if (ok.length === 0) return { score: 0, agreedPoints: [], conflictingPoints: [], verdict: 'NO_DATA' };

  const allPoints: string[] = ok.flatMap(r => r.keyPoints || []);
  const pointCount: Record<string, number> = {};
  allPoints.forEach(pt => {
    const key = pt.toLowerCase().slice(0, 30);
    pointCount[key] = (pointCount[key] || 0) + 1;
  });

  const agreedPoints = Object.entries(pointCount)
    .filter(([, count]) => count >= Math.ceil(ok.length * 0.6))
    .map(([pt]) => allPoints.find(p => p.toLowerCase().startsWith(pt)) || pt);

  const totalWeight = ok.reduce((s, r) => s + (MODELS[r.id]?.weight || 0.7), 0);
  const weightedScore = Math.round(
    ok.reduce((s, r) => s + r.confidence * (MODELS[r.id]?.weight || 0.7), 0) / totalWeight
  );

  const confidences = ok.map(r => r.confidence);
  const spread = Math.max(...confidences) - Math.min(...confidences);
  const hasConsensus = spread < 25 && ok.length >= 2;

  const seriousCautions = ok.filter(r =>
    r.caution && r.caution !== 'None' && r.caution.length > 5
  ).length;
  const safetyPenalty = seriousCautions >= 2 ? 10 : 0;
  const finalScore = Math.max(0, weightedScore - safetyPenalty);

  const conflictingPoints = ok
    .filter(r => Math.abs(r.confidence - weightedScore) > 20)
    .map(r => ({ model: r.name, position: r.answer.slice(0, 100) }));

  let verdict: string;
  if (!hasConsensus) verdict = 'CONFLICTING_VIEWS';
  else if (finalScore >= 85) verdict = 'HIGH_CONFIDENCE';
  else if (finalScore >= 70) verdict = 'MODERATE_CONFIDENCE';
  else verdict = 'LOW_CONFIDENCE';

  return {
    score: finalScore,
    weightedScore,
    spread,
    hasConsensus,
    agreedPoints: agreedPoints.slice(0, 5),
    conflictingPoints,
    seriousCautions,
    safetyPenalty,
    verdict,
    color: !hasConsensus ? '#EF4444' : finalScore >= 85 ? '#10B981' : finalScore >= 70 ? '#F59E0B' : '#EF4444',
    dissenters: ok.filter(r => Math.abs(r.confidence - weightedScore) > 20).map(r => r.name),
    modelsUsed: ok.map(r => r.name),
  };
}

export async function POST(req: NextRequest) {
  if (!RELEASE_ORACLE_ENABLED) {
    return NextResponse.json(
      { error: 'Clinical Intelligence is disabled in this release pending AI consent and clinical-safety review.' },
      { status: 503 },
    );
  }

  const {
    question,
    models: sel = ['claude', 'grok', 'gemini', 'deepseek', 'llama'],
  } = await req.json();

  if (!question?.trim()) {
    return NextResponse.json({ error: 'No question' }, { status: 400 });
  }

  const results = await Promise.allSettled(
    sel.map(async (id: string) => {
      const cfg = MODELS[id];
      if (!cfg) throw new Error(`Unknown model: ${id}`);
      const t = Date.now();
      let raw = '';
      switch (cfg.type) {
        case 'anthropic': raw = await callClaude(question); break;
        case 'xai': raw = await callGrok(question); break;
        case 'gemini': raw = await callGemini(question); break;
        case 'openrouter': raw = await callOR(cfg.model, question); break;
        default: throw new Error(`Unknown type: ${cfg.type}`);
      }
      return {
        id, name: cfg.name, icon: cfg.icon, color: cfg.color,
        desc: cfg.desc, weight: cfg.weight,
        ...parse(raw), latency: Date.now() - t, status: 'ok',
      };
    })
  );

  const responses = results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : {
      id: sel[i], name: MODELS[sel[i]]?.name || sel[i],
      icon: '❌', color: '#EF4444', desc: '',
      answer: 'Failed to respond', confidence: 0,
      evidence: '', keyPoints: [], caution: '',
      raw: '', latency: 0, status: 'error',
      error: 'Provider unavailable',
    }
  );

  const consensus = analyzeConsensus(responses);
  const best = responses
    .filter(r => r.status === 'ok')
    .sort((a, b) => (b.confidence * (MODELS[b.id]?.weight || 0.7)) - (a.confidence * (MODELS[a.id]?.weight || 0.7)))[0];

  return NextResponse.json({
    question,
    responses,
    consensus,
    summary: best?.answer || '',
    recommendation: consensus.hasConsensus
      ? 'Multiple model perspectives are available for educational review.'
      : 'Model perspectives differ. Refer to official guidelines and local clinical protocols.',
    timestamp: new Date().toISOString(),
  });
}
