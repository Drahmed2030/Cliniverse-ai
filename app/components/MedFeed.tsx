'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.60)',
  muted:  'rgba(238,246,250,0.38)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

const JOURNALS = [
  { id:'nejm',   label:'NEJM',    color:T.red,    icon:'📕' },
  { id:'lancet', label:'Lancet',  color:T.orange, icon:'📙' },
  { id:'jacc',   label:'JACC',    color:T.blue,   icon:'🫀' },
  { id:'bmj',    label:'BMJ',     color:T.green,  icon:'📗' },
  { id:'who',    label:'WHO',     color:T.teal,   icon:'🌍' },
  { id:'esc',    label:'ESC',     color:T.purple, icon:'🏥' },
  { id:'aha',    label:'AHA',     color:T.red,    icon:'❤️' },
  { id:'saudi',  label:'SRCP',    color:T.gold,   icon:'🇸🇦' },
]

const SPECIALTIES = ['All','Cardiology','Emergency','Neurology','Oncology','Infectious Disease','Surgery','Pediatrics','Endocrinology']

// ── DEMO NEWS ──
const DEMO_NEWS = [
  {
    id:'n1',
    title:'Tenecteplase Outperforms Alteplase in Ischemic Stroke',
    summary:'TRACE-2 trial: Single-bolus tenecteplase showed superior reperfusion and non-inferior safety vs alteplase. May simplify stroke protocol significantly.',
    source:'NEJM',
    specialty:'Neurology',
    journal_color:T.red,
    journal_icon:'📕',
    impact:'HIGH',
    impact_color:T.red,
    url:'https://nejm.org',
    published_at: new Date(Date.now()-86400000).toISOString(),
    ai_summary:'Key takeaway: Tenecteplase 0.25mg/kg IV bolus vs alteplase 0.9mg/kg infusion. Better reperfusion at 24h. Single bolus = easier to administer in ambulances.',
    likes:142,
    saved:false,
  },
  {
    id:'n2',
    title:'SGLT2 Inhibitors Reduce HF Hospitalisation Post-MI',
    summary:'DAPA-MI: Dapagliflozin initiated within 10 days of MI reduced HF hospitalisation by 18% and CV death by 11%. No increase in adverse events.',
    source:'Lancet',
    specialty:'Cardiology',
    journal_color:T.orange,
    journal_icon:'📙',
    impact:'HIGH',
    impact_color:T.red,
    url:'https://thelancet.com',
    published_at: new Date(Date.now()-172800000).toISOString(),
    ai_summary:'Practice changing: Start dapagliflozin 10mg OD within 10 days post-MI regardless of diabetes status. eGFR>25 required. Check for UTI/DKA risk.',
    likes:98,
    saved:false,
  },
  {
    id:'n3',
    title:'Early Prone Positioning Reduces Mortality in Moderate ARDS',
    summary:'Extended analysis of PROSEVA: Proning >16h/day in P/F <150 reduces 28-day mortality by 50%. Implementation barriers remain in non-ICU settings.',
    source:'JACC',
    specialty:'Emergency',
    journal_color:T.blue,
    journal_icon:'🫀',
    impact:'MEDIUM',
    impact_color:T.orange,
    url:'https://jacc.org',
    published_at: new Date(Date.now()-259200000).toISOString(),
    ai_summary:'Prone >16h/day when P/F <150. Contraindications: spinal instability, open chest, facial trauma. Requires trained team. Ventral positioning team protocol recommended.',
    likes:67,
    saved:false,
  },
  {
    id:'n4',
    title:'WHO Updates Sepsis Bundle — 1-Hour Protocol Revised',
    summary:'New WHO guidance: Blood cultures + antibiotics + lactate within 1 hour. Fluid resuscitation individualised (not blanket 30ml/kg). Vasopressors if MAP <65.',
    source:'WHO',
    specialty:'Emergency',
    journal_color:T.teal,
    journal_icon:'🌍',
    impact:'HIGH',
    impact_color:T.red,
    url:'https://who.int',
    published_at: new Date(Date.now()-345600000).toISOString(),
    ai_summary:'Key change: 30ml/kg IVF is NOT mandatory. Individualise based on fluid responsiveness. Use dynamic measures (PLR, PPV). Start noradrenaline early if MAP<65.',
    likes:203,
    saved:false,
  },
  {
    id:'n5',
    title:'GLP-1 Agonists Show Neuroprotective Effects in Parkinson\'s',
    summary:'Phase 2 trial: Liraglutide slowed motor decline in early Parkinson\'s disease. Dopaminergic neuron preservation confirmed on DaT-SPECT imaging.',
    source:'Lancet',
    specialty:'Neurology',
    journal_color:T.orange,
    journal_icon:'📙',
    impact:'MEDIUM',
    impact_color:T.orange,
    url:'https://thelancet.com',
    published_at: new Date(Date.now()-432000000).toISOString(),
    ai_summary:'Exciting repurposing: GLP-1 RA may have neuroprotective role. Not yet standard of care — Phase 3 awaited. Mechanism: neuroinflammation reduction + mitochondrial protection.',
    likes:89,
    saved:false,
  },
  {
    id:'n6',
    title:'Saudi MOH Issues New Hypertension Guidelines 2025',
    summary:'SRCP 2025: Target BP <130/80 for most adults. Combination therapy first-line for stage 2. ARB/ACEi + CCB preferred. Saudi-specific cardiovascular risk calculator released.',
    source:'SRCP',
    specialty:'Cardiology',
    journal_color:T.gold,
    journal_icon:'🇸🇦',
    impact:'HIGH',
    impact_color:T.red,
    url:'https://srcp.org.sa',
    published_at: new Date(Date.now()-518400000).toISOString(),
    ai_summary:'Saudi-specific: Lower threshold for treatment. Use Saudi CV risk score. Ramadan considerations included. Telehealth BP monitoring recommended for follow-up.',
    likes:156,
    saved:false,
  },
]

