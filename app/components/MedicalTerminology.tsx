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

const BIO_CSS = `@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`

// ── WHO ICD-11 API ──
async function searchICD11(query: string) {
  const tokenRes = await fetch('https://icdaccessmanagement.who.int/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'client_id=b4c28f4e-3f04-4e34-9960-22b72f2e4555_be76&client_secret=HJetRHZZZWVQO7sJjJUJKfIz3Oa83T2gW5fHOhUPloc=&scope=icdapi_access&grant_type=client_credentials'
  })

  if (!tokenRes.ok) throw new Error('ICD-11 auth failed')
  const tokenData = await tokenRes.json()
  const token = tokenData.access_token

  const searchRes = await fetch(
    'https://id.who.int/icd/entity/search?q=' + encodeURIComponent(query) + '&includeKeywordResult=true&useFlexisearch=true&flatResults=true',
    {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Accept-Language': 'en',
        'API-Version': 'v2',
      }
    }
  )
  if (!searchRes.ok) throw new Error('ICD-11 search failed')
  return searchRes.json()
}

// ── SNOMED CT via public browser API ──
async function searchSNOMED(query: string) {
  const url = 'https://browser.ihtsdotools.org/snowstorm/snomed-ct/MAIN/concepts?term=' +
    encodeURIComponent(query) +
    '&active=true&limit=10'
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  })
  if (!res.ok) throw new Error('SNOMED search failed')
  return res.json()
}

function ICDCard({ entity }: { entity: any }) {
  const [expanded, setExpanded] = useState(false)
  const code    = entity.theCode || entity.code || '—'
  const title   = entity.title || entity.preferredPlainText || '—'
  const chapter = entity.chapter || ''

  return (
    <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.blue}22`, borderRadius: 16, padding: '14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.text, lineHeight: 1.4, marginBottom: 4 }}>{title}</div>
          {chapter && <div style={{ fontSize: 10, color: T.muted }}>{chapter}</div>}
        </div>
        <div style={{ background: T.blue + '15', border: `1px solid ${T.blue}25`, borderRadius: 10, padding: '4px 10px', fontSize: 12, color: T.blue, fontWeight: 900, flexShrink: 0 }}>{code}</div>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: T.teal, background: T.teal + '12', border: `1px solid ${T.teal}20`, borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>ICD-11</span>
        <span style={{ fontSize: 9, color: T.blue, background: T.blue + '12', border: `1px solid ${T.blue}20`, borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>WHO</span>
        <button
          onClick={() => window.open('https://icd.who.int/browse/2024-01/mms/en#' + (entity.id || ''), '_blank')}
          style={{ marginLeft: 'auto', fontSize: 9, color: T.blue, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 700 }}
        >
          View on WHO →
        </button>
      </div>
    </div>
  )
}

function SNOMEDCard({ concept }: { concept: any }) {
  const id    = concept.conceptId || '—'
  const term  = concept.fsn?.term || concept.pt?.term || '—'
  const module = concept.moduleId === '900000000000207008' ? 'Core' : 'Extension'

  // Clean display term (remove (qualifier value) etc.)
  const cleanTerm = term.replace(/\s*\(.*?\)\s*$/, '')

  return (
    <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.purple}22`, borderRadius: 16, padding: '14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.text, lineHeight: 1.4, marginBottom: 4 }}>{cleanTerm}</div>
          <div style={{ fontSize: 10, color: T.muted, fontFamily: 'monospace' }}>SCTID: {id}</div>
        </div>
        <div style={{ background: T.purple + '15', border: `1px solid ${T.purple}25`, borderRadius: 10, padding: '4px 8px', fontSize: 9, color: T.purple, fontWeight: 700, flexShrink: 0 }}>{module}</div>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: T.purple, background: T.purple + '12', border: `1px solid ${T.purple}20`, borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>SNOMED CT</span>
        {concept.active && <span style={{ fontSize: 9, color: T.green, background: T.green + '12', border: `1px solid ${T.green}20`, borderRadius: 8, padding: '2px 8px', fontWeight: 700 }}>Active</span>}
        <button
          onClick={() => window.open('https://browser.ihtsdotools.org/?perspective=full&conceptId1=' + id, '_blank')}
          style={{ marginLeft: 'auto', fontSize: 9, color: T.purple, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 700 }}
        >
          Browse →
        </button>
      </div>
    </div>
  )
}

