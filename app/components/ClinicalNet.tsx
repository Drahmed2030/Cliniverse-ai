'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED', orange:'#EA580C', pink:'#DB2777',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const POST_TYPES = [
  { id:'case',    label:'Case Thread',      icon:'🏥', color:L.red    },
  { id:'debate',  label:'Evidence Battle',  icon:'⚔️', color:L.amber  },
  { id:'pearl',   label:'Clinical Pearl',   icon:'💎', color:L.teal   },
  { id:'question',label:'Ask Colleagues',   icon:'❓', color:L.cobalt },
  { id:'news',    label:'Breaking',         icon:'📡', color:L.violet },
]

const SPECIALTIES = ['All','Cardiology','Emergency','Internal Medicine','Neurology','Critical Care','Surgery','Pediatrics']

const COUNTRIES: Record<string,string> = {
  'KSA':'🇸🇦','UAE':'🇦🇪','UK':'🇬🇧','USA':'🇺🇸',
  'Egypt':'🇪🇬','Jordan':'🇯🇴','India':'🇮🇳','Germany':'🇩🇪',
}

const DEMO_POSTS = [
  {
    id:'d1', doctor_name:'Dr. Ahmed Al-Rashidi', doctor_specialty:'Cardiology',
    doctor_country:'KSA', post_type:'case', specialty_tag:'Cardiology',
    content:'🫀 58M, anterior STEMI, door-to-balloon 52min. Post-PCI EF 35%. Started GDMT. Question: when to initiate SGLT2i post-MI? ACC 2026 suggests early initiation. Real-world experience?',
    likes:24, comments_count:8, is_anonymous:false,
    created_at:new Date(Date.now()-3600000).toISOString(),
  },
  {
    id:'d2', doctor_name:'Dr. Sarah Mitchell', doctor_specialty:'Emergency',
    doctor_country:'UK', post_type:'debate', specialty_tag:'Emergency',
    content:'⚔️ EVIDENCE BATTLE: Rural STEMI, 3h transfer time. Primary PCI vs Thrombolysis? ESC 2026 still favors PCI if <120min total ischemic time. But STREAM-2 trial challenges this. Vote below 👇',
    likes:41, comments_count:15, is_anonymous:false,
    created_at:new Date(Date.now()-7200000).toISOString(),
  },
  {
    id:'d3', doctor_name:'Anonymous', doctor_specialty:'Critical Care',
    doctor_country:'UAE', post_type:'pearl', specialty_tag:'Critical Care',
    content:'💎 Septic shock pearl: Noradrenaline first-line. If refractory >0.25mcg/kg/min → add Vasopressin 0.03 units/min BEFORE escalating. Reduces noradrenaline requirements by 30% (VASST trial). Save a kidney today.',
    likes:89, comments_count:22, is_anonymous:true,
    created_at:new Date(Date.now()-10800000).toISOString(),
  },
  {
    id:'d4', doctor_name:'Dr. Omar Hassan', doctor_specialty:'Neurology',
    doctor_country:'Egypt', post_type:'news', specialty_tag:'Neurology',
    content:'📡 BREAKING — NEJM 2026: Tenecteplase outperforms Alteplase in ischemic stroke (TRACE-3 trial). Single bolus vs 60min infusion. NNT=12 for good outcome. Game changer for stroke units?',
    likes:134, comments_count:31, is_anonymous:false,
    created_at:new Date(Date.now()-86400000).toISOString(),
  },
]

function timeAgo(d:string) {
  const diff = Date.now()-new Date(d).getTime()
  const m = Math.floor(diff/60000)
  if(m<1) return 'just now'
  if(m<60) return `${m}m`
  const h = Math.floor(m/60)
  if(h<24) return `${h}h`
  return `${Math.floor(h/24)}d`
}