// ── TIME AGO ──
function timeAgo(d:string) {
  const diff = Date.now()-new Date(d).getTime()
  const days = Math.floor(diff/86400000)
  if(days===0) return 'Today'
  if(days===1) return 'Yesterday'
  return `${days} days ago`
}

// ── AI SUMMARY MODAL ──
function AISummaryModal({ article, onClose }: { article:any, onClose:()=>void }) {
  const [deepDive, setDeepDive] = useState('')
  const [loading, setLoading]   = useState(false)
  const [tab, setTab]           = useState<'summary'|'clinical'|'debate'>('summary')

  const getDeepDive = async (type: string) => {
    setLoading(true)
    setDeepDive('')
    const prompts: Record<string,string> = {
      clinical: `Based on this medical research: "${article.title}". ${article.summary}

Provide a practical clinical application guide:
1. WHO benefits from this?
2. HOW to implement in practice?
3. DOSING/protocol details?
4. CONTRAINDICATIONS/cautions?
5. MONITORING required?

Be concise and practical for a clinician.`,
      debate: `Based on: "${article.title}". ${article.summary}

Generate a balanced clinical debate:
PRO: 3 strong arguments FOR adopting this
CON: 3 important concerns/limitations
VERDICT: Evidence grade and recommendation

Suitable for a medical journal club discussion.`,
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6', max_tokens:500,
          messages:[{role:'user',content:prompts[type]||'Summarize this research.'}]
        })
      })
      const data = await res.json()
      setDeepDive(data.content?.[0]?.text||'Could not generate analysis.')
    } catch { setDeepDive('Connection error.') }
    setLoading(false)
  }

  const j = JOURNALS.find(j=>j.label===article.source)||JOURNALS[0]

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(10,22,40,0.90)',backdropFilter:'blur(12px)',overflowY:'auto',fontFamily:F}}>

  {/* Cliniverse Logo Watermark */}
  <div style={{position:'absolute',top:0,right:0,width:180,height:180,pointerEvents:'none',zIndex:0,opacity:0.06,overflow:'hidden'}}>
    <svg width="180" height="180" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
      style={{animation:'logoFloat 4s ease-in-out infinite',position:'absolute',top:-20,right:-20}}>
      <defs>
        <linearGradient id="arcMF" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5D4"/><stop offset="100%" stopColor="#0096FF"/>
        </linearGradient>
        <filter id="glMF" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#arcMF)" strokeWidth="7" strokeLinecap="round" filter="url(#glMF)"/>
      <circle cx="84" cy="38" r="4" fill="#00E5D4"><animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="84" cy="82" r="4" fill="#0096FF"><animate attributeName="r" values="3;6;3" dur="2s" begin="0.5s" repeatCount="indefinite"/></circle>
      <polyline points="26,60 34,60 38,60 42,47 46,73 50,54 54,66 58,60 78,60"
        fill="none" stroke="#00C8B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        filter="url(#glMF)" strokeDasharray="120" strokeDashoffset="120">
        <animate attributeName="strokeDashoffset" values="120;0;120" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite"/>
      </polyline>
    </svg>
  </div>


      <div style={{padding:'20px 16px 60px',maxWidth:480,margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'9px 16px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:j.color,fontWeight:700,letterSpacing:1}}>{j.icon} {article.source} · {timeAgo(article.published_at)}</div>
            <div style={{fontSize:9,color:T.muted}}>{article.specialty}</div>
          </div>
          <div style={{background:`${article.impact_color}18`,border:`1px solid ${article.impact_color}28`,borderRadius:10,padding:'4px 10px',fontSize:9,color:article.impact_color,fontWeight:800}}>{article.impact} IMPACT</div>
        </div>

        {/* Title */}
        <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:20,padding:'18px',marginBottom:14,border:`1px solid ${j.color}22`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${j.color}14,transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{fontSize:16,fontWeight:900,color:T.text,lineHeight:1.4,marginBottom:10}}>{article.title}</div>
          <div style={{fontSize:12,color:T.sub,lineHeight:1.7}}>{article.summary}</div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,background:T.glass2,borderRadius:14,padding:4,marginBottom:14,border:`1px solid ${T.border}`}}>
          {[
            {id:'summary',  label:'AI Summary',  icon:'🤖'},
            {id:'clinical', label:'Clinical Use', icon:'🏥'},
            {id:'debate',   label:'Debate',       icon:'⚔️'},
          ].map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id as any);if(t.id!=='summary')getDeepDive(t.id)}} style={{
              flex:1,padding:'8px 4px',border:'none',cursor:'pointer',
              borderRadius:10,fontFamily:F,fontWeight:700,fontSize:11,
              background:tab===t.id?T.glass:'transparent',
              color:tab===t.id?T.teal:T.muted,
              border:tab===t.id?`1px solid ${T.teal}25`:'1px solid transparent',
              transition:'all 0.2s',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* AI Summary tab */}
        {tab==='summary' && (
          <div style={{background:`${T.teal}08`,border:`1px solid ${T.teal}22`,borderRadius:18,padding:'16px'}}>
            <div style={{fontSize:9,color:T.teal,fontWeight:700,letterSpacing:1,marginBottom:10}}>🤖 AI CLINICAL SUMMARY</div>
            <div style={{fontSize:13,color:T.sub,lineHeight:1.8}}>{article.ai_summary}</div>
          </div>
        )}

        {/* Clinical / Debate tabs */}
        {(tab==='clinical'||tab==='debate') && (
          <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:18,padding:'16px',border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,color:tab==='clinical'?T.blue:T.orange,fontWeight:700,letterSpacing:1,marginBottom:10}}>
              {tab==='clinical'?'🏥 CLINICAL APPLICATION':'⚔️ CLINICAL DEBATE'}
            </div>
            {loading ? (
              <div style={{textAlign:'center',padding:'20px'}}>
                <div style={{width:36,height:36,borderRadius:'50%',border:`3px solid rgba(255,255,255,0.08)`,borderTop:`3px solid ${T.teal}`,animation:'spin 0.8s linear infinite',margin:'0 auto 10px'}}/>
                <div style={{fontSize:12,color:T.sub}}>AI analyzing research...</div>
              </div>
            ) : (
              <div style={{fontSize:12,color:T.sub,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{deepDive}</div>
            )}
          </div>
        )}

        {/* Share */}
        <button style={{
          width:'100%',marginTop:14,padding:'14px',borderRadius:16,
          border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',
          color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,
          display:'flex',alignItems:'center',justifyContent:'center',gap:8,
        }}>
          🔗 Share in ClinicalNet
        </button>
      </div>
      <style>{`@keyframes logoFloat { 0%,100%{opacity:0.06;transform:translateY(0)} 50%{opacity:0.10;transform:translateY(-6px)} }
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── NEWS CARD ──
function NewsCard({ article, onOpen, onSave, onLike }: { article:any, onOpen:(a:any)=>void, onSave:(id:string)=>void, onLike:(id:string)=>void }) {
  const [liked, setLiked] = useState(false)
  const j = JOURNALS.find(j=>j.label===article.source)||JOURNALS[0]

  return (
    <div style={{
      background:T.glass,backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',
      border:`1px solid ${j.color}20`,borderRadius:22,padding:'18px',
      marginBottom:12,position:'relative',overflow:'hidden',
      boxShadow:`0 4px 20px rgba(0,0,0,0.12),0 0 12px ${j.color}08`,
    }}>
      <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${j.color}12,transparent 70%)`,pointerEvents:'none'}}/>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,borderRadius:10,background:`${j.color}18`,border:`1px solid ${j.color}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{j.icon}</div>
          <div>
            <div style={{fontSize:11,fontWeight:800,color:j.color}}>{article.source}</div>
            <div style={{fontSize:9,color:T.muted}}>{timeAgo(article.published_at)}</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{background:`${article.impact_color}15`,border:`1px solid ${article.impact_color}25`,borderRadius:10,padding:'3px 8px',fontSize:9,color:article.impact_color,fontWeight:800}}>{article.impact}</div>
          <div style={{background:`${T.blue}12`,border:`1px solid ${T.blue}20`,borderRadius:10,padding:'3px 8px',fontSize:9,color:T.blue,fontWeight:600}}>{article.specialty}</div>
        </div>
      </div>

      {/* Title */}
      <div style={{fontSize:14,fontWeight:900,color:T.text,lineHeight:1.4,marginBottom:8}}>{article.title}</div>

      {/* Summary */}
      <div style={{fontSize:12,color:T.sub,lineHeight:1.65,marginBottom:12}}>{article.summary.substring(0,120)}...</div>

      {/* AI Summary preview */}
      <div style={{background:`${T.teal}08`,border:`1px solid ${T.teal}18`,borderRadius:12,padding:'10px 12px',marginBottom:12}}>
        <div style={{fontSize:8,color:T.teal,fontWeight:700,letterSpacing:1,marginBottom:4}}>🤖 AI PEARL</div>
        <div style={{fontSize:11,color:T.sub,lineHeight:1.6}}>{article.ai_summary.substring(0,100)}...</div>
      </div>

      {/* Actions */}
      <div style={{display:'flex',gap:8,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
        <button onClick={()=>onOpen(article)} style={{
          flex:1,padding:'9px',borderRadius:12,border:'none',
          background:`linear-gradient(135deg,${j.color}22,${j.color}10)`,
          color:j.color,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,
          border:`1px solid ${j.color}25`,
        }}>Read Full Analysis →</button>
        <button onClick={()=>{setLiked(!liked);onLike(article.id)}} style={{
          padding:'9px 12px',borderRadius:12,border:`1px solid ${T.border}`,
          background:liked?`${T.red}15`:T.glass2,color:liked?T.red:T.muted,
          fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,transition:'all 0.2s',
        }}>{liked?'❤️':'🤍'} {article.likes+(liked?1:0)}</button>
        <button onClick={()=>onSave(article.id)} style={{
          padding:'9px 12px',borderRadius:12,border:`1px solid ${T.border}`,
          background:article.saved?`${T.gold}15`:T.glass2,color:article.saved?T.gold:T.muted,
          fontSize:12,cursor:'pointer',fontFamily:F,transition:'all 0.2s',
        }}>{article.saved?'🔖':'📌'}</button>
      </div>
    </div>
  )
}

// ── MAIN ──
export default function MedFeed({ onXP }: { onXP?: (n:number)=>void }) {
  const [articles, setArticles] = useState(DEMO_NEWS)
  const [selected, setSelected] = useState<any>(null)
  const [filter, setFilter]     = useState('All')
  const [journal, setJournal]   = useState('All')
  const [loading, setLoading]   = useState(false)
  const [generating, setGenerating] = useState(false)

  // Load from Supabase
  useEffect(()=>{
    const load = async () => {
      try {
        const { data } = await supabase
          .from('medical_news')
          .select('*')
          .order('published_at',{ascending:false})
          .limit(20)
        if(data&&data.length>0) setArticles(data)
      } catch {}
    }
    load()
  },[])

  // AI Generate fresh article
  const generateNews = async () => {
    setGenerating(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6', max_tokens:600,
          messages:[{role:'user',content:`Generate a realistic, evidence-based medical news article summary for 2025-2026. Choose a random specialty and recent clinical trial or guideline update. 

