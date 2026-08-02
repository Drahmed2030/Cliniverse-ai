'use client'
import { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.72)',
  muted:  'rgba(238,246,250,0.50)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

const COMMON_DRUGS = [
  'Aspirin','Warfarin','Metformin','Ramipril','Bisoprolol',
  'Atorvastatin','Amiodarone','Digoxin','Furosemide','Spironolactone',
  'Enoxaparin','Clopidogrel','Amlodipine','Lisinopril','Metoprolol',
  'Omeprazole','Prednisolone','Methotrexate','Vancomycin','Gentamicin',
  'Ciprofloxacin','Clarithromycin','Fluconazole','Phenytoin','Carbamazepine',
  'Lithium','Haloperidol','Clozapine','Morphine','Tramadol',
]

const SEVERITY_CONFIG = {
  'CONTRAINDICATED': { color: T.red,    bg: 'rgba(255,59,48,0.12)',  icon: '🛑', label: 'CONTRAINDICATED' },
  'MAJOR':           { color: T.red,    bg: 'rgba(255,59,48,0.08)',  icon: '⚠️', label: 'MAJOR' },
  'MODERATE':        { color: T.orange, bg: 'rgba(255,149,0,0.10)',  icon: '⚡', label: 'MODERATE' },
  'MINOR':           { color: T.gold,   bg: 'rgba(212,168,71,0.10)', icon: '💛', label: 'MINOR' },
  'NONE':            { color: T.green,  bg: 'rgba(52,199,89,0.10)',  icon: '✅', label: 'NO INTERACTION' },
}

interface Interaction {
  severity: keyof typeof SEVERITY_CONFIG
  mechanism: string
  effect: string
  management: string
  monitoring: string
}

interface AIResult {
  drug1: string
  drug2: string
  interactions: Interaction[]
  summary: string
  clinicalPearl: string
}

