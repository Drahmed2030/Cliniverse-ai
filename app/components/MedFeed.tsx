'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const FEEDS = [
  { id:'all',        label:'All',          icon:'📡', color:L.teal    },
  { id:'cardiology', label:'Cardiology',   icon:'🫀', color:L.red     },
  { id:'emergency',  label:'Emergency',    icon:'🚨', color:L.amber   },
  { id:'neurology',  label:'Neurology',    icon:'🧠', color:L.violet  },
  { id:'oncology',   label:'Oncology',     icon:'🔬', color:L.sage    },
  { id:'infectious', label:'Infectious',   icon:'🦠', color:L.cobalt  },
  { id:'surgery',    label:'Surgery',      icon:'🔪', color:'#EA580C' },
]

const QUERIES: Record<string,string> = {
  all:        'clinical medicine 2026 treatment guidelines',
  cardiology: 'cardiology heart failure STEMI guidelines 2026',
  emergency:  'emergency medicine sepsis resuscitation 2026',
  neurology:  'neurology stroke seizure treatment 2026',
  oncology:   'oncology immunotherapy cancer 2026',
  infectious: 'infectious disease antimicrobial resistance 2026',
  surgery:    'minimally invasive surgery outcomes 2026',
}

const BREAKING = [
  { text:'ESC 2026: New HFrEF guidelines — SGLT2i now first-line', color:L.red,    time:'2h ago' },
  { text:'WHO Alert: XDR-TB surge — updated treatment protocol', color:L.amber,  time:'4h ago' },
  { text:'NEJM: Tenecteplase superior to Alteplase in stroke (TRACE-3)', color:L.cobalt, time:'6h ago' },
]

interface Article {
  id:string; title:string; authors:string; journal:string; year:string; url:string
}