function CommentsSheet({ post, onClose }:{ post:any, onClose:()=>void }) {
  const [comments, setComments] = useState<any[]>([
    { id:'c1', name:'Dr. Khalid Hassan', specialty:'Cardiology', country:'🇸🇦',
      text:'Great case! We initiate SGLT2i at 4-6 weeks post-MI once stable. DAPA-MI trial supports early use.', time:'30m ago', likes:5 },
    { id:'c2', name:'Dr. Nora Al-Qasim', specialty:'Internal Medicine', country:'🇦🇪',
      text:'Agree with @Dr. Khalid. Also check eGFR >20 threshold — new ADA 2026 guideline update.', time:'15m ago', likes:3 },
  ])
  const [input, setInput]   = useState('')
  const [name, setName]     = useState('Dr. Ahmed')
  const [posting, setPosting] = useState(false)
  const pt = POST_TYPES.find(t=>t.id===post.post_type)||POST_TYPES[0]

  const addComment = async () => {
    if(!input.trim()) return
    setPosting(true)
    const c = {
      id:`c_${Date.now()}`,
      name, specialty:'Cardiology', country:'🇸🇦',
      text:input.trim(), time:'just now', likes:0,
    }
    setComments(prev=>[...prev,c])
    setInput('')
    setPosting(false)
  }

  // Parse @mentions and links
  const parseText = (text:string) => {
    const parts = text.split(/(@\w+[\w.]*|https?:\/\/\S+)/g)
    return parts.map((part,i)=>{
      if(part.startsWith('@'))
        return <span key={i} style={{color:L.teal,fontWeight:700,cursor:'pointer'}}>{part}</span>
      if(part.startsWith('http'))
        return <a key={i} href={part} target="_blank" rel="noreferrer"
          style={{color:L.cobalt,fontWeight:600,textDecoration:'underline'}}>{part.length>30?part.slice(0,30)+'...':part}</a>
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(15,23,42,0.6)',backdropFilter:'blur(16px)',display:'flex',flexDirection:'column',fontFamily:'inherit'}}>

      {/* Header */}
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${L.border}`,background:L.surface,display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={onClose} style={{background:L.raised,border:`1px solid ${L.border}`,borderRadius:12,padding:'8px 14px',color:L.textSub,fontSize:13,fontWeight:700,cursor:'pointer'}}>←</button>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:L.textPrimary}}>💬 Discussion</div>
          <div style={{fontSize:11,fontWeight:600,color:pt.color}}>{pt.icon} {pt.label} · {comments.length} replies</div>
        </div>
      </div>

      {/* Original post */}
      <div style={{padding:'14px 16px',borderBottom:`1px solid ${L.border}`,background:`${pt.color}04`,flexShrink:0}}>
        <div style={{fontSize:13,fontWeight:700,color:L.textPrimary,marginBottom:4}}>{post.doctor_name}</div>
        <div style={{fontSize:13,color:L.textSub,lineHeight:1.6}}>{post.content.substring(0,180)}{post.content.length>180?'...':''}</div>
      </div>

      {/* Comments */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px',background:L.canvas}}>

        {/* Engagement prompt */}
        <div style={{
          background:'rgba(13,148,136,0.06)',border:'1px solid rgba(13,148,136,0.15)',
          borderRadius:14,padding:'10px 14px',marginBottom:16,
          display:'flex',alignItems:'center',gap:8,
        }}>
          <span style={{fontSize:16}}>💡</span>
          <span style={{fontSize:12,color:L.teal,fontWeight:600}}>
            Use @name to mention colleagues · Share links · Add evidence
          </span>
        </div>

        {comments.map((c,i)=>(
          <div key={c.id||i} style={{display:'flex',gap:10,marginBottom:16}}>
            <div style={{width:38,height:38,borderRadius:12,background:'rgba(13,148,136,0.08)',border:'1px solid rgba(13,148,136,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
              👨‍⚕️
            </div>
            <div style={{flex:1}}>
              <div style={{background:L.surface,borderRadius:16,borderBottomLeftRadius:4,padding:'12px 14px',border:`1px solid ${L.border}`,boxShadow:L.shadowSm}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:700,color:L.textPrimary}}>{c.name}</span>
                  <span style={{fontSize:10,color:L.teal,fontWeight:600}}>{c.specialty}</span>
                  <span style={{fontSize:12}}>{c.country}</span>
                  <span style={{fontSize:10,color:L.textMuted,marginLeft:'auto'}}>{c.time}</span>
                </div>
                <div style={{fontSize:13,color:L.textSub,lineHeight:1.65}}>
                  {parseText(c.text)}
                </div>
              </div>
              {/* Comment actions */}
              <div style={{display:'flex',gap:12,marginTop:6,paddingLeft:4}}>
                <button style={{fontSize:11,color:L.textMuted,fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>
                  ❤️ {c.likes}
                </button>
                <button onClick={()=>setInput(`@${c.name.split(' ')[1]||c.name} `)}
                  style={{fontSize:11,color:L.teal,fontWeight:600,background:'none',border:'none',cursor:'pointer'}}>
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social share strip */}
      <div style={{padding:'8px 16px',background:L.surface,borderTop:`1px solid ${L.border}`,display:'flex',gap:8,flexShrink:0}}>
        <span style={{fontSize:11,color:L.textMuted,fontWeight:600,alignSelf:'center'}}>Share:</span>
        {[
          {icon:'𝕏', label:'X', url:`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content.substring(0,200))}`},
          {icon:'in', label:'LinkedIn', url:`https://linkedin.com/sharing/share-offsite/?url=https://cliniverse.ai`},
          {icon:'📱', label:'WhatsApp', url:`https://wa.me/?text=${encodeURIComponent(post.content.substring(0,200))}`},
        ].map(s=>(
          <a key={s.label} href={s.url} target="_blank" rel="noreferrer" style={{
            padding:'5px 12px',borderRadius:99,
            background:L.raised,border:`1px solid ${L.border}`,
            fontSize:11,fontWeight:700,color:L.textSub,
            textDecoration:'none',display:'flex',alignItems:'center',gap:4,
          }}>{s.icon} {s.label}</a>
        ))}
      </div>

      {/* Input */}
      <div style={{padding:'10px 16px 24px',borderTop:`1px solid ${L.border}`,background:L.surface,flexShrink:0}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"
          style={{width:'100%',padding:'8px 14px',borderRadius:10,boxSizing:'border-box',border:`1px solid ${L.border}`,background:L.raised,color:L.textPrimary,fontSize:12,outline:'none',marginBottom:8,fontFamily:'inherit'}}/>
        <div style={{display:'flex',gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addComment()}
            placeholder="Add to discussion... @mention or paste a link"
            style={{flex:1,padding:'12px 16px',borderRadius:14,border:`1px solid ${L.border}`,background:L.raised,color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
          <button onClick={addComment} disabled={posting||!input.trim()} style={{
            padding:'12px 18px',borderRadius:14,border:'none',cursor:'pointer',
            background:!input.trim()?L.raised:L.gradient,
            color:!input.trim()?L.textMuted:'white',
            fontSize:13,fontWeight:700,
          }}>→</button>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, onLike }:{ post:any, onLike:(id:string)=>void }) {
  const pt = POST_TYPES.find(t=>t.id===post.post_type)||POST_TYPES[0]
  const flag = COUNTRIES[post.doctor_country]||'🌍'
  const [liked, setLiked]     = useState(false)
  const [pressed, setPressed] = useState<string|null>(null)
  const [showComments, setShowComments] = useState(false)

  return (
    <>
    {showComments && <CommentsSheet post={post} onClose={()=>setShowComments(false)}/>}
    <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:12,boxShadow:L.shadowSm}}>
      {/* Type badge + time */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:6,background:`${pt.color}10`,border:`1px solid ${pt.color}25`,borderRadius:99,padding:'4px 12px'}}>
          <span style={{fontSize:12}}>{pt.icon}</span>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:pt.color}}>{pt.label.toUpperCase()}</span>
        </div>
        <span style={{fontSize:11,color:L.textMuted}}>{timeAgo(post.created_at)}</span>
      </div>

      {/* Author */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <div style={{width:40,height:40,borderRadius:13,background:`${pt.color}10`,border:`1px solid ${pt.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
          {post.is_anonymous?'🥷':'👨‍⚕️'}
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:L.textPrimary}}>
            {post.doctor_name} {!post.is_anonymous&&<span>{flag}</span>}
          </div>
          <div style={{fontSize:11,fontWeight:600,color:pt.color}}>{post.doctor_specialty}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{fontSize:14,fontWeight:500,color:L.textSub,lineHeight:1.7,marginBottom:12}}>
        {post.content}
      </div>

      {/* Tag */}
      {post.specialty_tag && (
        <div style={{marginBottom:12}}>
          <span style={{fontSize:11,fontWeight:600,color:L.teal,background:'rgba(13,148,136,0.08)',border:'1px solid rgba(13,148,136,0.2)',borderRadius:99,padding:'3px 12px'}}>
            #{post.specialty_tag}
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{display:'flex',gap:8,paddingTop:12,borderTop:`1px solid ${L.border}`}}>
        <button onClick={()=>{setLiked(!liked);onLike(post.id)}}
          onMouseDown={()=>setPressed('like')} onMouseUp={()=>setPressed(null)}
          style={{
            display:'flex',alignItems:'center',gap:5,cursor:'pointer',
            background:liked?'rgba(239,68,68,0.08)':L.raised,
            border:`1px solid ${liked?L.red+'40':L.border}`,
            borderRadius:99,padding:'7px 14px',
            color:liked?L.red:L.textMuted,fontSize:12,fontWeight:700,
            transform:pressed==='like'?'scale(0.95)':'scale(1)',transition:spring,
          }}>
          {liked?'❤️':'🤍'} {post.likes+(liked?1:0)}
        </button>
        <button onClick={()=>setShowComments(true)} style={{
          display:'flex',alignItems:'center',gap:5,cursor:'pointer',
          background:L.raised,border:`1px solid ${L.border}`,
          borderRadius:99,padding:'7px 14px',
          color:L.textMuted,fontSize:12,fontWeight:700,
        }}>
          💬 {post.comments_count}
        </button>
        <button style={{
          marginLeft:'auto',display:'flex',alignItems:'center',gap:5,cursor:'pointer',
          background:L.raised,border:`1px solid ${L.border}`,
          borderRadius:99,padding:'7px 14px',
          color:L.textMuted,fontSize:12,fontWeight:700,
        }}>
          🔗 Share
        </button>
      </div>
    </div>
  )
  </>
  )
}

function NewPostModal({ onClose, onPost }:{ onClose:()=>void, onPost:(p:any)=>void }) {
  const [postType, setPostType] = useState('case')
  const [content, setContent]   = useState('')
  const [specialty, setSpecialty] = useState('Cardiology')
  const [anonymous, setAnonymous] = useState(false)
  const [posting, setPosting]   = useState(false)
  const [loadingAI, setLoadingAI] = useState(false)

  const getAI = async () => {
    setLoadingAI(true)
    try {
      const pt = POST_TYPES.find(t=>t.id===postType)
      const res = await fetch('/api/medical-ai',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question:`Write a compelling ${pt?.label} post for ${specialty} physicians. Evidence-based, engaging, ends with a question. Under 150 words.`,specialty})
      })
      const data = await res.json()
      setContent(data.answer||'')
    } catch {}
    setLoadingAI(false)
  }

  const submit = async () => {
    if(!content.trim()) return
    setPosting(true)
    const post = {
      doctor_name:anonymous?'Anonymous':'Dr. Ahmed',
      doctor_specialty:specialty,doctor_country:'KSA',
      content:content.trim(),post_type:postType,
      specialty_tag:specialty,likes:0,comments_count:0,
      is_anonymous:anonymous,created_at:new Date().toISOString(),
    }
    try {
      const {data,error} = await supabase.from('clinical_posts').insert([post]).select()
      if(!error&&data?.[0]) onPost(data[0])
      else onPost({...post,id:`local_${Date.now()}`})
    } catch { onPost({...post,id:`local_${Date.now()}`}) }
    setPosting(false); onClose()
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(15,23,42,0.6)',backdropFilter:'blur(16px)',overflowY:'auto'}}>
      <div style={{padding:'20px 16px 80px',maxWidth:480,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.teal,marginBottom:2}}>MEDSPHERE</div>
            <div style={{fontSize:22,fontWeight:800,color:L.textPrimary,letterSpacing:-0.4}}>New Post</div>
          </div>
          <button onClick={onClose} style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:12,padding:'8px 16px',color:L.textSub,fontSize:13,fontWeight:700,cursor:'pointer'}}>✕</button>
        </div>

        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>POST TYPE</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {POST_TYPES.map(pt=>(
            <button key={pt.id} onClick={()=>setPostType(pt.id)} style={{
              background:postType===pt.id?`${pt.color}12`:L.raised,
              border:`1.5px solid ${postType===pt.id?pt.color:L.border}`,
              borderRadius:99,padding:'7px 14px',cursor:'pointer',
              color:postType===pt.id?pt.color:L.textSub,
              fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:5,transition:smooth,
            }}><span>{pt.icon}</span>{pt.label}</button>
          ))}
        </div>

        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>SPECIALTY</div>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:16}}>
          {SPECIALTIES.filter(s=>s!=='All').map(s=>(
            <button key={s} onClick={()=>setSpecialty(s)} style={{
              flexShrink:0,background:specialty===s?'rgba(13,148,136,0.10)':L.raised,
              border:`1px solid ${specialty===s?L.teal:L.border}`,
              borderRadius:99,padding:'6px 14px',cursor:'pointer',
              color:specialty===s?L.teal:L.textSub,
              fontSize:11,fontWeight:700,whiteSpace:'nowrap',transition:smooth,
            }}>{s}</button>
          ))}
        </div>

        <button onClick={getAI} disabled={loadingAI} style={{
          width:'100%',padding:12,borderRadius:14,marginBottom:12,cursor:'pointer',
          border:'1px solid rgba(124,58,237,0.25)',background:'rgba(124,58,237,0.08)',
          color:L.violet,fontSize:13,fontWeight:700,
          display:'flex',alignItems:'center',justifyContent:'center',gap:8,
        }}>
          {loadingAI?'⏳ Generating...':'🤖 AI Generate Template'}
        </button>

        <textarea value={content} onChange={e=>setContent(e.target.value)}
          placeholder="Share a case, start a debate, drop a pearl..." rows={5}
          style={{width:'100%',padding:16,borderRadius:16,boxSizing:'border-box',border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:14,outline:'none',resize:'none',lineHeight:1.7,fontFamily:'inherit'}}/>
        <div style={{fontSize:11,color:L.textMuted,textAlign:'right',marginTop:4,marginBottom:16}}>{content.length}/500</div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:L.raised,borderRadius:16,padding:'14px 16px',marginBottom:16,border:`1px solid ${L.border}`}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:L.textPrimary}}>🥷 Post Anonymously</div>
            <div style={{fontSize:11,color:L.textMuted,marginTop:2}}>Your name will be hidden</div>
          </div>
          <div onClick={()=>setAnonymous(!anonymous)} style={{width:44,height:26,borderRadius:13,cursor:'pointer',background:anonymous?L.gradient:L.border,position:'relative',transition:smooth}}>
            <div style={{position:'absolute',top:4,width:18,height:18,borderRadius:'50%',background:'white',transition:smooth,left:anonymous?22:4,boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
          </div>
        </div>

        <button onClick={submit} disabled={posting||!content.trim()} style={{
          width:'100%',padding:16,borderRadius:18,border:'none',cursor:'pointer',
          background:posting||!content.trim()?L.raised:L.gradient,
          color:posting||!content.trim()?L.textMuted:'white',
          fontSize:15,fontWeight:800,transition:smooth,
          boxShadow:posting||!content.trim()?'none':L.shadowGlow,
        }}>
          {posting?'⏳ Posting...':'🌐 Share with MedSphere'}
        </button>
      </div>
    </div>
  )
}

export default function ClinicalNet({ onXP }:{ onXP?:(n:number)=>void }) {
  const [posts, setPosts]           = useState<any[]>(DEMO_POSTS)
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('All')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showNew, setShowNew]       = useState(false)
  const [liveCount, setLiveCount]   = useState(247)
  const [pressed, setPressed]       = useState<string|null>(null)
  const [pulse, setPulse]           = useState(true)

  useEffect(()=>{
    loadPosts()
    const t1 = setInterval(()=>setLiveCount(n=>Math.max(200,Math.min(400,n+Math.floor(Math.random()*5)-2))),4000)
    const t2 = setInterval(()=>setPulse(p=>!p),800)
    return ()=>{ clearInterval(t1); clearInterval(t2) }
  },[])

  const loadPosts = async () => {
    try {
      const {data} = await supabase.from('clinical_posts').select('*').order('created_at',{ascending:false}).limit(30)
      if(data&&data.length>0) setPosts(data)
    } catch {}
    setLoading(false)
  }

  const handleLike = async (id:string) => {
    setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:p.likes+1}:p))
  }

  const filtered = posts.filter(p=>{
    const spec = filter==='All'||p.specialty_tag===filter||p.doctor_specialty===filter
    const type = typeFilter==='all'||p.post_type===typeFilter
    return spec&&type
  })

  if(showNew) return <NewPostModal onClose={()=>setShowNew(false)} onPost={(p)=>{setPosts(prev=>[p,...prev]);setShowNew(false);onXP?.(15)}}/>

  return (
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif'}}>

      {/* Hero */}
      <div style={{position:'relative',height:160,borderRadius:'0 0 24px 24px',overflow:'hidden',marginBottom:16}}>
        <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.88))'}}/>
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>GLOBAL MEDICAL NETWORK</div>
              <div style={{fontSize:26,fontWeight:900,color:'white',letterSpacing:-0.6}}>MedSphere</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(16,185,129,0.15)',backdropFilter:'blur(12px)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:99,padding:'6px 12px'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:pulse?L.sage:'rgba(16,185,129,0.2)',boxShadow:pulse?`0 0 8px ${L.sage}`:'none',transition:smooth}}/>
              <span style={{fontSize:10,fontWeight:800,color:L.sage}}>{liveCount} ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Post Button */}
      <button onClick={()=>setShowNew(true)}
        onMouseDown={()=>setPressed('new')} onMouseUp={()=>setPressed(null)}
        style={{
          width:'100%',padding:14,borderRadius:18,border:'none',marginBottom:14,
          background:L.gradient,color:'white',fontSize:14,fontWeight:800,cursor:'pointer',
          boxShadow:L.shadowGlow,
          transform:pressed==='new'?'scale(0.98)':'scale(1)',transition:spring,
          display:'flex',alignItems:'center',justifyContent:'center',gap:10,
        }}>
        ✍️ Share with MedSphere
      </button>

      {/* Type Filter */}
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:10}}>
        {[{id:'all',label:'📡 All',color:L.teal},...POST_TYPES.map(pt=>({id:pt.id,label:`${pt.icon} ${pt.label}`,color:pt.color}))].map(f=>(
          <button key={f.id} onClick={()=>setTypeFilter(f.id)} style={{
            flexShrink:0,cursor:'pointer',whiteSpace:'nowrap',
            background:typeFilter===f.id?`${f.color}10`:L.raised,
            border:`1px solid ${typeFilter===f.id?f.color:L.border}`,
            borderRadius:99,padding:'6px 12px',
            color:typeFilter===f.id?f.color:L.textMuted,
            fontSize:11,fontWeight:700,transition:smooth,
          }}>{f.label}</button>
        ))}
      </div>

      {/* Specialty Filter */}
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:14}}>
        {SPECIALTIES.map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{
            flexShrink:0,cursor:'pointer',whiteSpace:'nowrap',
            background:filter===s?'rgba(30,64,175,0.08)':L.raised,
            border:`1px solid ${filter===s?L.cobalt:L.border}`,
            borderRadius:99,padding:'5px 12px',
            color:filter===s?L.cobalt:L.textMuted,
            fontSize:10,fontWeight:700,transition:smooth,
          }}>{s}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[
          {l:'Posts Today',v:'84',  c:L.teal},
          {l:'Discussions',v:'247', c:L.cobalt},
          {l:'Countries',  v:'28',  c:L.sage},
          {l:'Specialties',v:'12',  c:L.violet},
        ].map(s=>(
          <div key={s.l} style={{flex:1,background:L.surface,border:`1px solid ${L.border}`,borderRadius:16,padding:'12px 6px',textAlign:'center',boxShadow:L.shadowSm}}>
            <div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:9,fontWeight:700,color:L.textMuted,marginTop:2,letterSpacing:0.5}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{textAlign:'center',padding:40}}>
          <div style={{fontSize:32,marginBottom:12}}>🌐</div>
          <div style={{fontSize:14,fontWeight:500,color:L.textMuted}}>Loading MedSphere...</div>
        </div>
      ) : filtered.length===0 ? (
        <div style={{textAlign:'center',padding:40,background:L.surface,borderRadius:20,border:`1px solid ${L.border}`}}>
          <div style={{fontSize:32,marginBottom:8}}>🌐</div>
          <div style={{fontSize:15,fontWeight:700,color:L.textPrimary,marginBottom:4}}>No posts yet</div>
          <div style={{fontSize:13,color:L.textMuted}}>Be the first to share</div>
        </div>
      ) : filtered.map(post=>(
        <PostCard key={post.id} post={post} onLike={handleLike}/>
      ))}
    </div>
  )
}
