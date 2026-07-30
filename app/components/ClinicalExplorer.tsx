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

const BIO_GLOW = `
  @keyframes bioGlow {
    0%, 100% { box-shadow: 0 0 15px rgba(0,122,255,0.3), 0 0 30px rgba(0,122,255,0.15); }
    50% { box-shadow: 0 0 25px rgba(0,122,255,0.5), 0 0 50px rgba(0,122,255,0.25); }
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`

// ── OpenFDA Drug Search ──
async function searchOpenFDA(query: string) {
  const url = 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:' + encodeURIComponent(query) + '+OR+openfda.generic_name:' + encodeURIComponent(query) + '&limit=3'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Drug not found')
  const data = await res.json()
  return data.results || []
}

// ── ClinicalTrials.gov Search ──
async function searchTrials(query: string, condition: string) {
  const term = condition || query
  const url = 'https://clinicaltrials.gov/api/v2/studies?query.term=' + encodeURIComponent(term) + '&filter.overallStatus=RECRUITING&pageSize=5&format=json'
  const res = await fetch(url)
  if (!res.ok) throw new Error('No trials found')
  const data = await res.json()
  return data.studies || []
}

function DrugCard({ drug }: { drug: any }) {
  const [expanded, setExpanded] = useState(false)
  const info = drug.openfda || {}
  const name = info.brand_name?.[0] || info.generic_name?.[0] || 'Unknown'
  const generic = info.generic_name?.[0] || ''
  const manufacturer = info.manufacturer_name?.[0] || ''
  const route = info.route?.[0] || ''
  const warnings = drug.warnings?.[0] || drug.warnings_and_cautions?.[0] || ''
  const indications = drug.indications_and_usage?.[0] || ''
  const dosage = drug.dosage_and_administration?.[0] || ''
  const contraindications = drug.contraindications?.[0] || ''

  return (
    <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.blue + '22', borderRadius: 18, padding: '16px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle,' + T.blue + '12,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: T.text, marginBottom: 2 }}>{name}</div>
          {generic && generic !== name && <div style={{ fontSize: 11, color: T.muted }}>{generic}</div>}
        </div>
        <div style={{ background: T.blue + '15', border: '1px solid ' + T.blue + '25', borderRadius: 20, padding: '3px 10px', fontSize: 9, color: T.blue, fontWeight: 700 }}>FDA ✓</div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {route && <span style={{ fontSize: 9, color: T.teal, background: T.teal + '12', borderRadius: 8, padding: '2px 8px', fontWeight: 600 }}>{route}</span>}
        {manufacturer && <span style={{ fontSize: 9, color: T.muted, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '2px 8px' }}>{manufacturer.substring(0, 20)}</span>}
      </div>

      {indications && (
        <div style={{ background: T.teal + '08', border: '1px solid ' + T.teal + '18', borderRadius: 10, padding: '8px 10px', marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: T.teal, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>INDICATIONS</div>
          <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.6 }}>{indications.substring(0, 150)}...</div>
        </div>
      )}

      {expanded && (
        <div>
          {dosage && (
            <div style={{ background: T.green + '08', border: '1px solid ' + T.green + '18', borderRadius: 10, padding: '8px 10px', marginBottom: 8 }}>
              <div style={{ fontSize: 8, color: T.green, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>DOSAGE</div>
              <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.6 }}>{dosage.substring(0, 200)}...</div>
            </div>
          )}
          {warnings && (
            <div style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid ' + T.orange + '20', borderRadius: 10, padding: '8px 10px', marginBottom: 8 }}>
              <div style={{ fontSize: 8, color: T.orange, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>⚠️ WARNINGS</div>
              <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.6 }}>{warnings.substring(0, 200)}...</div>
            </div>
          )}
          {contraindications && (
            <div style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid ' + T.red + '20', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ fontSize: 8, color: T.red, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>🛑 CONTRAINDICATIONS</div>
              <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.6 }}>{contraindications.substring(0, 200)}...</div>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 8, background: 'transparent', border: 'none', color: T.blue, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F, padding: 0 }}>
        {expanded ? '▲ Show less' : '▼ Show full details'}
      </button>
    </div>
  )
}