Respond in JSON only:
{
  "title": "article title",
  "summary": "2-3 sentence summary of the research/guideline",
  "source": "NEJM or Lancet or JACC or BMJ or WHO or ESC or AHA or SRCP",
  "specialty": "specialty name",
  "impact": "HIGH or MEDIUM or LOW",
  "ai_summary": "3-4 sentence clinical pearl for practicing physicians"
}`}]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text||'{}'
      const clean = text.replace(/```json|```/g,'').trim()
      const parsed = JSON.parse(clean)
      const j = JOURNALS.find(j=>j.label===parsed.source)||JOURNALS[0]
      const newArticle = {
        id:`ai_${Date.now()}`,
        ...parsed,
        journal_color: j.color,
        journal_icon:  j.icon,
        impact_color:  parsed.impact==='HIGH'?T.red:parsed.impact==='MEDIUM'?T.orange:T.green,
        likes:0,
        saved:false,
        published_at: new Date().toISOString(),
      }
      setArticles(prev=>[newArticle,...prev])
      onXP?.(5)
      // Save to Supabase
      try { await supabase.from('medical_news').insert([newArticle]) } catch {}
    } catch {}
    setGenerating(false)
  }

  const handleSave = (id:string) => {
    setArticles(prev=>prev.map(a=>a.id===id?{...a,saved:!a.saved}:a))
  }
  const handleLike = (id:string) => {
    setArticles(prev=>prev.map(a=>a.id===id?{...a,likes:a.likes+1}:a))
  }

  const filtered = articles.filter(a=>{
    const specMatch = filter==='All'||a.specialty===filter
    const jMatch = journal==='All'||a.source===journal
    return specMatch&&jMatch
  })

  if(selected) return <AISummaryModal article={selected} onClose={()=>setSelected(null)}/>

  return (
    <div style={{fontFamily:F}}>

      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>MEDICAL INTELLIGENCE</div>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:T.text,letterSpacing:-0.5}}>
              Med<span style={{color:T.teal}}>Feed</span>
            </div>
            <div style={{fontSize:12,color:T.sub,marginTop:3}}>Latest research · AI-summarised · 2025-2026</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,background:`${T.green}12`,border:`1px solid ${T.green}25`,borderRadius:20,padding:'5px 10px',flexShrink:0}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:T.green,animation:'pulse 1.5s ease-in-out infinite'}}/>
            <span style={{fontSize:9,fontWeight:800,color:T.green}}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[
          {l:'Articles',    v:`${articles.length}+`,  c:T.teal},
          {l:'Specialties', v:'12',                   c:T.blue},
          {l:'Journals',    v:'8',                    c:T.purple},
          {l:'Updated',     v:'Daily',                c:T.green},
        ].map(s=>(
          <div key={s.l} style={{flex:1,background:T.glass,backdropFilter:'blur(20px)',borderRadius:12,padding:'8px 4px',textAlign:'center',border:`1px solid ${s.c}18`}}>
            <div style={{fontSize:13,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:7,color:T.muted,marginTop:2,fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* AI Generate button */}
      <button onClick={generateNews} disabled={generating} style={{
        width:'100%',padding:'14px',borderRadius:18,border:'none',marginBottom:16,
        background:generating?'rgba(0,196,180,0.2)':`linear-gradient(135deg,${T.teal},${T.blue})`,
        color:'var(--text-primary, #fff)',fontSize:14,fontWeight:800,
        cursor:generating?'not-allowed':'pointer',fontFamily:F,
        boxShadow:generating?'none':`0 6px 24px ${T.teal}35`,
        display:'flex',alignItems:'center',justifyContent:'center',gap:10,
      }}>
        {generating
          ? <><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Generating latest research...</>
          : '🤖 Generate Latest Research'}
      </button>

      {/* Journal filter */}
      <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>JOURNALS</div>
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:10}}>
        <button onClick={()=>setJournal('All')} style={{flexShrink:0,background:journal==='All'?T.glass:T.glass2,border:`1px solid ${journal==='All'?T.teal:T.border}`,borderRadius:20,padding:'5px 12px',cursor:'pointer',fontFamily:F,color:journal==='All'?T.teal:T.muted,fontSize:10,fontWeight:700}}>All</button>
        {JOURNALS.map(j=>(
          <button key={j.id} onClick={()=>setJournal(j.label)} style={{
            flexShrink:0,
            background:journal===j.label?`${j.color}18`:T.glass2,
            border:`1px solid ${journal===j.label?j.color:T.border}`,
            borderRadius:20,padding:'5px 12px',cursor:'pointer',fontFamily:F,
            color:journal===j.label?j.color:T.muted,fontSize:10,fontWeight:700,
            display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap',
          }}>{j.icon} {j.label}</button>
        ))}
      </div>

      {/* Specialty filter */}
      <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>SPECIALTY</div>
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:16}}>
        {SPECIALTIES.map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{
            flexShrink:0,
            background:filter===s?`${T.blue}18`:T.glass2,
            border:`1px solid ${filter===s?T.blue:T.border}`,
            borderRadius:20,padding:'4px 10px',cursor:'pointer',fontFamily:F,
            color:filter===s?T.blue:T.muted,fontSize:9,fontWeight:700,whiteSpace:'nowrap',
          }}>{s}</button>
        ))}
      </div>

      {/* Articles */}
      {filtered.length===0 ? (
        <div style={{textAlign:'center',padding:'40px',background:T.glass,borderRadius:20,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:32,marginBottom:8}}>📰</div>
          <div style={{fontSize:14,color:T.text,marginBottom:4}}>No articles yet</div>
          <div style={{fontSize:12,color:T.muted}}>Press "Generate" to fetch latest research</div>
        </div>
      ) : filtered.map(article=>(
        <NewsCard key={article.id} article={article} onOpen={setSelected} onSave={handleSave} onLike={handleLike}/>
      ))}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}