async function checkInteractions(drugs: string[]): Promise<AIResult> {
  const pairs = []
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      pairs.push(`${drugs[i]} + ${drugs[j]}`)
    }
  }

  const prompt = `You are a clinical pharmacist. Check drug interactions for: ${drugs.join(', ')}.

For each pair, provide a JSON response with this exact structure:
{
  "drug1": "first drug",
  "drug2": "second drug", 
  "interactions": [
    {
      "severity": "CONTRAINDICATED|MAJOR|MODERATE|MINOR|NONE",
      "mechanism": "pharmacokinetic/pharmacodynamic mechanism",
      "effect": "clinical effect of interaction",
      "management": "how to manage this interaction",
      "monitoring": "what to monitor"
    }
  ],
  "summary": "one sentence overall summary",
  "clinicalPearl": "one practical clinical tip"
}

Return ONLY a JSON array of interaction objects for all pairs. No markdown, no explanation outside JSON.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  const text = data.content?.[0]?.text || '[]'
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return []
  }
}

export default function DrugInteractionChecker({ onXP }: { onXP?: (n: number) => void }) {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([])
  const [customDrug, setCustomDrug]       = useState('')
  const [results, setResults]             = useState<any[]>([])
  const [loading, setLoading]             = useState(false)
  const [checked, setChecked]             = useState(false)
  const [search, setSearch]               = useState('')

  const filteredDrugs = COMMON_DRUGS.filter(d =>
    d.toLowerCase().includes(search.toLowerCase()) && !selectedDrugs.includes(d)
  )

  const addDrug = (drug: string) => {
    if (selectedDrugs.length >= 6) return
    if (!selectedDrugs.includes(drug)) {
      setSelectedDrugs(prev => [...prev, drug])
      setResults([])
      setChecked(false)
    }
    setSearch('')
  }

  const addCustom = () => {
    const d = customDrug.trim()
    if (d && !selectedDrugs.includes(d) && selectedDrugs.length < 6) {
      setSelectedDrugs(prev => [...prev, d])
      setCustomDrug('')
      setResults([])
      setChecked(false)
    }
  }

  const removeDrug = (drug: string) => {
    setSelectedDrugs(prev => prev.filter(d => d !== drug))
    setResults([])
    setChecked(false)
  }

  const check = async () => {
    if (selectedDrugs.length < 2) return
    setLoading(true)
    setChecked(false)
    try {
      const data = await checkInteractions(selectedDrugs)
      setResults(Array.isArray(data) ? data : [data])
      setChecked(true)
      onXP?.(15)
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const worstSeverity = results.reduce((worst: string, r: any) => {
    const order = ['CONTRAINDICATED', 'MAJOR', 'MODERATE', 'MINOR', 'NONE']
    const rSev = r.interactions?.[0]?.severity || 'NONE'
    return order.indexOf(rSev) < order.indexOf(worst) ? rSev : worst
  }, 'NONE')

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: `${T.orange}CC`, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>DRUG SAFETY AI</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
          Drug <span style={{ color: T.orange }}>Interactions</span>
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>AI-powered interaction checker · Up to 6 drugs</div>
      </div>

      {/* Selected drugs */}
      {selectedDrugs.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>
            SELECTED DRUGS ({selectedDrugs.length}/6)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedDrugs.map(drug => (
              <div key={drug} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: `${T.blue}15`, border: `1.5px solid ${T.blue}35`,
                borderRadius: 20, padding: '6px 12px',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{drug}</span>
                <button onClick={() => removeDrug(drug)} style={{
                  background: 'rgba(255,59,48,0.15)', border: 'none',
                  borderRadius: '50%', width: 18, height: 18,
                  color: T.red, fontSize: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: F, lineHeight: 1,
                }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + add */}
      {selectedDrugs.length < 6 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search drug name..."
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 14,
                border: `1px solid ${T.border}`, background: T.glass,
                backdropFilter: 'blur(16px)', color: T.text, fontSize: 13,
                outline: 'none', fontFamily: F,
              }}
            />
          </div>

          {/* Search results */}
          {search.length > 0 && (
            <div style={{
              background: T.glass, backdropFilter: 'blur(20px)',
              border: `1px solid ${T.border}`, borderRadius: 14,
              maxHeight: 180, overflowY: 'auto', marginBottom: 8,
            }}>
              {filteredDrugs.slice(0, 6).map(drug => (
                <div key={drug} onClick={() => addDrug(drug)} style={{
                  padding: '10px 14px', cursor: 'pointer',
                  borderBottom: `1px solid rgba(255,255,255,0.05)`,
                  fontSize: 13, color: T.text, fontWeight: 600,
                }}>
                  💊 {drug}
                </div>
              ))}
              {filteredDrugs.length === 0 && (
                <div style={{ padding: '10px 14px', fontSize: 12, color: T.muted }}>
                  Not found — add custom below
                </div>
              )}
            </div>
          )}

          {/* Custom drug */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={customDrug}
              onChange={e => setCustomDrug(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="Add custom drug..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 14,
                border: `1px solid ${T.border}`, background: T.glass2,
                color: T.text, fontSize: 12, outline: 'none', fontFamily: F,
              }}
            />
            <button onClick={addCustom} style={{
              padding: '10px 16px', borderRadius: 14, border: 'none',
              background: T.glass, color: T.teal, fontSize: 13,
              fontWeight: 700, cursor: 'pointer', fontFamily: F,
              border: `1px solid ${T.teal}30`,
            }}>+ Add</button>
          </div>
        </div>
      )}

      {/* Common drugs quick-add */}
      {search.length === 0 && selectedDrugs.length < 6 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>QUICK ADD</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {COMMON_DRUGS.filter(d => !selectedDrugs.includes(d)).slice(0, 12).map(drug => (
              <button key={drug} onClick={() => addDrug(drug)} style={{
                background: T.glass2, border: `1px solid ${T.border}`,
                borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
                fontFamily: F, color: T.sub, fontSize: 11, fontWeight: 600,
              }}>{drug}</button>
            ))}
          </div>
        </div>
      )}

      {/* Check button */}
      <button
        onClick={check}
        disabled={selectedDrugs.length < 2 || loading}
        style={{
          width: '100%', padding: '16px', borderRadius: 18, border: 'none',
          background: selectedDrugs.length < 2
            ? 'rgba(255,149,0,0.15)'
            : `linear-gradient(135deg,${T.orange},${T.red})`,
          color: '#fff', fontSize: 15, fontWeight: 800,
          cursor: selectedDrugs.length < 2 ? 'not-allowed' : 'pointer',
          fontFamily: F,
          boxShadow: selectedDrugs.length >= 2 ? `0 8px 28px ${T.orange}35` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginBottom: 20, transition: 'all 0.2s',
        }}
      >
        {loading
          ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />Checking interactions...</>
          : selectedDrugs.length < 2
            ? '⚗️ Add at least 2 drugs'
            : `⚗️ Check ${selectedDrugs.length} Drug${selectedDrugs.length > 1 ? 's' : ''}`
        }
      </button>

      {/* Results */}
      {checked && results.length > 0 && (
        <div>
          {/* Overall severity banner */}
          {(() => {
            const cfg = SEVERITY_CONFIG[worstSeverity as keyof typeof SEVERITY_CONFIG]
            return (
              <div style={{
                background: cfg.bg, border: `1.5px solid ${cfg.color}40`,
                borderRadius: 18, padding: '14px 18px', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 28 }}>{cfg.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: cfg.color, letterSpacing: 1 }}>
                    HIGHEST SEVERITY
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{cfg.label}</div>
                </div>
              </div>
            )
          })()}

          {/* Interaction cards */}
          {results.map((r: any, i: number) => {
            const int0 = r.interactions?.[0]
            if (!int0) return null
            const cfg = SEVERITY_CONFIG[int0.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG['NONE']

            return (
              <div key={i} style={{
                background: T.glass, backdropFilter: 'blur(16px)',
                border: `1.5px solid ${cfg.color}28`,
                borderRadius: 20, padding: '16px', marginBottom: 12,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle,${cfg.color}12,transparent 70%)`, pointerEvents: 'none' }} />

                {/* Pair header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>
                    {r.drug1} <span style={{ color: T.muted, fontWeight: 400 }}>+</span> {r.drug2}
                  </div>
                  <div style={{
                    fontSize: 9, fontWeight: 800, color: cfg.color,
                    background: cfg.bg, border: `1px solid ${cfg.color}30`,
                    borderRadius: 8, padding: '3px 8px',
                  }}>{cfg.icon} {int0.severity}</div>
                </div>

                {/* Details */}
                {[
                  { l: '⚙️ Mechanism', v: int0.mechanism },
                  { l: '🎯 Effect',    v: int0.effect },
                  { l: '🛠️ Management',v: int0.management },
                  { l: '📊 Monitor',   v: int0.monitoring },
                ].map(row => (
                  <div key={row.l} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{row.l}</div>
                    <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.6 }}>{row.v}</div>
                  </div>
                ))}

                {/* Pearl */}
                {r.clinicalPearl && (
                  <div style={{ background: `${T.gold}10`, border: `1px solid ${T.gold}20`, borderRadius: 12, padding: '10px 12px', marginTop: 8 }}>
                    <div style={{ fontSize: 9, color: T.gold, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>💎 CLINICAL PEARL</div>
                    <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.6 }}>{r.clinicalPearl}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {checked && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px', background: `${T.green}08`, border: `1px solid ${T.green}20`, borderRadius: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.green, marginBottom: 4 }}>No Interactions Found</div>
          <div style={{ fontSize: 12, color: T.sub }}>These drugs appear safe to use together.</div>
        </div>
      )}

      <div style={{ marginTop: 16, background: `${T.gold}08`, border: `1px solid ${T.gold}18`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>⭐ Always verify with BNF / clinical pharmacist before prescribing</div>
      </div>

      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(238,246,250,0.30)}
      `}</style>
    </div>
  )
}