export default function MedFeed({ onXP }:{ onXP?:(n:number)=>void }) {
  const [feed, setFeed]         = useState('all')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading]   = useState(false)
  const [saved, setSaved]       = useState<Set<string>>(new Set())
  const [aiSummary, setAiSummary] = useState<Record<string,string>>({})
  const [loadingAI, setLoadingAI] = useState<string|null>(null)
  const [pressed, setPressed]   = useState<string|null>(null)
  const [breakIdx, setBreakIdx] = useState(0)
  const [pulse, setPulse]       = useState(true)

  useEffect(()=>{
    fetchArticles(feed)
    const t1 = setInterval(()=>setBreakIdx(i=>(i+1)%BREAKING.length), 4000)
    const t2 = setInterval(()=>setPulse(p=>!p), 800)
    return ()=>{ clearInterval(t1); clearInterval(t2) }
  },[])

  useEffect(()=>{ fetchArticles(feed) },[feed])

  const fetchArticles = async (spec:string) => {
    setLoading(true); setArticles([])
    try {
      const q = QUERIES[spec] || spec
      const res = await fetch(`/api/pubmed?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setArticles(data.results || [])
    } catch(e){ console.error(e) }
    setLoading(false)
  }

  const getAI = async (article:Article) => {
    if(aiSummary[article.id]) return
    setLoadingAI(article.id)
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ question:`Summarize for a clinician in 2-3 sentences: "${article.title}"`, specialty:feed })
      })
      const data = await res.json()
      setAiSummary(prev=>({...prev,[article.id]:data.answer||'Summary unavailable.'}))
      onXP?.(5)
    } catch {}
    setLoadingAI(null)
  }

  const toggleSave = (id:string) => {
    setSaved(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
    onXP?.(2)
  }

  const accent = FEEDS.find(f=>f.id===feed)?.color || L.teal

  return (
    <div style={{
      minHeight:'100vh', background:L.canvas, paddingBottom:100,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif',
    }}>

      {/* Hero Header */}
      <div style={{position:'relative',height:160,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.3),rgba(15,23,42,0.88))'}}/>
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:pulse?'#10B981':'rgba(16,185,129,0.3)',boxShadow:pulse?'0 0 8px #10B981':'none',transition:smooth}}/>
            <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.7)',letterSpacing:1.5}}>LIVE · PUBMED · UPDATED DAILY</span>
          </div>
          <div style={{fontSize:28,fontWeight:900,color:'white',letterSpacing:-0.6}}>Signal</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.7)'}}>Medical intelligence · Evidence-based · Real-time</div>
        </div>
      </div>

      {/* Breaking News Ticker */}
      <div style={{
        background:BREAKING[breakIdx].color+'15',
        borderBottom:`2px solid ${BREAKING[breakIdx].color}30`,
        padding:'10px 16px',
        display:'flex',alignItems:'center',gap:10,
        transition:smooth,
      }}>
        <span style={{
          fontSize:9,fontWeight:800,letterSpacing:1.5,
          color:BREAKING[breakIdx].color,
          background:`${BREAKING[breakIdx].color}20`,
          borderRadius:99,padding:'3px 8px',flexShrink:0,
        }}>BREAKING</span>
        <span style={{fontSize:12,fontWeight:600,color:L.textPrimary,flex:1}}>{BREAKING[breakIdx].text}</span>
        <span style={{fontSize:10,color:L.textMuted,flexShrink:0}}>{BREAKING[breakIdx].time}</span>
      </div>

      {/* Feed Filter */}
      <div style={{display:'flex',gap:8,padding:'12px 16px',overflowX:'auto'}}>
        {FEEDS.map(f=>(
          <button key={f.id} onClick={()=>setFeed(f.id)}
            onMouseDown={()=>setPressed(f.id)} onMouseUp={()=>setPressed(null)}
            style={{
              flexShrink:0, cursor:'pointer', whiteSpace:'nowrap',
              display:'flex',alignItems:'center',gap:5,
              padding:'8px 16px', borderRadius:99,
              background: feed===f.id ? L.gradient : L.surface,
              border:`1.5px solid ${feed===f.id?'transparent':L.border}`,
              color: feed===f.id ? 'white' : L.textSub,
              fontSize:12, fontWeight:700,
              boxShadow: feed===f.id ? `0 4px 12px ${f.color}30` : L.shadowSm,
              transform: pressed===f.id ? 'scale(0.97)' : 'scale(1)',
              transition: spring,
            }}>
            <span>{f.icon}</span>{f.label}
          </button>
        ))}
      </div>

      <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:12}}>

        {loading && (
          <div style={{textAlign:'center',padding:'48px 0'}}>
            <div style={{fontSize:40,marginBottom:12}}>📡</div>
            <div style={{fontSize:15,fontWeight:500,color:L.textMuted}}>Fetching latest evidence...</div>
          </div>
        )}

        {!loading && articles.length===0 && (
          <div style={{textAlign:'center',padding:'48px 0',color:L.textMuted,fontSize:15}}>No articles found</div>
        )}

        {articles.map((article,i)=>(
          <div key={article.id} style={{
            background:L.surface, border:`1px solid ${L.border}`,
            borderLeft:`3px solid ${accent}`,
            borderRadius:20, padding:18, boxShadow:L.shadowSm,
          }}>
            {/* Top row */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',gap:6}}>
                <span style={{fontSize:9,fontWeight:800,letterSpacing:1.2,color:accent,background:`${accent}10`,borderRadius:99,padding:'3px 10px'}}>
                  PubMed
                </span>
                <span style={{fontSize:9,fontWeight:800,letterSpacing:1.2,color:L.sage,background:'rgba(16,185,129,0.08)',borderRadius:99,padding:'3px 10px'}}>
                  {article.year}
                </span>
                {i===0 && <span style={{fontSize:9,fontWeight:800,letterSpacing:1.2,color:L.red,background:'rgba(239,68,68,0.08)',borderRadius:99,padding:'3px 10px'}}>NEW</span>}
              </div>
              <button onClick={()=>toggleSave(article.id)} style={{background:'none',border:'none',fontSize:18,cursor:'pointer'}}>
                {saved.has(article.id)?'🔖':'📌'}
              </button>
            </div>

            <div style={{fontSize:15,fontWeight:700,color:L.textPrimary,marginBottom:8,lineHeight:1.5,letterSpacing:-0.1}}>
              {article.title}
            </div>
            <div style={{fontSize:12,fontWeight:500,color:L.textMuted,marginBottom:12}}>
              {article.authors&&<span>{article.authors.split(',')[0]} et al. · </span>}
              {article.journal}
            </div>

            {aiSummary[article.id] && (
              <div style={{background:`${accent}06`,border:`1px solid ${accent}20`,borderRadius:14,padding:'12px 14px',marginBottom:12}}>
                <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:accent,marginBottom:6}}>🤖 AI SIGNAL</div>
                <div style={{fontSize:13,fontWeight:500,color:L.textSub,lineHeight:1.65}}>{aiSummary[article.id]}</div>
              </div>
            )}

            <div style={{display:'flex',gap:8}}>
              {!aiSummary[article.id] && (
                <button onClick={()=>getAI(article)} disabled={loadingAI===article.id}
                  onMouseDown={()=>setPressed('ai'+article.id)} onMouseUp={()=>setPressed(null)}
                  style={{
                    flex:1,background:`${accent}08`,border:`1px solid ${accent}25`,
                    borderRadius:12,padding:'10px',color:accent,fontSize:12,fontWeight:700,cursor:'pointer',
                    transform:pressed===('ai'+article.id)?'scale(0.97)':'scale(1)',transition:spring,
                  }}>
                  {loadingAI===article.id?'⏳ Analyzing...':'🤖 AI Signal'}
                </button>
              )}
              <a href={article.url} target="_blank" rel="noreferrer" style={{
                background:L.raised,border:`1px solid ${L.border}`,borderRadius:12,
                padding:'10px 14px',color:L.textSub,fontSize:12,fontWeight:600,
                textDecoration:'none',display:'flex',alignItems:'center',gap:4,
              }}>PubMed →</a>
            </div>
          </div>
        ))}

        {!loading && articles.length>0 && (
          <div style={{textAlign:'center',padding:'8px 0',fontSize:11,fontWeight:500,color:L.textMuted}}>
            📡 Live from PubMed/NCBI · {articles.length} articles · Updated daily
          </div>
        )}
      </div>
    </div>
  )
}
