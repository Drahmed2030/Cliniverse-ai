'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731', red:'#EF4444',
  violet:'#7C3AED', orange:'#EA580C', pink:'#DB2777',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowMd:'0 4px 16px rgba(15,23,42,0.12)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const SPECIALTIES = ['All','Cardiology','Emergency','Internal Medicine','Neurology','Respiratory','Surgery','Pediatrics','Critical Care','Radiology']

const POST_TYPES = [
  { id:'case',     label:'Clinical Case',   icon:'🏥', color:L.red    },
  { id:'question', label:'Ask Colleagues',  icon:'❓', color:L.cobalt },
  { id:'debate',   label:'Clinical Debate', icon:'⚔️', color:L.amber  },
  { id:'pearl',    label:'Clinical Pearl',  icon:'💎', color:L.teal   },
  { id:'news',     label:'Medical News',    icon:'📰', color:L.violet },
]

const COUNTRIES: Record<string,string> = {
  'KSA':'🇸🇦','UAE':'🇦🇪','UK':'🇬🇧','USA':'🇺🇸',
  'Egypt':'🇪🇬','Jordan':'🇯🇴','Kuwait':'🇰🇼','Qatar':'🇶🇦','Other':'🌍',
}

const DEMO_POSTS = [
  { id:'d1', doctor_name:'Dr. Ahmed Al-Rashidi', doctor_specialty:'Cardiology', doctor_country:'KSA',
    content:'🫀 Interesting case: 58M with anterior STEMI, door-to-balloon 52 min. Post-PCI EF 35%. Started on GDMT. Question for colleagues — when do you initiate SGLT2i post-MI? Recent ACC guidelines suggest early initiation. Thoughts?',
    post_type:'case', specialty_tag:'Cardiology', likes:24, comments_count:8, is_anonymous:false, created_at:new Date(Date.now()-3600000).toISOString() },
  { id:'d2', doctor_name:'Dr. Sarah Mitchell', doctor_specialty:'Emergency Medicine', doctor_country:'UK',
    content:'⚔️ DEBATE: In a rural setting with 3hr transfer time — Primary PCI vs Thrombolysis for STEMI? ESC 2023 guidelines still favor PCI if achievable <120 min total ischemic time. Real-world experience?',
    post_type:'debate', specialty_tag:'Emergency', likes:41, comments_count:15, is_anonymous:false, created_at:new Date(Date.now()-7200000).toISOString() },
  { id:'d3', doctor_name:'Anonymous Physician', doctor_specialty:'Internal Medicine', doctor_country:'UAE',
    content:'💎 Pearl: In septic shock, noradrenaline is first-line. If refractory (>0.25 mcg/kg/min), add vasopressin 0.03 units/min BEFORE escalating further. Reduces noradrenaline requirements by 30%.',
    post_type:'pearl', specialty_tag:'Critical Care', likes:67, comments_count:12, is_anonymous:true, created_at:new Date(Date.now()-10800000).toISOString() },
  { id:'d4', doctor_name:'Dr. Omar Hassan', doctor_specialty:'Neurology', doctor_country:'Egypt',
    content:'📰 Just published in NEJM: Tenecteplase outperforms Alteplase in ischemic stroke (TRACE-2 trial). Single IV bolus vs 60-min infusion. Game changer for stroke units?',
    post_type:'news', specialty_tag:'Neurology', likes:89, comments_count:23, is_anonymous:false, created_at:new Date(Date.now()-86400000).toISOString() },
]

function timeAgo(dateStr:string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff/60000)
  if(mins<1) return 'just now'
  if(mins<60) return `${mins}m ago`
  const hrs = Math.floor(mins/60)
  if(hrs<24) return `${hrs}h ago`
  return `${Math.floor(hrs/24)}d ago`
}

