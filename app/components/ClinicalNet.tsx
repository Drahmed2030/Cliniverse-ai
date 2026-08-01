'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

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

const SPECIALTIES = [
  'All','Cardiology','Emergency','Internal Medicine','Neurology',
  'Respiratory','Surgery','Pediatrics','Critical Care','Radiology',
]

const POST_TYPES = [
  { id:'case',     label:'Clinical Case',    icon:'🏥', color:T.red    },
  { id:'question', label:'Ask Colleagues',   icon:'❓', color:T.blue   },
  { id:'debate',   label:'Clinical Debate',  icon:'⚔️', color:T.orange },
  { id:'pearl',    label:'Clinical Pearl',   icon:'💎', color:T.teal   },
  { id:'news',     label:'Medical News',     icon:'📰', color:T.purple },
]

const COUNTRIES: Record<string,string> = {
  'KSA':'🇸🇦', 'UAE':'🇦🇪', 'UK':'🇬🇧', 'USA':'🇺🇸',
  'Egypt':'🇪🇬', 'Jordan':'🇯🇴', 'Kuwait':'🇰🇼', 'Qatar':'🇶🇦',
  'Other':'🌍',
}

// ── DEMO DATA (shows while Supabase loads) ──
const DEMO_POSTS = [
  {
    id:'d1', doctor_name:'Dr. Ahmed Al-Rashidi', doctor_specialty:'Cardiology',
    doctor_country:'KSA', content:'🫀 Interesting case: 58M with anterior STEMI, door-to-balloon 52 min. Post-PCI EF 35%. Started on GDMT. Question for colleagues — when do you initiate SGLT2i post-MI? Recent ACC guidelines suggest early initiation. Thoughts?',
    post_type:'case', specialty_tag:'Cardiology', likes:24, comments_count:8,
    is_anonymous:false, created_at: new Date(Date.now()-3600000).toISOString(),
  },
  {
    id:'d2', doctor_name:'Dr. Sarah Mitchell', doctor_specialty:'Emergency Medicine',
    doctor_country:'UK', content:'⚔️ DEBATE: In a rural setting with 3hr transfer time — Primary PCI vs Thrombolysis for STEMI? The ESC 2023 guidelines still favor PCI if achievable <120 min total ischemic time. But what\'s your real-world experience?',
    post_type:'debate', specialty_tag:'Emergency', likes:41, comments_count:15,
    is_anonymous:false, created_at: new Date(Date.now()-7200000).toISOString(),
  },
  {
    id:'d3', doctor_name:'Anonymous Physician', doctor_specialty:'Internal Medicine',
    doctor_country:'UAE', content:'💎 Pearl of the day: In septic shock, noradrenaline is first-line. But remember — if refractory (>0.25 mcg/kg/min), add vasopressin 0.03 units/min BEFORE escalating noradrenaline further. Reduces noradrenaline requirements by 30%.',
    post_type:'pearl', specialty_tag:'Critical Care', likes:67, comments_count:12,
    is_anonymous:true, created_at: new Date(Date.now()-10800000).toISOString(),
  },
  {
    id:'d4', doctor_name:'Dr. Omar Hassan', doctor_specialty:'Neurology',
    doctor_country:'Egypt', content:'📰 Just published in NEJM: Tenecteplase outperforms Alteplase in ischemic stroke (TRACE-2 trial). Single IV bolus vs 60-min infusion. Game changer for stroke units? Who\'s already using it?',
    post_type:'news', specialty_tag:'Neurology', likes:89, comments_count:23,
    is_anonymous:false, created_at: new Date(Date.now()-86400000).toISOString(),
  },
]

// ── TIME AGO ──
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff/60000)
  if(mins<1) return 'just now'
  if(mins<60) return `${mins}m ago`
  const hrs = Math.floor(mins/60)
  if(hrs<24) return `${hrs}h ago`
  return `${Math.floor(hrs/24)}d ago`
}

