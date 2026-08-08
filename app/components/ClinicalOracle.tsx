
'use client';
import { useState, useRef } from 'react';

interface OracleResponse {
  id: string;
  name: string;
  icon: string;
  color: string;
  answer: string;
  confidence: number;
  evidence: string;
  latency: number;
  status: string;
  error?: string;
}

interface OracleResult {
  question: string;
  responses: OracleResponse[];
  consensus: {
    score: number;
    hasConsensus: boolean;
    verdict: string;
    color: string;
    dissentCount: number;
  };
}

const EXAMPLE_QUESTIONS = [
  "LMWH vs UFH in STEMI — which is preferred?",
  "First-line antihypertensive in CKD with proteinuria?",
  "When to start anticoagulation after AF diagnosis?",
  "PE diagnosis — when is CTPA mandatory?",
  "Beta-blocker choice in heart failure with EF <35%?",
];

const MODELS_INFO = [
  { id: 'claude',    name: 'Claude',    icon: '🔵', color: '#0D9488', desc: 'Evidence reasoning' },
  { id: 'deepseek',  name: 'DeepSeek',  icon: '🟢', color: '#10B981', desc: 'Guidelines expert' },
  { id: 'nvidia',    name: 'NVIDIA',    icon: '🟣', color: '#7C3AED', desc: 'Biomedical AI' },
  { id: 'gemini',    name: 'Gemini 2.0', icon: '🟠', color: '#F59E0B', desc: 'Google Research AI' },
];