function PostCard({ post, onComment, onLike }:{ post:any, onComment:(p:any)=>void, onLike:(id:string)=>void }) {
  const pt = POST_TYPES.find(t=>t.id===post.post_type)||POST_TYPES[0]
  const flag = COUNTRIES[post.doctor_country]||'🌍'
  const [liked, setLiked] = useState(false)
  const [pressed, setPressed] = useState<string|null>(null)

  return (
    <div style={{
      background:L.surface, border:`1px solid ${L.border}`,
      borderRadius:20, padding:18, marginBottom:12,
      boxShadow:L.shadowSm,
    }}>
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{
          display:'flex', alignItems:'center', gap:6,
          background:`${pt.color}10`, border:`1px solid ${pt.color}25`,
          borderRadius:99, padding:'4px 12px',
        }}>
          <span style={{ fontSize:12 }}>{pt.icon}</span>
          <span style={{ fontSize:10, color:pt.color, fontWeight:700, letterSpacing:1.2 }}>
            {pt.label.toUpperCase()}
          </span>
        </div>
        <span style={{ fontSize:11, fontWeight:500, color:L.textMuted }}>{timeAgo(post.created_at)}</span>
      </div>

      {/* Author */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div style={{
          width:42, height:42, borderRadius:14, flexShrink:0,
          background:`${pt.color}10`, border:`1.5px solid ${pt.color}25`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
        }}>
          {post.is_anonymous ? '🥷' : '👨‍⚕️'}
        </div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:L.textPrimary }}>
            {post.doctor_name} {!post.is_anonymous && <span>{flag}</span>}
          </div>
          <div style={{ fontSize:11, fontWeight:600, color:pt.color }}>{post.doctor_specialty}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ fontSize:14, fontWeight:500, color:L.textSub, lineHeight:1.7, marginBottom:12 }}>
        {post.content}
      </div>

      {/* Tag */}
      {post.specialty_tag && (
        <div style={{ marginBottom:12 }}>
          <span style={{
            fontSize:11, fontWeight:600, color:L.teal,
            background:'rgba(13,148,136,0.08)', border:'1px solid rgba(13,148,136,0.2)',
            borderRadius:99, padding:'3px 12px',
          }}>#{post.specialty_tag}</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap:8, paddingTop:12, borderTop:`1px solid ${L.border}` }}>
        <button onClick={()=>{setLiked(!liked); onLike(post.id)}}
          onMouseDown={()=>setPressed('like')} onMouseUp={()=>setPressed(null)}
          style={{
            display:'flex', alignItems:'center', gap:5, cursor:'pointer',
            background: liked ? 'rgba(239,68,68,0.08)' : L.raised,
            border:`1px solid ${liked ? L.red+'40' : L.border}`,
            borderRadius:99, padding:'7px 14px',
            color: liked ? L.red : L.textMuted,
            fontSize:12, fontWeight:700,
            transform: pressed==='like' ? 'scale(0.95)' : 'scale(1)',
            transition: spring,
          }}>
          {liked?'❤️':'🤍'} {post.likes+(liked?1:0)}
        </button>
        <button onClick={()=>onComment(post)}
          onMouseDown={()=>setPressed('cmt')} onMouseUp={()=>setPressed(null)}
          style={{
            display:'flex', alignItems:'center', gap:5, cursor:'pointer',
            background:L.raised, border:`1px solid ${L.border}`,
            borderRadius:99, padding:'7px 14px',
            color:L.textMuted, fontSize:12, fontWeight:700,
            transform: pressed==='cmt' ? 'scale(0.95)' : 'scale(1)',
            transition: spring,
          }}>
          💬 {post.comments_count}
        </button>
        <button style={{
          display:'flex', alignItems:'center', gap:5, cursor:'pointer', marginLeft:'auto',
          background:L.raised, border:`1px solid ${L.border}`,
          borderRadius:99, padding:'7px 14px',
          color:L.textMuted, fontSize:12, fontWeight:700,
        }}>
          🔗 Share
        </button>
      </div>
    </div>
  )
}