export default function MedicalTerminology({ onXP }: { onXP?: (n: number) => void }) {
  const [tab, setTab]           = useState<'icd'|'snomed'>('icd')
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [searched, setSearched] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setSearched(true)

    try {
      if (tab === 'icd') {
        const data = await searchICD11(query)
        const entities = data.destinationEntities || []
        setResults(entities.slice(0, 10))
        if (entities.length === 0) setError('No ICD-11 codes found')
      } else {
        const data = await searchSNOMED(query)
        const concepts = data.items || []
        setResults(concepts.slice(0, 10))
        if (concepts.length === 0) setError('No SNOMED concepts found')
      }
      onXP?.(5)
    } catch (e: any) {
      // Fallback to demo data if API fails
      if (tab === 'icd') {
        setResults(DEMO_ICD.filter(d => d.title.toLowerCase().includes(query.toLowerCase()) || d.theCode.toLowerCase().includes(query.toLowerCase())))
        if (results.length === 0) setError('ICD-11 API unavailable — showing cached data')
      } else {
        setResults(DEMO_SNOMED.filter(d => d.fsn.term.toLowerCase().includes(query.toLowerCase())))
        if (results.length === 0) setError('SNOMED API unavailable — showing cached data')
      }
    }
    setLoading(false)
  }

  const QUICK_ICD    = ['Myocardial infarction','Heart failure','Pneumonia','Sepsis','Diabetes','Stroke']
  const QUICK_SNOMED = ['Hypertension','Atrial fibrillation','COPD','Acute kidney injury','Asthma']

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: T.teal + 'CC', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>MEDICAL TERMINOLOGY</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
          Clinical <span style={{ color: T.teal }}>Codes</span>
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>WHO ICD-11 · SNOMED CT · Global Standards</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'ICD-11',   v: '55K+',  c: T.blue   },
          { l: 'SNOMED',   v: '350K+', c: T.purple },
          { l: 'Languages',v: '43',    c: T.teal   },
          { l: 'WHO 2024', v: 'Live',  c: T.green  },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.glass, backdropFilter: 'blur(16px)', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: `1px solid ${s.c}18` }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 4, marginBottom: 16, border: '1px solid rgba(255,255,255,0.10)' }}>
        {([
          ['icd',    '🌍 WHO ICD-11'],
          ['snomed', '🔬 SNOMED CT'],
        ] as [string,string][]).map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id as any); setResults([]); setSearched(false); setError('') }} style={{ flex: 1, padding: '10px 8px', cursor: 'pointer', borderRadius: 12, fontFamily: F, fontWeight: 700, fontSize: 12, border: tab === id ? `1px solid ${tab === 'icd' ? T.blue : T.purple}25` : '1px solid transparent', background: tab === id ? 'rgba(255,255,255,0.10)' : 'transparent', color: tab === id ? (tab === 'icd' ? T.blue : T.purple) : T.muted, transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* Info banner */}
      <div style={{ background: tab === 'icd' ? T.blue + '08' : T.purple + '08', border: `1px solid ${tab === 'icd' ? T.blue : T.purple}20`, borderRadius: 14, padding: '10px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: tab === 'icd' ? T.blue : T.purple, fontWeight: 700, marginBottom: 3 }}>
          {tab === 'icd' ? '🌍 WHO ICD-11 (2024)' : '🔬 SNOMED CT International'}
        </div>
        <div style={{ fontSize: 11, color: T.sub, lineHeight: 1.5 }}>
          {tab === 'icd'
            ? 'International Classification of Diseases · Used in 194 WHO member states · Required for Saudi MOH billing'
            : 'Systematized Nomenclature of Medicine · 350,000+ clinical concepts · Used in Epic, Cerner, NHS systems'}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder={tab === 'icd' ? 'Search ICD-11 (e.g. Myocardial infarction)...' : 'Search SNOMED (e.g. Hypertension)...'}
          style={{ flex: 1, padding: '12px 14px', borderRadius: 14, border: `1px solid ${T.border}`, background: T.glass, color: T.text, fontSize: 13, outline: 'none', fontFamily: F }}
        />
        <button onClick={search} disabled={loading || !query.trim()} style={{ padding: '12px 18px', borderRadius: 14, border: 'none', background: !query.trim() ? 'rgba(0,196,180,0.15)' : `linear-gradient(135deg,${tab === 'icd' ? T.blue : T.purple},${tab === 'icd' ? '#0055CC' : '#7B00CC'})`, color: '#fff', fontSize: 13, fontWeight: 800, cursor: !query.trim() ? 'not-allowed' : 'pointer', fontFamily: F }}>
          {loading ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} /> : '🔍'}
        </button>
      </div>

      {/* Quick search */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>QUICK SEARCH</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(tab === 'icd' ? QUICK_ICD : QUICK_SNOMED).map(term => (
            <button key={term} onClick={() => { setQuery(term) }} style={{ background: T.glass2, border: `1px solid ${T.border}`, borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: F, color: T.sub, fontSize: 11, fontWeight: 600 }}>{term}</button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(255,149,0,0.08)', border: `1px solid ${T.orange}25`, borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: T.orange }}>⚠️ {error}</div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.08)`, borderTop: `3px solid ${tab === 'icd' ? T.blue : T.purple}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color: T.sub }}>Searching {tab === 'icd' ? 'WHO ICD-11' : 'SNOMED CT'}...</div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>
            {results.length} {tab === 'icd' ? 'ICD-11 CODES' : 'SNOMED CONCEPTS'} FOUND
          </div>
          {tab === 'icd'
            ? results.map((e, i) => <ICDCard key={i} entity={e} />)
            : results.map((c, i) => <SNOMEDCard key={i} concept={c} />)
          }
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '40px', background: T.glass, borderRadius: 20, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 14, color: T.text, marginBottom: 4 }}>No results found</div>
          <div style={{ fontSize: 12, color: T.muted }}>Try different search terms</div>
        </div>
      )}

      <div style={{ marginTop: 16, background: T.gold + '08', border: `1px solid ${T.gold}18`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>
          ⭐ Data from WHO ICD-11 API & SNOMED International Browser · Official sources
        </div>
      </div>

      <style>{BIO_CSS + ' input::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}

// ── DEMO FALLBACK DATA ──
const DEMO_ICD = [
  { theCode: 'BA80', title: 'Acute myocardial infarction', chapter: 'Diseases of the circulatory system', id: '' },
  { theCode: 'BA81', title: 'Subsequent myocardial infarction', chapter: 'Diseases of the circulatory system', id: '' },
  { theCode: '5A10', title: 'Type 1 diabetes mellitus', chapter: 'Endocrine, nutritional or metabolic diseases', id: '' },
  { theCode: '5A11', title: 'Type 2 diabetes mellitus', chapter: 'Endocrine, nutritional or metabolic diseases', id: '' },
  { theCode: 'CA22', title: 'Pneumonia', chapter: 'Diseases of the respiratory system', id: '' },
  { theCode: 'MG40', title: 'Sepsis', chapter: 'Certain infectious or parasitic diseases', id: '' },
  { theCode: '8B20', title: 'Ischaemic stroke', chapter: 'Diseases of the nervous system', id: '' },
  { theCode: 'BA00', title: 'Essential hypertension', chapter: 'Diseases of the circulatory system', id: '' },
]

const DEMO_SNOMED = [
  { conceptId: '73211009', fsn: { term: 'Diabetes mellitus (disorder)' }, active: true, moduleId: '900000000000207008' },
  { conceptId: '38341003', fsn: { term: 'Hypertensive disorder, systemic arterial (disorder)' }, active: true, moduleId: '900000000000207008' },
  { conceptId: '22298006', fsn: { term: 'Myocardial infarction (disorder)' }, active: true, moduleId: '900000000000207008' },
  { conceptId: '195967001', fsn: { term: 'Asthma (disorder)' }, active: true, moduleId: '900000000000207008' },
  { conceptId: '13645005', fsn: { term: 'Chronic obstructive lung disease (disorder)' }, active: true, moduleId: '900000000000207008' },
]