export default function ClinicalOracle() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OracleResult | null>(null);
  const [selectedModels, setSelectedModels] = useState(['claude', 'deepseek', 'nvidia', 'gemini']);
  const [activeTab, setActiveTab] = useState<'oracle' | 'detail'>('oracle');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleModel = (id: string) => {
    setSelectedModels(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const ask = async () => {
    if (!question.trim() || loading || selectedModels.length === 0) return;
    setLoading(true);
    setResult(null);
    setActiveTab('oracle');
    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, models: selectedModels }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const S = {
    wrap: {
      minHeight: '100vh',
      background: '#F8FAFC',
      padding: '0 0 100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    } as React.CSSProperties,

    hero: {
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0D9488 100%)',
      padding: '40px 20px 32px',
      textAlign: 'center' as const,
    },

    heroTitle: {
      fontSize: 28,
      fontWeight: 800,
      color: '#FFFFFF',
      margin: '0 0 4px',
      letterSpacing: -0.5,
    },

    heroSub: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.65)',
      margin: '0 0 24px',
    },

    inputCard: {
      background: '#FFFFFF',
      borderRadius: 20,
      margin: '0 16px',
      padding: 16,
      boxShadow: '0 4px 24px rgba(15,23,42,0.10)',
      marginTop: -20,
    },

    textarea: {
      width: '100%',
      minHeight: 80,
      border: 'none',
      outline: 'none',
      fontSize: 15,
      fontFamily: 'inherit',
      color: '#0F172A',
      resize: 'none' as const,
      background: 'transparent',
      lineHeight: 1.5,
    },

    examplesRow: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto' as const,
      padding: '8px 0 0',
      scrollbarWidth: 'none' as const,
    },

    exampleChip: {
      flexShrink: 0,
      background: '#F1F5F9',
      border: '1px solid #E2E8F0',
      borderRadius: 20,
      padding: '6px 12px',
      fontSize: 12,
      color: '#475569',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
    },

    modelsRow: {
      display: 'flex',
      gap: 8,
      padding: '12px 0 0',
      flexWrap: 'wrap' as const,
    },

    modelChip: (active: boolean, color: string) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '5px 10px',
      borderRadius: 20,
      border: `1.5px solid ${active ? color : '#E2E8F0'}`,
      background: active ? `${color}15` : '#F8FAFC',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      color: active ? color : '#94A3B8',
      transition: 'all 0.2s',
    }),

    askBtn: (disabled: boolean) => ({
      width: '100%',
      padding: '14px',
      background: disabled
        ? '#E2E8F0'
        : 'linear-gradient(135deg, #0D9488, #1E40AF)',
      color: disabled ? '#94A3B8' : '#FFFFFF',
      border: 'none',
      borderRadius: 14,
      fontSize: 16,
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      marginTop: 12,
      transition: 'all 0.2s',
    }),

    section: {
      padding: '20px 16px 0',
    },

    consensusCard: (color: string) => ({
      background: '#FFFFFF',
      borderRadius: 20,
      padding: '20px',
      border: `2px solid ${color}40`,
      boxShadow: `0 4px 20px ${color}20`,
      marginBottom: 16,
    }),

    verdictBadge: (color: string) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: `${color}15`,
      color: color,
      borderRadius: 20,
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.5,
    }),

    scoreRing: {
      width: 80,
      height: 80,
    },

    modelCard: (color: string, expanded: boolean) => ({
      background: '#FFFFFF',
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 10,
      border: `1px solid ${expanded ? color : '#E2E8F0'}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),

    confBar: (pct: number, color: string) => ({
      height: 4,
      borderRadius: 4,
      background: `linear-gradient(90deg, ${color}, ${color}88)`,
      width: `${pct}%`,
      transition: 'width 0.6s ease',
    }),
  };

  const consensusColor = result?.consensus?.color || '#0D9488';

  return (
    <div style={S.wrap}>
      {/* Hero */}
      <div style={S.hero}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔮</div>
        <h1 style={S.heroTitle}>Clinical Oracle</h1>
        <p style={S.heroSub}>5 AI engines · Consensus scoring · Evidence-based</p>
      </div>

      {/* Input Card */}
      <div style={S.inputCard}>
        <textarea
          ref={textareaRef}
          style={S.textarea}
          placeholder="Ask any clinical question — STEMI management, drug interactions, diagnostic criteria..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) ask(); }}
        />

        {/* Example questions */}
        <div style={S.examplesRow}>
          {EXAMPLE_QUESTIONS.map((q, i) => (
            <div
              key={i}
              style={S.exampleChip}
              onClick={() => setQuestion(q)}
            >
              {q.slice(0, 35)}…
            </div>
          ))}
        </div>

        {/* Model selector */}
        <div style={S.modelsRow}>
          {MODELS_INFO.map(m => (
            <div
              key={m.id}
              style={S.modelChip(selectedModels.includes(m.id), m.color)}
              onClick={() => toggleModel(m.id)}
            >
              <span>{m.icon}</span>
              <span>{m.name}</span>
            </div>
          ))}
        </div>

        <button
          style={S.askBtn(loading || !question.trim() || selectedModels.length === 0)}
          onClick={ask}
          disabled={loading || !question.trim() || selectedModels.length === 0}
        >
          {loading ? '⏳ Consulting Oracle…' : '🔮 Ask the Oracle'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ ...S.section, textAlign: 'center' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: 32,
            border: '1px solid #E2E8F0',
          }}>
            {MODELS_INFO.filter(m => selectedModels.includes(m.id)).map((m, i) => (
              <div key={m.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                opacity: 1,
                animation: `pulse ${0.8 + i * 0.2}s ease infinite`,
              }}>
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{m.desc}</div>
                </div>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: m.color,
                  animation: 'ping 1s ease infinite',
                }} />
              </div>
            ))}
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 16 }}>
              Consulting {selectedModels.length} AI engines simultaneously…
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={S.section}>

          {/* Consensus Card */}
          <div style={S.consensusCard(consensusColor)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={S.verdictBadge(consensusColor)}>
                  {result.consensus.hasConsensus ? '✅' : '⚠️'} {result.consensus.verdict}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#475569',
                  marginTop: 8,
                  lineHeight: 1.4,
                  fontStyle: 'italic',
                }}>
                  "{result.question}"
                </div>
                {result.consensus.dissentCount > 0 && (
                  <div style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: '#F59E0B',
                    fontWeight: 600,
                  }}>
                    ⚠️ {result.consensus.dissentCount} AI engine(s) disagree — review carefully
                  </div>
                )}
              </div>

              {/* Score Ring */}
              <div style={{ textAlign: 'center', marginLeft: 16 }}>
                <svg width={80} height={80} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke={consensusColor}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 34 * result.consensus.score / 100} ${2 * Math.PI * 34}`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                  <text x="40" y="38" textAnchor="middle" fontSize="18" fontWeight="800" fill={consensusColor}>
                    {result.consensus.score}
                  </text>
                  <text x="40" y="52" textAnchor="middle" fontSize="9" fill="#94A3B8">
                    consensus
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Individual AI Responses */}
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
            AI Responses ({result.responses.length})
          </div>

          {result.responses.map(r => (
            <div
              key={r.id}
              style={S.modelCard(r.color, expandedId === r.id)}
              onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.confidence >= 80 ? '#10B981' : r.confidence >= 60 ? '#F59E0B' : '#EF4444' }}>
                      {r.confidence}%
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#F1F5F9', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                    <div style={S.confBar(r.confidence, r.color)} />
                  </div>
                </div>
              </div>

              {r.status === 'error' ? (
                <div style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>
                  ❌ {r.error || 'API key not configured'}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: '#0F172A', marginTop: 10, lineHeight: 1.5 }}>
                    {r.answer}
                  </div>

                  {expandedId === r.id && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                      <div style={{
                        background: '#F8FAFC',
                        borderRadius: 10,
                        padding: '10px 12px',
                        fontSize: 12,
                        color: '#475569',
                        lineHeight: 1.6,
                      }}>
                        {r.rawText}
                      </div>
                      {r.evidence && (
                        <div style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: '#0D9488',
                          fontWeight: 600,
                        }}>
                          📄 {r.evidence}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4 }}>
                        ⚡ {r.latency}ms
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Disclaimer */}
          <div style={{
            background: '#FEF3C7',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 11,
            color: '#92400E',
            marginTop: 8,
          }}>
            ⚠️ For educational purposes only. Always apply clinical judgment. Not a substitute for professional medical advice.
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2);opacity:0} }
      `}</style>
    </div>
  );
}