// ── POST CARD ──
function PostCard({ post, onComment, onLike }: { post:any, onComment:(p:any)=>void, onLike:(id:string)=>void }) {
  const pt = POST_TYPES.find(t=>t.id===post.post_type)||POST_TYPES[0]
  const flag = COUNTRIES[post.doctor_country]||'🌍'
  const [liked, setLiked] = useState(false)

  return (
    <div style={{
      background:T.glass, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      border:`1px solid ${pt.color}22`, borderRadius:22, padding:'18px',
      marginBottom:12, position:'relative', overflow:'hidden',
    }}>
      {/* Ambient */}
      <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${pt.color}12,transparent 70%)`,pointerEvents:'none'}}/>

      {/* Post type badge */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>

  {/* Cliniverse Logo Watermark */}
  <div style={{position:'absolute',top:0,right:0,width:180,height:180,pointerEvents:'none',zIndex:0,opacity:0.06,overflow:'hidden'}}>
    <svg width="180" height="180" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
      style={{animation:'logoFloat 4s ease-in-out infinite',position:'absolute',top:-20,right:-20}}>
      <defs>
        <linearGradient id="arcNT" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5D4"/><stop offset="100%" stopColor="#0096FF"/>
        </linearGradient>
        <filter id="glNT" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#arcNT)" strokeWidth="7" strokeLinecap="round" filter="url(#glNT)"/>
      <circle cx="84" cy="38" r="4" fill="#00E5D4"><animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="84" cy="82" r="4" fill="#0096FF"><animate attributeName="r" values="3;6;3" dur="2s" begin="0.5s" repeatCount="indefinite"/></circle>
      <polyline points="26,60 34,60 38,60 42,47 46,73 50,54 54,66 58,60 78,60"
        fill="none" stroke="#00C8B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        filter="url(#glNT)" strokeDasharray="120" strokeDashoffset="120">
        <animate attributeName="strokeDashoffset" values="120;0;120" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite"/>
      </polyline>
    </svg>
  </div>


        <div style={{display:'flex',alignItems:'center',gap:6,background:`${pt.color}15`,border:`1px solid ${pt.color}28`,borderRadius:20,padding:'4px 10px'}}>
          <span style={{fontSize:12}}>{pt.icon}</span>
          <span style={{fontSize:9,color:pt.color,fontWeight:800,letterSpacing:0.5}}>{pt.label.toUpperCase()}</span>
        </div>
        <span style={{fontSize:10,color:T.muted}}>{timeAgo(post.created_at)}</span>
      </div>

      {/* Author */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <div style={{
          width:40,height:40,borderRadius:13,flexShrink:0,
          background:`${pt.color}18`,border:`1.5px solid ${pt.color}30`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:18,
        }}>
          {post.is_anonymous?'🥷':'👨‍⚕️'}
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:T.text}}>
            {post.doctor_name} {!post.is_anonymous&&<span style={{fontSize:14}}>{flag}</span>}
          </div>
          <div style={{fontSize:10,color:pt.color,fontWeight:600}}>{post.doctor_specialty}</div>
        </div>
        {post.doctor_verified && (
          <div style={{marginLeft:'auto',background:`${T.blue}15`,border:`1px solid ${T.blue}28`,borderRadius:20,padding:'3px 8px',fontSize:9,color:T.blue,fontWeight:700}}>✓ Verified</div>
        )}
      </div>

      {/* Content */}
      <div style={{fontSize:13,color:T.sub,lineHeight:1.75,marginBottom:14}}>{post.content}</div>

      {/* Specialty tag */}
      {post.specialty_tag && (
        <div style={{marginBottom:12}}>
          <span style={{fontSize:10,color:T.teal,background:`${T.teal}12`,border:`1px solid ${T.teal}20`,borderRadius:8,padding:'3px 10px',fontWeight:600}}>#{post.specialty_tag}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{display:'flex',gap:12,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
        <button onClick={()=>{setLiked(!liked);onLike(post.id)}} style={{
          display:'flex',alignItems:'center',gap:5,
          background:liked?`${T.red}15`:'transparent',
          border:liked?`1px solid ${T.red}28`:'1px solid transparent',
          borderRadius:20,padding:'6px 12px',cursor:'pointer',fontFamily:F,
          color:liked?T.red:T.muted,fontSize:12,fontWeight:600,transition:'all 0.2s',
        }}>
          {liked?'❤️':'🤍'} {post.likes+(liked?1:0)}
        </button>
        <button onClick={()=>onComment(post)} style={{
          display:'flex',alignItems:'center',gap:5,
          background:'transparent',border:'1px solid transparent',
          borderRadius:20,padding:'6px 12px',cursor:'pointer',fontFamily:F,
          color:T.muted,fontSize:12,fontWeight:600,
        }}>
          💬 {post.comments_count}
        </button>
        <button style={{
          display:'flex',alignItems:'center',gap:5,marginLeft:'auto',
          background:'transparent',border:'1px solid transparent',
          borderRadius:20,padding:'6px 12px',cursor:'pointer',fontFamily:F,
          color:T.muted,fontSize:12,fontWeight:600,
        }}>
          🔗 Share
        </button>
      </div>
    </div>
  )
}

// ── NEW POST MODAL ──
function NewPostModal({ onClose, onPost, doctorName, doctorSpecialty }: {
  onClose:()=>void, onPost:(p:any)=>void,
  doctorName:string, doctorSpecialty:string
}) {
  const [postType, setPostType] = useState('case')
  const [content, setContent]   = useState('')
  const [specialty, setSpecialty] = useState(doctorSpecialty||'Cardiology')
  const [anonymous, setAnonymous] = useState(false)
  const [posting, setPosting]   = useState(false)
  const [aiHelp, setAiHelp]     = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  const getAITemplate = async () => {
    setLoadingAI(true)
    try {
      const pt = POST_TYPES.find(t=>t.id===postType)
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6', max_tokens:300,
          messages:[{role:'user',content:`Generate a professional ${pt?.label} template for a medical social network post by a ${specialty} physician. Make it engaging, evidence-based, and designed to spark discussion. Include relevant clinical details and end with a question to colleagues. Keep it under 200 words. No hashtags, just the post content.`}]
        })
      })
      const data = await res.json()
      setContent(data.content?.[0]?.text||'')
    } catch {}
    setLoadingAI(false)
  }

  const submit = async () => {
    if(!content.trim()) return
    setPosting(true)
    try {
      const newPost = {
        doctor_name: anonymous ? 'Anonymous Physician' : doctorName||'Dr. Unknown',
        doctor_specialty: specialty,
        doctor_country: 'KSA',
        content: content.trim(),
        post_type: postType,
        specialty_tag: specialty,
        likes: 0,
        comments_count: 0,
        is_anonymous: anonymous,
        created_at: new Date().toISOString(),
      }
      const { data, error } = await supabase.from('clinical_posts').insert([newPost]).select()
      if(!error && data?.[0]) onPost(data[0])
      else onPost({ ...newPost, id: `local_${Date.now()}` })
    } catch {
      onPost({ id:`local_${Date.now()}`, doctor_name:anonymous?'Anonymous Physician':doctorName, doctor_specialty:specialty, doctor_country:'KSA', content:content.trim(), post_type:postType, specialty_tag:specialty, likes:0, comments_count:0, is_anonymous:anonymous, created_at:new Date().toISOString() })
    }
    setPosting(false)
    onClose()
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(10,22,40,0.88)',backdropFilter:'blur(12px)',overflowY:'auto'}}>
      <div style={{padding:'20px 16px 60px',maxWidth:480,margin:'0 auto',fontFamily:F}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div>
            <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5}}>CLINICALNET</div>
            <div style={{fontSize:18,fontWeight:900,color:T.text}}>New Post</div>
          </div>
          <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'8px 14px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>✕</button>
        </div>

        {/* Post type */}
        <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>POST TYPE</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {POST_TYPES.map(pt=>(
            <button key={pt.id} onClick={()=>setPostType(pt.id)} style={{
              background:postType===pt.id?`${pt.color}18`:T.glass2,
              border:`1.5px solid ${postType===pt.id?pt.color:'rgba(255,255,255,0.08)'}`,
              borderRadius:20,padding:'6px 12px',cursor:'pointer',fontFamily:F,
              color:postType===pt.id?pt.color:T.muted,fontSize:11,fontWeight:700,
              display:'flex',alignItems:'center',gap:5,transition:'all 0.2s',
            }}>
              <span>{pt.icon}</span>{pt.label}
            </button>
          ))}
        </div>

        {/* Specialty */}
        <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>SPECIALTY TAG</div>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:16}}>
          {SPECIALTIES.filter(s=>s!=='All').map(s=>(
            <button key={s} onClick={()=>setSpecialty(s)} style={{
              flexShrink:0,
              background:specialty===s?`${T.teal}18`:T.glass2,
              border:`1px solid ${specialty===s?T.teal:'rgba(255,255,255,0.08)'}`,
              borderRadius:20,padding:'5px 12px',cursor:'pointer',fontFamily:F,
              color:specialty===s?T.teal:T.muted,fontSize:10,fontWeight:700,
              transition:'all 0.2s',whiteSpace:'nowrap',
            }}>{s}</button>
          ))}
        </div>

        {/* AI Template */}
        <button onClick={getAITemplate} disabled={loadingAI} style={{
          width:'100%',padding:'11px',borderRadius:14,marginBottom:12,
          border:`1px solid ${T.purple}30`,background:`${T.purple}12`,
          color:T.purple,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,
          display:'flex',alignItems:'center',justifyContent:'center',gap:8,
        }}>
          {loadingAI
            ? <><div style={{width:14,height:14,borderRadius:'50%',border:`2px solid rgba(175,82,222,0.3)`,borderTop:`2px solid ${T.purple}`,animation:'spin 0.8s linear infinite'}}/>Generating template...</>
            : '🤖 AI Generate Template'}
        </button>

        {/* Content */}
        <textarea
          value={content}
          onChange={e=>setContent(e.target.value)}
          placeholder="Share a clinical case, ask a question, or start a debate..."
          rows={6}
          style={{
            width:'100%',padding:'14px',borderRadius:16,
            border:`1px solid ${T.border}`,background:T.glass,
            backdropFilter:'blur(20px)',color:T.text,fontSize:13,
            outline:'none',resize:'none',fontFamily:F,lineHeight:1.7,
            boxSizing:'border-box',
          }}
        />
        <div style={{fontSize:10,color:T.muted,textAlign:'right',marginTop:4,marginBottom:16}}>
          {content.length}/500
        </div>

        {/* Anonymous toggle */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:T.glass2,borderRadius:14,padding:'12px 14px',marginBottom:16,border:`1px solid ${T.border}`}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.text}}>🥷 Post Anonymously</div>
            <div style={{fontSize:10,color:T.muted,marginTop:2}}>Your name will be hidden</div>
          </div>
          <div onClick={()=>setAnonymous(!anonymous)} style={{
            width:44,height:26,borderRadius:13,
            background:anonymous?T.teal:'rgba(255,255,255,0.12)',
            border:`1px solid ${anonymous?T.teal:T.border}`,
            cursor:'pointer',position:'relative',transition:'all 0.2s',
          }}>
            <div style={{position:'absolute',top:3,left:anonymous?20:3,width:18,height:18,borderRadius:'50%',background:'white',transition:'all 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
          </div>
        </div>

        {/* Submit */}
        <button onClick={submit} disabled={posting||!content.trim()} style={{
          width:'100%',padding:'16px',borderRadius:18,border:'none',
          background:posting||!content.trim()?'rgba(0,196,180,0.2)':`linear-gradient(135deg,${T.teal},${T.blue})`,
          color:'var(--text-primary, #fff)',fontSize:15,fontWeight:800,
          cursor:posting||!content.trim()?'not-allowed':'pointer',fontFamily:F,
          boxShadow:posting||!content.trim()?'none':`0 8px 32px ${T.teal}35`,
          display:'flex',alignItems:'center',justifyContent:'center',gap:10,
        }}>
          {posting
            ? <><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>Posting...</>
            : '🌐 Share with Colleagues'}
        </button>
      </div>
      <style>{`@keyframes logoFloat { 0%,100%{opacity:0.06;transform:translateY(0)} 50%{opacity:0.10;transform:translateY(-6px)} }
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}textarea::placeholder,input::placeholder{color:rgba(238,246,250,0.22)}`}</style>
    </div>
  )
}

// ── COMMENTS MODAL ──
function CommentsModal({ post, onClose }: { post:any, onClose:()=>void }) {
  const [comments, setComments] = useState<any[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [posting, setPosting]   = useState(false)

  useEffect(()=>{
    const fetch = async () => {
      const { data } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending:true })
        .limit(50)
      setComments(data||[
        { id:'d1', doctor_name:'Dr. Khalid Hassan', doctor_specialty:'Cardiology', content:'Great case! We typically initiate SGLT2i at 4-6 weeks post-MI once patient is stable, per the DAPA-MI trial protocol.', created_at:new Date(Date.now()-1800000).toISOString(), likes:5 },
        { id:'d2', doctor_name:'Dr. Nora Al-Qasim', doctor_specialty:'Internal Medicine', content:'Agree with Dr. Khalid. Also worth checking renal function first — eGFR >20 is the threshold now per updated guidelines.', created_at:new Date(Date.now()-900000).toISOString(), likes:3 },
      ])
      setLoading(false)
    }
    fetch()
  },[post.id])

  const addComment = async () => {
    if(!input.trim()) return
    setPosting(true)
    const newComment = {
      post_id: post.id,
      doctor_name: 'Dr. Ahmed',
      doctor_specialty: 'Cardiology',
      content: input.trim(),
      likes: 0,
      created_at: new Date().toISOString(),
    }
    try {
      await supabase.from('post_comments').insert([newComment])
    } catch {}
    setComments(prev=>[...prev,{...newComment,id:`local_${Date.now()}`}])
    setInput('')
    setPosting(false)
  }

  const pt = POST_TYPES.find(t=>t.id===post.post_type)||POST_TYPES[0]

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(10,22,40,0.90)',backdropFilter:'blur(12px)',display:'flex',flexDirection:'column',fontFamily:F}}>
      {/* Header */}
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'8px 14px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>←</button>
        <div>
          <div style={{fontSize:15,fontWeight:900,color:T.text}}>💬 Discussion</div>
          <div style={{fontSize:10,color:pt.color,fontWeight:600}}>{pt.icon} {pt.label}</div>
        </div>
      </div>

      {/* Original post */}
      <div style={{padding:'14px 16px',borderBottom:`1px solid ${T.border}`,background:`${pt.color}06`,flexShrink:0}}>
        <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:4}}>{post.doctor_name}</div>
        <div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>{post.content.substring(0,150)}{post.content.length>150?'...':''}</div>
      </div>

      {/* Comments */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'30px',color:T.muted}}>Loading discussion...</div>
        ) : comments.length===0 ? (
          <div style={{textAlign:'center',padding:'30px'}}>
            <div style={{fontSize:24,marginBottom:8}}>💬</div>
            <div style={{fontSize:13,color:T.muted}}>Be the first to comment</div>
          </div>
        ) : comments.map((c,i)=>(
          <div key={c.id||i} style={{display:'flex',gap:10,marginBottom:14}}>
            <div style={{width:36,height:36,borderRadius:11,background:`${T.blue}18`,border:`1px solid ${T.blue}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>👨‍⚕️</div>
            <div style={{flex:1,background:T.glass,backdropFilter:'blur(20px)',borderRadius:16,borderBottomLeftRadius:4,padding:'10px 14px',border:`1px solid ${T.border}`}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:T.text}}>{c.doctor_name}</span>
                <span style={{fontSize:10,color:T.teal}}>{c.doctor_specialty}</span>
                <span style={{fontSize:9,color:T.muted,marginLeft:'auto'}}>{timeAgo(c.created_at)}</span>
              </div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.65}}>{c.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{padding:'12px 16px',borderTop:`1px solid ${T.border}`,display:'flex',gap:10,flexShrink:0,background:'rgba(15,35,50,0.95)',backdropFilter:'blur(20px)'}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&addComment()}
          placeholder="Add to the discussion..."
          style={{flex:1,padding:'12px 16px',borderRadius:16,border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',color:T.text,fontSize:13,outline:'none',fontFamily:F}}
        />
        <button onClick={addComment} disabled={posting||!input.trim()} style={{
          padding:'12px 18px',borderRadius:16,border:'none',
          background:!input.trim()?'rgba(0,196,180,0.2)':`linear-gradient(135deg,${T.teal},${T.blue})`,
          color:'var(--text-primary, #fff)',fontSize:13,fontWeight:700,cursor:!input.trim()?'not-allowed':'pointer',fontFamily:F,
        }}>→</button>
      </div>
      <style>{`input::placeholder{color:rgba(238,246,250,0.22)}`}</style>
    </div>
  )
}