function NewPostModal({ onClose, onPost }:{ onClose:()=>void, onPost:(p:any)=>void }) {
  const [postType, setPostType]   = useState('case')
  const [content, setContent]     = useState('')
  const [specialty, setSpecialty] = useState('Cardiology')
  const [anonymous, setAnonymous] = useState(false)
  const [posting, setPosting]     = useState(false)
  const [loadingAI, setLoadingAI] = useState(false)

  const getAITemplate = async () => {
    setLoadingAI(true)
    try {
      const pt = POST_TYPES.find(t=>t.id===postType)
      const res = await fetch('/api/medical-ai', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ question:`Generate a professional ${pt?.label} post for a ${specialty} physician. Evidence-based, engaging, ends with a question. Under 200 words.`, specialty })
      })
      const data = await res.json()
      setContent(data.answer || '')
    } catch {}
    setLoadingAI(false)
  }

  const submit = async () => {
    if(!content.trim()) return
    setPosting(true)
    const newPost = {
      doctor_name: anonymous ? 'Anonymous Physician' : 'Dr. Ahmed',
      doctor_specialty: specialty, doctor_country:'KSA',
      content: content.trim(), post_type: postType,
      specialty_tag: specialty, likes:0, comments_count:0,
      is_anonymous: anonymous, created_at: new Date().toISOString(),
    }
    try {
      const { data, error } = await supabase.from('clinical_posts').insert([newPost]).select()
      if(!error && data?.[0]) onPost(data[0])
      else onPost({...newPost, id:`local_${Date.now()}`})
    } catch { onPost({...newPost, id:`local_${Date.now()}`}) }
    setPosting(false)
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(15,23,42,0.6)', backdropFilter:'blur(16px)', overflowY:'auto' }}>
      <div style={{ padding:'20px 16px 80px', maxWidth:480, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.teal, marginBottom:2 }}>CLINICALNET</div>
            <div style={{ fontSize:22, fontWeight:800, color:L.textPrimary, letterSpacing:-0.4 }}>New Post</div>
          </div>
          <button onClick={onClose} style={{
            background:L.surface, border:`1px solid ${L.border}`,
            borderRadius:12, padding:'8px 16px',
            color:L.textSub, fontSize:13, fontWeight:700, cursor:'pointer',
          }}>✕</button>
        </div>

        {/* Post Type */}
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.textMuted, marginBottom:8 }}>POST TYPE</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
          {POST_TYPES.map(pt=>(
            <button key={pt.id} onClick={()=>setPostType(pt.id)} style={{
              background: postType===pt.id ? `${pt.color}12` : L.raised,
              border:`1.5px solid ${postType===pt.id ? pt.color : L.border}`,
              borderRadius:99, padding:'7px 14px', cursor:'pointer',
              color: postType===pt.id ? pt.color : L.textSub,
              fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:5,
              transition: smooth,
            }}>
              <span>{pt.icon}</span>{pt.label}
            </button>
          ))}
        </div>

        {/* Specialty */}
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.textMuted, marginBottom:8 }}>SPECIALTY</div>
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:16 }}>
          {SPECIALTIES.filter(s=>s!=='All').map(s=>(
            <button key={s} onClick={()=>setSpecialty(s)} style={{
              flexShrink:0, background: specialty===s ? 'rgba(13,148,136,0.10)' : L.raised,
              border:`1px solid ${specialty===s ? L.teal : L.border}`,
              borderRadius:99, padding:'6px 14px', cursor:'pointer',
              color: specialty===s ? L.teal : L.textSub,
              fontSize:11, fontWeight:700, whiteSpace:'nowrap', transition:smooth,
            }}>{s}</button>
          ))}
        </div>

        {/* AI Template */}
        <button onClick={getAITemplate} disabled={loadingAI} style={{
          width:'100%', padding:12, borderRadius:14, marginBottom:12, cursor:'pointer',
          border:`1px solid rgba(124,58,237,0.25)`, background:'rgba(124,58,237,0.08)',
          color:L.violet, fontSize:13, fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          {loadingAI ? '⏳ Generating...' : '🤖 AI Generate Template'}
        </button>

        {/* Content */}
        <textarea value={content} onChange={e=>setContent(e.target.value)}
          placeholder="Share a clinical case, ask a question, or start a debate..."
          rows={6} style={{
            width:'100%', padding:16, borderRadius:16, boxSizing:'border-box',
            border:`1px solid ${L.border}`, background:L.surface,
            color:L.textPrimary, fontSize:14, outline:'none',
            resize:'none', lineHeight:1.7,
            fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
          }}/>
        <div style={{ fontSize:11, color:L.textMuted, textAlign:'right', marginTop:4, marginBottom:16 }}>
          {content.length}/500
        </div>

        {/* Anonymous */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:L.raised, borderRadius:16, padding:'14px 16px', marginBottom:16,
          border:`1px solid ${L.border}`,
        }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:L.textPrimary }}>🥷 Post Anonymously</div>
            <div style={{ fontSize:11, color:L.textMuted, marginTop:2 }}>Your name will be hidden</div>
          </div>
          <div onClick={()=>setAnonymous(!anonymous)} style={{
            width:44, height:26, borderRadius:13, cursor:'pointer',
            background: anonymous ? L.gradient : L.border,
            position:'relative', transition:smooth,
          }}>
            <div style={{
              position:'absolute', top:4, width:18, height:18, borderRadius:'50%',
              background:'white', transition:smooth,
              left: anonymous ? 22 : 4, boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
            }}/>
          </div>
        </div>

        {/* Submit */}
        <button onClick={submit} disabled={posting||!content.trim()} style={{
          width:'100%', padding:16, borderRadius:18, border:'none', cursor:'pointer',
          background: posting||!content.trim() ? L.raised : L.gradient,
          color: posting||!content.trim() ? L.textMuted : 'white',
          fontSize:15, fontWeight:800,
          boxShadow: posting||!content.trim() ? 'none' : L.shadowGlow,
          transition: smooth,
        }}>
          {posting ? '⏳ Posting...' : '🌐 Share with Colleagues'}
        </button>
      </div>
    </div>
  )
}

