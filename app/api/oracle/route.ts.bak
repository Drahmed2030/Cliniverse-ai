
import { NextRequest, NextResponse } from 'next/server';

const OR_BASE = 'https://openrouter.ai/api/v1';
const OR_KEY  = process.env.OPENROUTER_API_KEY!;
const AN_KEY  = process.env.ANTHROPIC_API_KEY!;

const MODELS: Record<string, any> = {
  claude:   { name: 'Claude 3.5',   icon: '🔵', color: '#0D9488', desc: 'Evidence reasoning',  type: 'anthropic' },
  gemini:   { name: 'Gemini 2.0',   icon: '🟠', color: '#F59E0B', desc: 'Google Research',     type: 'openrouter', model: 'google/gemini-2.0-flash-exp:free' },
  deepseek: { name: 'DeepSeek V3',  icon: '🟢', color: '#10B981', desc: 'Guidelines expert',   type: 'openrouter', model: 'deepseek/deepseek-chat-v3-0324:free' },
  llama:    { name: 'Llama 3.1 70B',icon: '🟣', color: '#7C3AED', desc: 'Medical knowledge',   type: 'openrouter', model: 'meta-llama/llama-3.1-70b-instruct:free' },
};

const SYS = `You are a senior clinical expert. Answer concisely.
Format EXACTLY:
ANSWER: [direct clinical answer 1-2 sentences]
CONFIDENCE: [0-100]
EVIDENCE: [guideline or study name]
CAUTION: [warning or None]
Respond in same language as question.`;

async function callOR(model: string, q: string) {
  const r = await fetch(`${OR_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OR_KEY}`, 'Content-Type': 'application/json',
               'HTTP-Referer': 'https://cliniverseai.com', 'X-Title': 'Cliniverse Oracle' },
    body: JSON.stringify({ model, messages: [{ role:'system', content:SYS },{ role:'user', content:q }],
      max_tokens: 400, temperature: 0.3 }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices?.[0]?.message?.content || '';
}

async function callClaude(q: string) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': AN_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, system: SYS,
      messages: [{ role:'user', content:q }] }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.content?.[0]?.text || '';
}

function parse(text: string) {
  const g = (k: string) => { const m = text.match(new RegExp(`${k}:\\s*([^\\n]+)`, 'i')); return m ? m[1].trim() : ''; };
  const c = parseInt(g('CONFIDENCE') || '75');
  return { answer: g('ANSWER') || text.slice(0,150), confidence: isNaN(c)?75:Math.min(100,Math.max(0,c)),
           evidence: g('EVIDENCE') || 'Clinical judgment', caution: g('CAUTION') || '', raw: text };
}

export async function POST(req: NextRequest) {
  const { question, models: sel = ['claude','gemini','deepseek','llama'] } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: 'No question' }, { status: 400 });

  const results = await Promise.allSettled(sel.map(async (id: string) => {
    const cfg = MODELS[id]; if (!cfg) throw new Error(`Unknown: ${id}`);
    const t = Date.now();
    const raw = cfg.type === 'anthropic' ? await callClaude(question) : await callOR(cfg.model, question);
    return { id, name:cfg.name, icon:cfg.icon, color:cfg.color, desc:cfg.desc,
             ...parse(raw), latency:Date.now()-t, status:'ok' };
  }));

  const responses = results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : {
      id:sel[i], name:MODELS[sel[i]]?.name||sel[i], icon:'❌', color:'#EF4444', desc:'',
      answer:'Failed to respond', confidence:0, evidence:'', caution:'', raw:'',
      latency:0, status:'error', error:(r.reason as Error)?.message,
    }
  );

  const ok = responses.filter(r => r.status === 'ok');
  const avg = ok.length ? Math.round(ok.reduce((s,r) => s+r.confidence,0)/ok.length) : 0;
  const spread = ok.length ? Math.max(...ok.map(r=>r.confidence)) - Math.min(...ok.map(r=>r.confidence)) : 0;
  const has = spread < 25 && ok.length >= 2;

  return NextResponse.json({ question, responses, consensus: {
    score:avg, hasConsensus:has, spread,
    verdict: has ? (avg>=80?'HIGH CONFIDENCE':'MODERATE CONFIDENCE') : 'CONFLICTING VIEWS',
    color: has ? (avg>=80?'#10B981':'#F59E0B') : '#EF4444',
    dissenters: responses.filter(r=>Math.abs(r.confidence-avg)>20).map(r=>r.name),
  }, timestamp: new Date().toISOString() });
}