// ── MAIN COMPONENT ──
export default function ClinicalNet({ onXP }: { onXP?: (n:number)=>void }) {
  const [posts, setPosts]             = useState<any[]>(DEMO_POSTS)
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('All')
  const [typeFilter, setTypeFilter]   = useState('all')
  const [showNewPost, setShowNewPost] = useState(false)
  const [commentPost, setCommentPost] = useState<any>(null)
  const [liveCount, setLiveCount]     = useState(247)

  useEffect(()=>{
    loadPosts()
    const t = setInterval(()=>setLiveCount(n=>Math.max(200,Math.min(400,n+Math.floor(Math.random()*5)-2))),5000)
    return ()=>clearInterval(t)
  },[])

  const loadPosts = async () => {
    try {
      const { data } = await supabase
        .from('clinical_posts')
        .select('*')
        .order('created_at',{ascending:false})
        .limit(30)
      if(data&&data.length>0) setPosts(data)
    } catch {}
    setLoading(false)
  }

  const handleLike = async (id:string) => {
    setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:p.likes+1}:p))
    try {
      const post = posts.find(p=>p.id===id)
      if(post&&!post.id.startsWith('local_')&&!post.id.startsWith('d')) {
        await supabase.from('clinical_posts').update({likes:post.likes+1}).eq('id',id)
      }
    } catch {}
  }

  const handleNewPost = (post:any) => {
    setPosts(prev=>[post,...prev])
    onXP?.(15)
  }

  const filtered = posts.filter(p=>{
    const specMatch = filter==='All' || p.specialty_tag===filter || p.doctor_specialty===filter
    const typeMatch = typeFilter==='all' || p.post_type===typeFilter
    return specMatch && typeMatch
  })

  if(commentPost) return <CommentsModal post={commentPost} onClose={()=>setCommentPost(null)}/>
  if(showNewPost) return <NewPostModal onClose={()=>setShowNewPost(false)} onPost={handleNewPost} doctorName="Dr. Ahmed" doctorSpecialty="Cardiology"/>

  return (
    <div style={{fontFamily:F}}>

      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>GLOBAL MEDICAL NETWORK</div>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:T.text,letterSpacing:-0.5}}>
              Clinical<span style={{color:T.teal}}>Net</span>
            </div>
            <div style={{fontSize:12,color:T.sub,marginTop:3}}>
              Connect · Share · Learn with global physicians
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(52,199,89,0.12)',border:'1px solid rgba(52,199,89,0.25)',borderRadius:20,padding:'5px 10px',flexShrink:0}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:T.green,animation:'pulse 1.5s ease-in-out infinite'}}/>
            <span style={{fontSize:9,fontWeight:800,color:T.green}}>{liveCount} ONLINE</span>
          </div>
        </div>
      </div>

      {/* New post button */}
      <button onClick={()=>setShowNewPost(true)} style={{
        width:'100%',padding:'14px',borderRadius:18,border:'none',marginBottom:16,
        background:`linear-gradient(135deg,${T.teal},${T.blue})`,
        color:'var(--text-primary, #fff)',fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:F,
        boxShadow:`0 6px 24px ${T.teal}35`,
        display:'flex',alignItems:'center',justifyContent:'center',gap:10,
      }}>
        ✍️ Share with Colleagues
      </button>

      {/* Post type filter */}
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:10}}>
        <button onClick={()=>setTypeFilter('all')} style={{flexShrink:0,background:typeFilter==='all'?T.glass:T.glass2,border:`1px solid ${typeFilter==='all'?T.teal:T.border}`,borderRadius:20,padding:'5px 12px',cursor:'pointer',fontFamily:F,color:typeFilter==='all'?T.teal:T.muted,fontSize:10,fontWeight:700}}>
          🌐 All
        </button>
        {POST_TYPES.map(pt=>(
          <button key={pt.id} onClick={()=>setTypeFilter(pt.id)} style={{
            flexShrink:0,
            background:typeFilter===pt.id?`${pt.color}18`:T.glass2,
            border:`1px solid ${typeFilter===pt.id?pt.color:T.border}`,
            borderRadius:20,padding:'5px 12px',cursor:'pointer',fontFamily:F,
            color:typeFilter===pt.id?pt.color:T.muted,fontSize:10,fontWeight:700,whiteSpace:'nowrap',
          }}>{pt.icon} {pt.label}</button>
        ))}
      </div>

      {/* Specialty filter */}
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

      {/* Stats strip */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[
          {l:'Posts Today', v:'84',   c:T.teal},
          {l:'Discussions',v:'247',  c:T.blue},
          {l:'Countries',  v:'28',   c:T.green},
          {l:'Specialties',v:'12',   c:T.purple},
        ].map(s=>(
          <div key={s.l} style={{flex:1,background:T.glass,backdropFilter:'blur(20px)',borderRadius:12,padding:'8px 4px',textAlign:'center',border:`1px solid ${s.c}18`}}>
            <div style={{fontSize:14,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:7,color:T.muted,marginTop:2,fontWeight:600}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{textAlign:'center',padding:'40px'}}>
          <div style={{width:40,height:40,borderRadius:'50%',border:`3px solid rgba(255,255,255,0.08)`,borderTop:`3px solid ${T.teal}`,animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/>
          <div style={{fontSize:13,color:T.sub}}>Loading ClinicalNet...</div>
        </div>
      ) : filtered.length===0 ? (
        <div style={{textAlign:'center',padding:'40px',background:T.glass,borderRadius:20,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:32,marginBottom:8}}>🌐</div>
          <div style={{fontSize:14,color:T.text,marginBottom:4}}>No posts yet</div>
          <div style={{fontSize:12,color:T.muted}}>Be the first to share in this specialty</div>
        </div>
      ) : filtered.map(post=>(
        <PostCard key={post.id} post={post} onComment={setCommentPost} onLike={handleLike}/>
      ))}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}