function CommentsModal({ post, onClose }:{ post:any, onClose:()=>void }) {
  const [comments, setComments] = useState<any[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [posting, setPosting]   = useState(false)
  const pt = POST_TYPES.find(t=>t.id===post.post_type)||POST_TYPES[0]

  useEffect(()=>{
    const load = async () => {
      const { data } = await supabase.from('post_comments').select('*').eq('post_id',post.id).order('created_at',{ascending:true}).limit(50)
      setComments(data||[
        { id:'d1', doctor_name:'Dr. Khalid Hassan', doctor_specialty:'Cardiology', content:'Great case! We typically initiate SGLT2i at 4-6 weeks post-MI once stable, per DAPA-MI trial.', created_at:new Date(Date.now()-1800000).toISOString() },
        { id:'d2', doctor_name:'Dr. Nora Al-Qasim', doctor_specialty:'Internal Medicine', content:'Agree. Also check renal function first — eGFR >20 is the threshold per updated guidelines.', created_at:new Date(Date.now()-900000).toISOString() },
      ])
      setLoading(false)
    }
    load()
  },[post.id])

  const addComment = async () => {
    if(!input.trim()) return
    setPosting(true)
    const c = { post_id:post.id, doctor_name:'Dr. Ahmed', doctor_specialty:'Cardiology', content:input.trim(), likes:0, created_at:new Date().toISOString() }
    try { await supabase.from('post_comments').insert([c]) } catch {}
    setComments(prev=>[...prev,{...c,id:`local_${Date.now()}`}])
    setInput(''); setPosting(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(15,23,42,0.6)', backdropFilter:'blur(16px)', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding:'16px 20px', borderBottom:`1px solid ${L.border}`, background:L.surface, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onClose} style={{
          background:L.raised, border:`1px solid ${L.border}`,
          borderRadius:12, padding:'8px 14px',
          color:L.textSub, fontSize:13, fontWeight:700, cursor:'pointer',
        }}>←</button>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:L.textPrimary }}>💬 Discussion</div>
          <div style={{ fontSize:11, fontWeight:600, color:pt.color }}>{pt.icon} {pt.label}</div>
        </div>
      </div>

      {/* Original post */}
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${L.border}`, background:`${pt.color}06` }}>
        <div style={{ fontSize:13, fontWeight:700, color:L.textPrimary, marginBottom:4 }}>{post.doctor_name}</div>
        <div style={{ fontSize:13, color:L.textSub, lineHeight:1.6 }}>{post.content.substring(0,150)}{post.content.length>150?'...':''}</div>
      </div>

      {/* Comments */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', background:L.canvas }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:30, color:L.textMuted }}>Loading discussion...</div>
        ) : comments.length===0 ? (
          <div style={{ textAlign:'center', padding:30 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>💬</div>
            <div style={{ fontSize:14, color:L.textMuted }}>Be the first to comment</div>
          </div>
        ) : comments.map((c,i)=>(
          <div key={c.id||i} style={{ display:'flex', gap:10, marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:11, background:'rgba(30,64,175,0.08)', border:`1px solid rgba(30,64,175,0.15)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>👨‍⚕️</div>
            <div style={{ flex:1, background:L.surface, borderRadius:16, borderBottomLeftRadius:4, padding:'10px 14px', border:`1px solid ${L.border}`, boxShadow:L.shadowSm }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:700, color:L.textPrimary }}>{c.doctor_name}</span>
                <span style={{ fontSize:11, color:L.teal, fontWeight:600 }}>{c.doctor_specialty}</span>
                <span style={{ fontSize:10, color:L.textMuted, marginLeft:'auto' }}>{timeAgo(c.created_at)}</span>
              </div>
              <div style={{ fontSize:13, color:L.textSub, lineHeight:1.65 }}>{c.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'12px 16px', borderTop:`1px solid ${L.border}`, display:'flex', gap:10, background:L.surface }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addComment()}
          placeholder="Add to the discussion..."
          style={{ flex:1, padding:'12px 16px', borderRadius:16, border:`1px solid ${L.border}`, background:L.raised, color:L.textPrimary, fontSize:13, outline:'none' }}/>
        <button onClick={addComment} disabled={posting||!input.trim()} style={{
          padding:'12px 18px', borderRadius:16, border:'none', cursor:'pointer',
          background: !input.trim() ? L.raised : L.gradient,
          color: !input.trim() ? L.textMuted : 'white',
          fontSize:13, fontWeight:700, transition:smooth,
        }}>→</button>
      </div>
    </div>
  )
}

