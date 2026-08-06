'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731', red:'#EF4444',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowMd:'0 4px 16px rgba(15,23,42,0.12)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const JOURNALS = [
  { id:'all',        label:'All',         color:L.teal,    icon:'🌐' },
  { id:'cardiology', label:'Cardiology',  color:L.red,     icon:'🫀' },
  { id:'emergency',  label:'Emergency',   color:L.amber,   icon:'🚨' },
  { id:'neurology',  label:'Neurology',   color:'#7C3AED', icon:'🧠' },
  { id:'oncology',   label:'Oncology',    color:L.sage,    icon:'🔬' },
  { id:'infectious', label:'Infectious',  color:L.cobalt,  icon:'🦠' },
  { id:'surgery',    label:'Surgery',     color:'#EA580C', icon:'🔪' },
  { id:'pediatrics', label:'Pediatrics',  color:'#DB2777', icon:'👶' },
]

const QUERIES: Record<string,string> = {
  all:        'clinical trial 2026 medicine',
  cardiology: 'cardiology heart failure STEMI 2026',
  emergency:  'emergency medicine sepsis resuscitation 2026',
  neurology:  'neurology stroke seizure 2026',
  oncology:   'oncology cancer treatment 2026',
  infectious: 'infectious disease antibiotic resistance 2026',
  surgery:    'surgery minimally invasive outcomes 2026',
  pediatrics: 'pediatrics child health 2026',
}

interface Article {
  id: string; title: string; authors: string; journal: string; year: string; url: string
}

