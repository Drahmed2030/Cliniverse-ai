
'use client';
import { useState, useRef, useEffect } from 'react';

const MODELS_META = [
  { id: 'claude',   name: 'Claude',   icon: '🔵', color: '#0D9488', desc: 'Evidence reasoning' },
  { id: 'gemini',   name: 'Gemini',   icon: '🟠', color: '#F59E0B', desc: 'Google Research' },
  { id: 'deepseek', name: 'DeepSeek', icon: '🟢', color: '#10B981', desc: 'Guidelines expert' },
  { id: 'llama',    name: 'Llama 70B', icon: '🟣', color: '#7C3AED', desc: 'Medical knowledge' },
];

const EXAMPLES = [
  'LMWH vs UFH in STEMI — which is preferred?',
  'First-line antihypertensive in CKD with proteinuria?',
  'When to start anticoagulation after new AF?',
  'PE — when is CTPA mandatory vs Wells score alone?',
  'Beta-blocker choice in HFrEF (EF <35%)?',
];

export default function ClinicalOracle() {
  const [q, setQ]           = useState('');
  const [sel, setSel]       = useState(['claude','gemini','deepseek','llama']);
  const [loading, setLoading] = useState(false);
  const [result, setResult]  = useState<any>(null);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [dots, setDots]     = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(iv);
  }, [loading]);

  const toggle = (id: string) =>
    setSel(p => p.includes(id) ? (p.length > 1 ? p.filter(x => x !== id) : p) : [...p, id]);

  const ask = async () => {
    if (!q.trim() || loading) return;
    setLoading(true); setResult(null); setExpanded(null);
    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, models: sel }),
      });
      setResult(await res.json());
    } catch { setResult({ error: 'Network error' }); }
    finally { setLoading(false); }
  };

  const C = '#0D9488';

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', paddingBottom:100,
      fontFamily:'-apple-system,"SF Pro Display",sans-serif' }}>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B 60%,#134e4a)',
        padding:'44px 20px 40px', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🔮</div>
        <h1 style={{ fontSize:28, fontWeight:800, color:'#fff', margin:'0 0 6px', letterSpacing:-0.5 }}>
          Clinical Oracle
        </h1>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', margin:0 }}>
          4 AI engines · Consensus scoring · Evidence-based
        </p>
      </div>

      {/* Input Card */}
      <div style={{ margin:'-20px 16px 0', background:'#fff', borderRadius:24,
        padding:20, boxShadow:'0 8px 32px rgba(15,23,42,0.10)', position:'relative', zIndex:2 }}>

        <textarea
          ref={taRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && e.metaKey) ask(); }}
          placeholder="Ask any clinical question…&#10;e.g. STEMI management, drug interaction, diagnostic criteria"
          style={{ width:'100%', minHeight:80, border:'none', outline:'none', resize:'none',
            fontSize:15, color:'#0F172A', background:'transparent', fontFamily:'inherit',
            lineHeight:1.6, boxSizing:'border-box' }}
        />

        {/* Examples */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', padding:'4px 0 8px',
          scrollbarWidth:'none', marginBottom:4 }}>
          {EXAMPLES.map((ex,i) => (
            <div key={i} onClick={() => setQ(ex)} style={{ flexShrink:0,
              background:'#F1F5F9', border:'1px solid #E2E8F0', borderRadius:20,
              padding:'5px 12px', fontSize:11, color:'#475569', cursor:'pointer',
              whiteSpace:'nowrap' }}>
              {ex.slice(0,36)}…
            </div>
          ))}
        </div>

        {/* Model toggles */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
          {MODELS_META.map(m => {
            const on = sel.includes(m.id);
            return (
              <div key={m.id} onClick={() => toggle(m.id)} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'5px 12px', borderRadius:20, cursor:'pointer',
                border:`1.5px solid ${on ? m.color : '#E2E8F0'}`,
                background: on ? `${m.color}18` : '#F8FAFC',
                fontSize:12, fontWeight:600,
                color: on ? m.color : '#94A3B8',
                transition:'all 0.2s',
              }}>
                <span>{m.icon}</span><span>{m.name}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={ask}
          disabled={loading || !q.trim()}
          style={{
            width:'100%', padding:15, borderRadius:16, border:'none', cursor:'pointer',
            fontSize:16, fontWeight:700, color:'#fff',
            background: loading || !q.trim()
              ? '#E2E8F0'
              : 'linear-gradient(135deg,#0D9488,#1E40AF)',
            transition:'all 0.2s',
          }}>
          {loading ? `⏳ Consulting Oracle${dots}` : '🔮 Ask the Oracle'}
        </button>
      </div>

      {/* Loading pulse */}
      {loading && (
        <div style={{ margin:'20px 16px 0', background:'#fff', borderRadius:20,
          padding:24, border:'1px solid #E2E8F0' }}>
          {MODELS_META.filter(m => sel.includes(m.id)).map((m,i) => (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12,
              padding:'10px 0', borderBottom: i < sel.length-1 ? '1px solid #F8FAFC' : 'none' }}>
              <span style={{ fontSize:24 }}>{m.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:m.color }}>{m.name}</div>
                <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>{m.desc}</div>
              </div>
              <div style={{ display:'flex', gap:3 }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width:6, height:6, borderRadius:'50%', background:m.color,
                    opacity: 0.3 + j*0.3,
                    animation:`bounce 1s ${j*0.15}s ease infinite alternate`,
                  }}/>
                ))}
              </div>
            </div>
          ))}
          <style>{`@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-4px)}}`}</style>
        </div>
      )}

      {/* Error */}
      {result?.error && (
        <div style={{ margin:'20px 16px 0', background:'#FEE2E2', borderRadius:16,
          padding:16, fontSize:14, color:'#991B1B' }}>
          ❌ {result.error}
        </div>
      )}

      {/* Results */}
      {result?.responses && !loading && (
        <div style={{ padding:'20px 16px 0' }}>

          {/* Consensus Ring Card */}
          <div style={{
            background:'#fff', borderRadius:24, padding:20, marginBottom:16,
            border:`2px solid ${result.consensus.color}40`,
            boxShadow:`0 4px 24px ${result.consensus.color}20`,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              {/* SVG Ring */}
              <svg width={90} height={90} viewBox="0 0 90 90" style={{ flexShrink:0 }}>
                <circle cx="45" cy="45" r="38" fill="none" stroke="#F1F5F9" strokeWidth="9"/>
                <circle cx="45" cy="45" r="38" fill="none"
                  stroke={result.consensus.color} strokeWidth="9"
                  strokeDasharray={`${2*Math.PI*38*result.consensus.score/100} ${2*Math.PI*38}`}
                  strokeLinecap="round" transform="rotate(-90 45 45)"
                  style={{ transition:'stroke-dasharray 0.8s ease' }}
                />
                <text x="45" y="41" textAnchor="middle" fontSize="20"
                  fontWeight="800" fill={result.consensus.color}>{result.consensus.score}</text>
                <text x="45" y="56" textAnchor="middle" fontSize="9" fill="#94A3B8">consensus</text>
              </svg>

              <div style={{ flex:1 }}>
                {/* Verdict badge */}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  background:`${result.consensus.color}15`,
                  color:result.consensus.color, borderRadius:20,
                  padding:'4px 12px', fontSize:11, fontWeight:700,
                  letterSpacing:0.5, marginBottom:8,
                }}>
                  {result.consensus.hasConsensus ? '✅' : '⚠️'} {result.consensus.verdict}
                </div>

                <div style={{ fontSize:12, color:'#64748B', fontStyle:'italic', lineHeight:1.5 }}>
                  "{result.question.slice(0,80)}{result.question.length>80?'…':''}"
                </div>

                {result.consensus.dissenters?.length > 0 && (
                  <div style={{ fontSize:11, color:'#F59E0B', fontWeight:600, marginTop:6 }}>
                    ⚠️ {result.consensus.dissenters.join(', ')} — different view
                  </div>
                )}
              </div>
            </div>

            {/* Model dots summary */}
            <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
              {result.responses.map((r: any) => (
                <div key={r.id} style={{
                  display:'flex', alignItems:'center', gap:4,
                  background: r.status==='ok' ? `${r.color}12` : '#FEE2E2',
                  borderRadius:20, padding:'4px 10px',
                  fontSize:11, fontWeight:600, color: r.status==='ok' ? r.color : '#EF4444',
                }}>
                  <span>{r.icon}</span>
                  <span>{r.confidence}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual responses */}
          <div style={{ fontSize:13, fontWeight:700, color:'#0F172A', marginBottom:10 }}>
            AI Responses
          </div>

          {result.responses.map((r: any) => (
            <div key={r.id}
              onClick={() => setExpanded(expanded===r.id ? null : r.id)}
              style={{
                background:'#fff', borderRadius:18, padding:'14px 16px',
                marginBottom:10, cursor:'pointer',
                border:`1.5px solid ${expanded===r.id ? r.color : '#E2E8F0'}`,
                transition:'all 0.2s',
              }}>

              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:24 }}>{r.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:r.color }}>{r.name}</span>
                    <span style={{ fontSize:13, fontWeight:800,
                      color: r.confidence>=80?'#10B981':r.confidence>=60?'#F59E0B':'#EF4444' }}>
                      {r.confidence}%
                    </span>
                  </div>
                  <div style={{ height:4, background:'#F1F5F9', borderRadius:4, marginTop:5, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', borderRadius:4,
                      background:`linear-gradient(90deg,${r.color},${r.color}88)`,
                      width:`${r.confidence}%`, transition:'width 0.6s ease',
                    }}/>
                  </div>
                </div>
                <div style={{ fontSize:12, color:'#CBD5E1', marginLeft:4 }}>
                  {expanded===r.id ? '▲' : '▼'}
                </div>
              </div>

              {/* Answer preview */}
              {r.status === 'error' ? (
                <div style={{ fontSize:12, color:'#EF4444', marginTop:8 }}>
                  ❌ {r.error || 'API not configured'}
                </div>
              ) : (
                <div style={{ fontSize:13, color:'#1E293B', marginTop:10,
                  lineHeight:1.6, fontWeight:500 }}>
                  {r.answer}
                </div>
              )}

              {/* Expanded details */}
              {expanded===r.id && r.status==='ok' && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #F1F5F9' }}>
                  {r.evidence && (
                    <div style={{ display:'flex', alignItems:'center', gap:6,
                      background:'#F0FDF9', borderRadius:10, padding:'8px 12px', marginBottom:8 }}>
                      <span style={{ fontSize:14 }}>📄</span>
                      <span style={{ fontSize:12, color:'#047857', fontWeight:600 }}>{r.evidence}</span>
                    </div>
                  )}
                  {r.caution && r.caution !== 'None' && (
                    <div style={{ display:'flex', alignItems:'center', gap:6,
                      background:'#FEF3C7', borderRadius:10, padding:'8px 12px', marginBottom:8 }}>
                      <span style={{ fontSize:14 }}>⚠️</span>
                      <span style={{ fontSize:12, color:'#92400E', fontWeight:600 }}>{r.caution}</span>
                    </div>
                  )}
                  <div style={{ fontSize:11, color:'#CBD5E1', textAlign:'right' }}>
                    ⚡ {r.latency}ms · {r.desc}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Disclaimer */}
          <div style={{ background:'#FEF3C7', borderRadius:14, padding:'10px 14px',
            fontSize:11, color:'#92400E', lineHeight:1.5, marginTop:4 }}>
            ⚠️ <strong>Educational purposes only.</strong> Always apply clinical judgment.
            Not a substitute for professional medical advice or guidelines.
          </div>
        </div>
      )}
    </div>
  );
}