export default function ClinicalNet({ onXP }:{ onXP?:(n:number)=>void }) {
  const [posts, setPosts]           = useState<any[]>(DEMO_POSTS)
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('All')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showNewPost, setShowNewPost] = useState(false)
  const [commentPost, setCommentPost] = useState<any>(null)
  const [liveCount, setLiveCount]   = useState(247)
  const [pressed, setPressed]       = useState<string|null>(null)

  useEffect(()=>{
    loadPosts()
    const t = setInterval(()=>setLiveCount(n=>Math.max(200,Math.min(400,n+Math.floor(Math.random()*5)-2))),5000)
    return ()=>clearInterval(t)
  },[])

  const loadPosts = async () => {
    try {
      const { data } = await supabase.from('clinical_posts').select('*').order('created_at',{ascending:false}).limit(30)
      if(data&&data.length>0) setPosts(data)
    } catch {}
    setLoading(false)
  }

  const handleLike = async (id:string) => {
    setPosts(prev=>prev.map(p=>p.id===id?{...p,likes:p.likes+1}:p))
    try {
      const post = posts.find(p=>p.id===id)
      if(post&&!post.id.startsWith('local_')&&!post.id.startsWith('d'))
        await supabase.from('clinical_posts').update({likes:post.likes+1}).eq('id',id)
    } catch {}
  }

  const handleNewPost = (post:any) => { setPosts(prev=>[post,...prev]); onXP?.(15) }

  const filtered = posts.filter(p=>{
    const specMatch = filter==='All'||p.specialty_tag===filter||p.doctor_specialty===filter
    const typeMatch = typeFilter==='all'||p.post_type===typeFilter
    return specMatch && typeMatch
  })

  if(commentPost) return <CommentsModal post={commentPost} onClose={()=>setCommentPost(null)}/>
  if(showNewPost) return <NewPostModal onClose={()=>setShowNewPost(false)} onPost={handleNewPost}/>

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:L.teal, marginBottom:4 }}>
          GLOBAL MEDICAL NETWORK
        </div>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:28, fontWeight:900, color:L.textPrimary, letterSpacing:-0.6 }}>
              Clinical<span style={{ color:L.teal }}>Net</span>
            </div>
            <div style={{ fontSize:13, fontWeight:500, color:L.textMuted, marginTop:3 }}>
              Connect · Share · Learn with global physicians
            </div>
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:5, flexShrink:0,
            background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)',
            borderRadius:99, padding:'6px 12px',
          }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:L.sage, boxShadow:`0 0 6px ${L.sage}` }}/>
            <span style={{ fontSize:10, fontWeight:800, color:L.sage }}>{liveCount} ONLINE</span>
          </div>
        </div>
      </div>

      {/* New Post Button */}
      <button onClick={()=>setShowNewPost(true)}
        onMouseDown={()=>setPressed('new')} onMouseUp={()=>setPressed(null)}
        style={{
          width:'100%', padding:14, borderRadius:18, border:'none', marginBottom:16,
          background:L.gradient, color:'white', fontSize:14, fontWeight:800, cursor:'pointer',
          boxShadow:L.shadowGlow,
          transform: pressed==='new' ? 'scale(0.98)' : 'scale(1)',
          transition: spring,
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        }}>
        ✍️ Share with Colleagues
      </button>

      {/* Type Filter */}
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:10 }}>
        {[{id:'all',label:'🌐 All',color:L.teal},...POST_TYPES.map(pt=>({id:pt.id,label:`${pt.icon} ${pt.label}`,color:pt.color}))].map(f=>(
          <button key={f.id} onClick={()=>setTypeFilter(f.id)} style={{
            flexShrink:0, cursor:'pointer', whiteSpace:'nowrap',
            background: typeFilter===f.id ? `${f.color}10` : L.raised,
            border:`1px solid ${typeFilter===f.id ? f.color : L.border}`,
            borderRadius:99, padding:'6px 12px',
            color: typeFilter===f.id ? f.color : L.textMuted,
            fontSize:11, fontWeight:700, transition:smooth,
          }}>{f.label}</button>
        ))}
      </div>

      {/* Specialty Filter */}
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:16 }}>
        {SPECIALTIES.map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{
            flexShrink:0, cursor:'pointer', whiteSpace:'nowrap',
            background: filter===s ? 'rgba(30,64,175,0.08)' : L.raised,
            border:`1px solid ${filter===s ? L.cobalt : L.border}`,
            borderRadius:99, padding:'5px 12px',
            color: filter===s ? L.cobalt : L.textMuted,
            fontSize:10, fontWeight:700, transition:smooth,
          }}>{s}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[
          {l:'Posts Today', v:'84',  c:L.teal},
          {l:'Discussions', v:'247', c:L.cobalt},
          {l:'Countries',   v:'28',  c:L.sage},
          {l:'Specialties', v:'12',  c:L.violet},
        ].map(s=>(
          <div key={s.l} style={{
            flex:1, background:L.surface, border:`1px solid ${L.border}`,
            borderRadius:16, padding:'12px 6px', textAlign:'center',
            boxShadow:L.shadowSm,
          }}>
            <div style={{ fontSize:18, fontWeight:900, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:9, fontWeight:700, color:L.textMuted, marginTop:2, letterSpacing:0.5 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🌐</div>
          <div style={{ fontSize:14, fontWeight:500, color:L.textMuted }}>Loading ClinicalNet...</div>
        </div>
      ) : filtered.length===0 ? (
        <div style={{ textAlign:'center', padding:40, background:L.surface, borderRadius:20, border:`1px solid ${L.border}` }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🌐</div>
          <div style={{ fontSize:15, fontWeight:700, color:L.textPrimary, marginBottom:4 }}>No posts yet</div>
          <div style={{ fontSize:13, color:L.textMuted }}>Be the first to share in this specialty</div>
        </div>
      ) : filtered.map(post=>(
        <PostCard key={post.id} post={post} onComment={setCommentPost} onLike={handleLike}/>
      ))}
    </div>
  )
}