export default function MedFeed({ onXP }: { onXP?: (n:number)=>void }) {
  const [specialty, setSpecialty] = useState('all')
  const [articles, setArticles]   = useState<Article[]>([])
  const [loading, setLoading]     = useState(false)
  const [saved, setSaved]         = useState<Set<string>>(new Set())
  const [aiSummary, setAiSummary] = useState<Record<string,string>>({})
  const [loadingAI, setLoadingAI] = useState<string|null>(null)
  const [pressed, setPressed]     = useState<string|null>(null)

  const fetchArticles = async (spec: string) => {
    setLoading(true); setArticles([])
    try {
      const q = QUERIES[spec] || spec
      const res = await fetch(`/api/pubmed?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setArticles(data.results || [])
    } catch(e) { console.error(e) }
    setLoading(false)
  }
  useEffect(() => { fetchArticles(specialty) }, [specialty])

  const getAISummary = async (article: Article) => {
    if (aiSummary[article.id]) return
    setLoadingAI(article.id)
    try {
      const res = await fetch('/api/medical-ai', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ question:`Summarize this medical article in 2-3 sentences for a clinician: "${article.title}"`, specialty })
      })
      const data = await res.json()
      setAiSummary(prev => ({...prev, [article.id]: data.answer || 'Summary unavailable.'}))
      onXP?.(5)
    } catch(e) {}
    setLoadingAI(null)
  }

  const toggleSave = (id: string) => {
    setSaved(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
    onXP?.(2)
  }

  const accent = JOURNALS.find(j=>j.id===specialty)?.color || L.teal

  return (
    <div style={{
      minHeight:'100vh', background:L.canvas, paddingBottom:100,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif',
    }}>

      {/* Header */}
      <div style={{ padding:'28px 20px 8px' }}>
        <div style={{ fontSize:34, fontWeight:900, color:L.textPrimary, letterSpacing:-1.0 }}>
          MedFeed
        </div>
        <div style={{ fontSize:14, fontWeight:500, color:L.textMuted, marginTop:4 }}>
          Live research · PubMed · Updated daily
        </div>
      </div>

      {/* Specialty Filter */}
      <div style={{ overflowX:'auto', padding:'12px 16px 16px', display:'flex', gap:8 }}>
        {JOURNALS.map(j => (
          <button key={j.id} onClick={()=>setSpecialty(j.id)}
            onMouseDown={()=>setPressed(j.id)} onMouseUp={()=>setPressed(null)}
            style={{
              flexShrink:0, cursor:'pointer', whiteSpace:'nowrap',
              display:'flex', alignItems:'center', gap:6,
              padding:'8px 16px', borderRadius:99,
              background: specialty===j.id ? L.gradient : L.surface,
              border: `1.5px solid ${specialty===j.id ? 'transparent' : L.border}`,
              color: specialty===j.id ? 'white' : L.textSub,
              fontSize:13, fontWeight: specialty===j.id ? 700 : 500,
              boxShadow: specialty===j.id ? `0 4px 12px ${j.color}35` : L.shadowSm,
              transform: pressed===j.id ? 'scale(0.97)' : 'scale(1)',
              transition: spring,
            }}>
            <span>{j.icon}</span>{j.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div style={{ padding:'0 16px', display:'flex', flexDirection:'column', gap:12 }}>

        {loading && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔬</div>
            <div style={{ fontSize:15, fontWeight:500, color:L.textMuted }}>
              Loading latest research...
            </div>
          </div>
        )}

        {!loading && articles.length===0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:L.textMuted, fontSize:15 }}>
            No articles found
          </div>
        )}

        {articles.map((article) => (
          <div key={article.id} style={{
            background:L.surface, border:`1px solid ${L.border}`,
            borderRadius:20, padding:20, boxShadow:L.shadowSm,
          }}>

            {/* Top row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ display:'flex', gap:6 }}>
                <span style={{
                  background:`${accent}12`, color:accent,
                  fontSize:10, fontWeight:700, letterSpacing:1.2,
                  padding:'3px 10px', borderRadius:99,
                }}>PubMed</span>
                <span style={{
                  background:'rgba(16,185,129,0.1)', color:L.sage,
                  fontSize:10, fontWeight:700, letterSpacing:1.2,
                  padding:'3px 10px', borderRadius:99,
                }}>{article.year}</span>
              </div>
              <button onClick={()=>toggleSave(article.id)} style={{
                background:'none', border:'none', fontSize:20, cursor:'pointer',
                transition:smooth,
              }}>
                {saved.has(article.id) ? '🔖' : '📌'}
              </button>
            </div>

            {/* Title */}
            <div style={{
              fontSize:15, fontWeight:700, color:L.textPrimary,
              marginBottom:8, lineHeight:1.5, letterSpacing:-0.1,
            }}>
              {article.title}
            </div>

            {/* Authors */}
            <div style={{ fontSize:12, fontWeight:500, color:L.textMuted, marginBottom:12 }}>
              {article.authors && <span>{article.authors.split(',')[0]} et al. · </span>}
              {article.journal}
            </div>

            {/* AI Summary */}
            {aiSummary[article.id] && (
              <div style={{
                background:`${accent}08`, border:`1px solid ${accent}25`,
                borderRadius:14, padding:'12px 14px', marginBottom:12,
              }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:accent, marginBottom:6 }}>
                  🤖 AI PEARL
                </div>
                <div style={{ fontSize:13, fontWeight:500, color:L.textSub, lineHeight:1.65 }}>
                  {aiSummary[article.id]}
                </div>
              </div>
            )}

            {/* Action Card */}
            <div style={{ display:'flex', gap:8 }}>
              {!aiSummary[article.id] && (
                <button onClick={()=>getAISummary(article)}
                  disabled={loadingAI===article.id}
                  onMouseDown={()=>setPressed('ai'+article.id)}
                  onMouseUp={()=>setPressed(null)}
                  style={{
                    flex:1, background:`${accent}10`,
                    border:`1px solid ${accent}30`, borderRadius:12,
                    padding:'10px 14px', color:accent,
                    fontSize:13, fontWeight:700, cursor:'pointer',
                    transform: pressed===('ai'+article.id) ? 'scale(0.97)' : 'scale(1)',
                    transition: spring,
                  }}>
                  {loadingAI===article.id ? '⏳ Summarising...' : '🤖 AI Summary'}
                </button>
              )}
              <a href={article.url} target="_blank" rel="noreferrer" style={{
                background:L.raised, border:`1px solid ${L.border}`,
                borderRadius:12, padding:'10px 14px',
                color:L.textSub, fontSize:13, fontWeight:600,
                textDecoration:'none', display:'flex', alignItems:'center', gap:4,
              }}>
                PubMed →
              </a>
            </div>
          </div>
        ))}

        {!loading && articles.length>0 && (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <span style={{ fontSize:12, fontWeight:500, color:L.textMuted }}>
              Live data from PubMed/NCBI · {articles.length} articles
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