function TrialCard({ trial }: { trial: any }) {
  const proto = trial.protocolSection || {}
  const id_mod = proto.identificationModule || {}
  const status_mod = proto.statusModule || {}
  const desc_mod = proto.descriptionModule || {}
  const design_mod = proto.designModule || {}
  const contact_mod = proto.contactsLocationsModule || {}

  const title = id_mod.briefTitle || 'Clinical Trial'
  const nctId = id_mod.nctId || ''
  const status = status_mod.overallStatus || ''
  const phase = design_mod.phases?.[0] || ''
  const summary = desc_mod.briefSummary || ''
  const startDate = status_mod.startDateStruct?.date || ''

  const statusColor = status === 'RECRUITING' ? T.green : status === 'COMPLETED' ? T.blue : T.muted

  return (
    <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.purple + '22', borderRadius: 18, padding: '16px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle,' + T.purple + '12,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.text, lineHeight: 1.4, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 10, color: T.muted }}>{nctId}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <div style={{ background: statusColor + '15', border: '1px solid ' + statusColor + '25', borderRadius: 8, padding: '2px 8px', fontSize: 9, color: statusColor, fontWeight: 700, textAlign: 'center' }}>{status}</div>
          {phase && <div style={{ background: T.purple + '12', border: '1px solid ' + T.purple + '20', borderRadius: 8, padding: '2px 8px', fontSize: 9, color: T.purple, fontWeight: 600, textAlign: 'center' }}>{phase}</div>}
        </div>
      </div>

      {summary && (
        <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.6, marginBottom: 10 }}>{summary.substring(0, 180)}...</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {startDate && <span style={{ fontSize: 10, color: T.muted }}>Started: {startDate}</span>}
        <button onClick={() => window.open('https://clinicaltrials.gov/study/' + nctId, '_blank')} style={{ background: T.purple + '15', border: '1px solid ' + T.purple + '25', borderRadius: 10, padding: '5px 12px', color: T.purple, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
          View on ClinicalTrials.gov →
        </button>
      </div>
    </div>
  )
}

export default function ClinicalExplorer({ onXP }: { onXP?: (n: number) => void }) {
  const [tab, setTab]               = useState<'fda'|'trials'>('fda')
  const [query, setQuery]           = useState('')
  const [condition, setCondition]   = useState('')
  const [results, setResults]       = useState<any[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [searched, setSearched]     = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setSearched(true)
    try {
      if (tab === 'fda') {
        const data = await searchOpenFDA(query)
        setResults(data)
      } else {
        const data = await searchTrials(query, condition)
        setResults(data)
      }
      onXP?.(5)
    } catch (e: any) {
      setError(tab === 'fda' ? 'Drug not found in FDA database' : 'No recruiting trials found')
    }
    setLoading(false)
  }

  const QUICK_DRUGS = ['Aspirin','Metformin','Atorvastatin','Ramipril','Metoprolol','Warfarin']
  const QUICK_CONDITIONS = ['Heart Failure','Diabetes','Hypertension','COPD','Stroke','Cancer']

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: T.blue + 'CC', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>CLINICAL INTELLIGENCE</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
          Clinical <span style={{ color: T.blue }}>Explorer</span>
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>OpenFDA · ClinicalTrials.gov · Live data</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'FDA drugs',  v: '140K+', c: T.blue   },
          { l: 'Trials',     v: '490K+', c: T.purple },
          { l: 'Countries',  v: '220+',  c: T.teal   },
          { l: 'Updated',    v: 'Daily', c: T.green  },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.glass, backdropFilter: 'blur(16px)', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: '1px solid ' + s.c + '18' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 4, marginBottom: 16, border: '1px solid rgba(255,255,255,0.10)' }}>
        {([['fda','💊 OpenFDA'],['trials','🔬 Clinical Trials']] as [string,string][]).map(([id,label])=>(
          <button key={id} onClick={()=>{setTab(id as any);setResults([]);setSearched(false);setError('')}} style={{ flex:1, padding:'10px 8px', cursor:'pointer', borderRadius:12, fontFamily:F, fontWeight:700, fontSize:12, border:tab===id?'1px solid '+T.blue+'25':'1px solid transparent', background:tab===id?'rgba(255,255,255,0.10)':'transparent', color:tab===id?T.blue:T.muted, transition:'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder={tab === 'fda' ? 'Drug name (e.g. Metformin, Aspirin)...' : 'Keyword (e.g. STEMI, Diabetes)...'} style={{ flex: 1, padding: '12px 14px', borderRadius: 14, border: '1px solid ' + T.border, background: T.glass, color: T.text, fontSize: 13, outline: 'none', fontFamily: F }} />
          <button onClick={search} disabled={loading || !query.trim()} style={{ padding: '12px 18px', borderRadius: 14, border: 'none', background: !query.trim() ? 'rgba(0,122,255,0.15)' : 'linear-gradient(135deg,' + T.blue + ',#0055CC)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: !query.trim() ? 'not-allowed' : 'pointer', fontFamily: F }}>
            {loading ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} /> : '🔍'}
          </button>
        </div>

        {tab === 'trials' && (
          <input value={condition} onChange={e => setCondition(e.target.value)} placeholder="Condition (optional, e.g. Heart Failure)..." style={{ width: '100%', padding: '10px 14px', borderRadius: 14, border: '1px solid ' + T.border, background: T.glass2, color: T.text, fontSize: 12, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
        )}
      </div>

      {/* Quick search */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>{tab === 'fda' ? 'QUICK DRUGS' : 'QUICK CONDITIONS'}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(tab === 'fda' ? QUICK_DRUGS : QUICK_CONDITIONS).map(item => (
            <button key={item} onClick={() => { setQuery(item); }} style={{ background: T.glass2, border: '1px solid ' + T.border, borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: F, color: T.sub, fontSize: 11, fontWeight: 600 }}>{item}</button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid ' + T.orange + '25', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: T.orange }}>⚠️ {error}</div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.08)', borderTop: '3px solid ' + T.blue, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color: T.sub }}>Searching {tab === 'fda' ? 'FDA database' : 'ClinicalTrials.gov'}...</div>
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '40px', background: T.glass, borderRadius: 20, border: '1px solid ' + T.border }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14, color: T.text, marginBottom: 4 }}>No results found</div>
          <div style={{ fontSize: 12, color: T.muted }}>Try a different search term</div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>
            {results.length} {tab === 'fda' ? 'FDA DRUG LABELS' : 'CLINICAL TRIALS'} FOUND
          </div>
          {tab === 'fda'
            ? results.map((d, i) => <DrugCard key={i} drug={d} />)
            : results.map((t, i) => <TrialCard key={i} trial={t} />)
          }
        </div>
      )}

      <div style={{ marginTop: 16, background: T.gold + '08', border: '1px solid ' + T.gold + '18', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>⭐ Data from OpenFDA.gov & ClinicalTrials.gov — Official US Government sources</div>
      </div>

      <style>{BIO_GLOW + ' input::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}
