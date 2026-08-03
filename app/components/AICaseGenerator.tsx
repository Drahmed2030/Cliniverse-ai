'use client'
import { useState } from 'react'
import { supabase } from '../supabase'

// ── TYPES ──
interface GeneratedCase {
  title: string
  subtitle: string
  specialty: string
  dept: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  targetAudience: string[]
  color: string
  icon: string
  xpReward: number
  free: boolean
  vitals: { bp: string; hr: string; o2: string; temp: string; rr: string; gcs: string }
  ecg: string
  presentation: string
  management: string[]
  keyLearning: string[]
  mcqs: { q: string; opts: string[]; correct: number; explain: string }[]
}

const SPECIALTIES = [
  { id:'emergency', label:'Emergency Medicine', icon:'🚨', color:'#ff453a' },
  { id:'cardiology', label:'Cardiology', icon:'🫀', color:'#ff9f0a' },
  { id:'neurology', label:'Neurology', icon:'🧠', color:'#00C4B4' },
  { id:'pharmacy', label:'Pharmacy', icon:'💊', color:'#30d158' },
  { id:'nursing', label:'Nursing', icon:'🩺', color:'#64d2ff' },
  { id:'laboratory', label:'Laboratory', icon:'🔬', color:'#bf5af2' },
  { id:'radiology', label:'Radiology', icon:'🩻', color:'#ffd60a' },
  { id:'pediatrics', label:'Pediatrics', icon:'🧸', color:'#ff6b35' },
  { id:'surgery', label:'Surgery', icon:'🔪', color:'#ff453a' },
  { id:'obgyn', label:'OB/GYN', icon:'🌸', color:'#ff9f0a' },
  { id:'psychiatry', label:'Psychiatry', icon:'🧩', color:'#00C4B4' },
  { id:'dentistry', label:'Dentistry', icon:'🦷', color:'#64d2ff' },
  { id:'ophthalmology', label:'Ophthalmology', icon:'👁️', color:'#00C4B4' },
  { id:'orthopedics', label:'Orthopedics', icon:'🦴', color:'#ff9f0a' },
]

const DIFFICULTIES = [
  { id:'Beginner', label:'Beginner', color:'#30d158', desc:'Medical students' },
  { id:'Intermediate', label:'Intermediate', color:'#ff9f0a', desc:'Junior residents' },
  { id:'Advanced', label:'Advanced', color:'#ff453a', desc:'Senior residents' },
  { id:'Expert', label:'Expert', color:'#bf5af2', desc:'Consultants' },
]

const AUDIENCES = ['Medical Students','Junior Residents','Senior Residents','Consultants','Nurses','Pharmacists','Lab Technicians','All Healthcare']

const C = {
  card: 'rgba(255,255,255,0.14)',
  border: 'rgba(0,196,180,0.25)',
  text: '#EEF6FA',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.25)',
}

export default function AICaseGenerator({ onXP }: { onXP?: (n:number)=>void }) {
  const [view, setView] = useState<'generator'|'preview'|'library'>('generator')
  const [specialty, setSpecialty] = useState('emergency')
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [audience, setAudience] = useState<string[]>(['Medical Students'])
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState<'English'|'Arabic'>('English')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<GeneratedCase|null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [library, setLibrary] = useState<any[]>([])
  const [loadingLib, setLoadingLib] = useState(false)

  const selectedSpec = SPECIALTIES.find(s => s.id === specialty)!
  const selectedDiff = DIFFICULTIES.find(d => d.id === difficulty)!

  const generateCase = async () => {
    setGenerating(true)
    setGenerated(null)
    setSaved(false)

    const systemPrompt = `You are a world-class medical education expert. Generate realistic, evidence-based clinical cases for healthcare education. Always respond with valid JSON only — no markdown, no explanation.`

    const userPrompt = `Generate a ${difficulty} level clinical case for ${selectedSpec.label}.
${topic ? `Topic/focus: ${topic}` : 'Choose an interesting, educational case.'}
Target audience: ${audience.join(', ')}
Language: ${language}

Return ONLY this JSON structure:
{
  "title": "Case title (short)",
  "subtitle": "Patient demographics + chief complaint",
  "specialty": "${selectedSpec.label}",
  "dept": "ED|CCU|ICU|Ward|Clinic|Pharmacy|Lab|Radiology|OR|Peds",
  "difficulty": "${difficulty}",
  "targetAudience": ${JSON.stringify(audience)},
  "color": "${selectedSpec.color}",
  "icon": "${selectedSpec.icon}",
  "xpReward": ${difficulty==='Beginner'?50:difficulty==='Intermediate'?80:difficulty==='Advanced'?120:160},
  "free": false,
  "vitals": {
    "bp": "xxx/xx",
    "hr": "xxx",
    "o2": "xx",
    "temp": "xx.x",
    "rr": "xx",
    "gcs": "xx"
  },
  "ecg": "ECG findings description or N/A",
  "presentation": "Detailed clinical presentation 3-5 sentences. Include relevant history, symptoms, relevant investigations.",
  "management": ["Step 1 with dose/detail", "Step 2", "Step 3", "Step 4", "Step 5", "Step 6"],
  "keyLearning": ["Learning point 1", "Learning point 2", "Learning point 3"],
  "mcqs": [
    {
      "q": "Clinical question about this case",
      "opts": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explain": "Why this answer is correct with evidence"
    },
    {
      "q": "Second clinical question",
      "opts": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1,
      "explain": "Explanation with guideline reference"
    }
  ]
}`

    try {
      const res = await fetch('/api/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: selectedSpec?.label || 'Emergency Medicine',
          difficulty,
          department: 'ED',
          systemPrompt,
          userPrompt
        })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Generation failed')
      const parsed = data.case as GeneratedCase
      setGenerated(parsed)
      setView('preview')
      onXP && onXP(10)
    } catch (e) {
      alert('Generation failed. Please try again.')
    }
    setGenerating(false)
  }

  const saveToSupabase = async () => {
    if (!generated) return
    setSaving(true)
    try {
      const { error } = await supabase.from('generated_cases').insert({
        title: generated.title,
        subtitle: generated.subtitle,
        specialty: generated.specialty,
        dept: generated.dept,
        difficulty: generated.difficulty,
        target_audience: generated.targetAudience,
        color: generated.color,
        icon: generated.icon,
        xp_reward: generated.xpReward,
        is_free: generated.free,
        vitals: generated.vitals,
        ecg: generated.ecg,
        presentation: generated.presentation,
        management: generated.management,
        key_learning: generated.keyLearning,
        mcqs: generated.mcqs,
        language: language,
        is_approved: false,
        created_at: new Date().toISOString(),
      })
      if (!error) { setSaved(true); onXP && onXP(20) }
    } catch {}
    setSaving(false)
  }

  const loadLibrary = async () => {
    setLoadingLib(true)
    const { data } = await supabase
      .from('generated_cases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setLibrary(data)
    setLoadingLib(false)
  }

  // ── GENERATOR VIEW ──
  if (view === 'generator') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,rgba(0,196,180,0.25),rgba(0,196,180,0.10))',borderRadius:22,padding:'18px',marginBottom:16,border:'1px solid rgba(0,196,180,0.25)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(139,92,246,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>🤖 Powered by Claude AI</div>
        <div style={{fontSize:22,fontWeight:900,color:'#0A1628',letterSpacing:-0.5,marginBottom:4}}>AI Case Generator</div>
        <div style={{fontSize:13,color:C.sub}}>Generate unlimited clinical cases for any specialty, level & audience</div>
        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button onClick={()=>{setView('library');loadLibrary()}} style={{padding:'8px 16px',borderRadius:12,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'#6ee7e1',fontSize:12,fontWeight:700,cursor:'pointer'}}>📚 Library</button>
        </div>
      </div>

      {/* Specialty */}
      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>Specialty</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
        {SPECIALTIES.map(s=>(
          <button key={s.id} onClick={()=>setSpecialty(s.id)} style={{padding:'10px 8px',borderRadius:14,border:specialty===s.id?`2px solid ${s.color}`:`1px solid ${C.border}`,background:specialty===s.id?`${s.color}18`:C.card,cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:specialty===s.id?s.color:C.sub,lineHeight:1.3}}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Difficulty */}
      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>Difficulty</div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {DIFFICULTIES.map(d=>(
          <button key={d.id} onClick={()=>setDifficulty(d.id)} style={{flex:1,padding:'10px 6px',borderRadius:14,border:difficulty===d.id?`2px solid ${d.color}`:`1px solid ${C.border}`,background:difficulty===d.id?`${d.color}18`:C.card,cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:11,fontWeight:800,color:difficulty===d.id?d.color:C.sub,marginBottom:2}}>{d.label}</div>
            <div style={{fontSize:9,color:C.muted}}>{d.desc}</div>
          </button>
        ))}
      </div>

      {/* Audience */}
      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>Target Audience</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
        {AUDIENCES.map(a=>(
          <button key={a} onClick={()=>setAudience(prev=>prev.includes(a)?prev.filter(x=>x!==a):[...prev,a])} style={{padding:'6px 12px',borderRadius:10,border:audience.includes(a)?'2px solid #8b5cf6':`1px solid ${C.border}`,background:audience.includes(a)?'rgba(139,92,246,0.3)':C.card,color:audience.includes(a)?'#6ee7e1':C.sub,fontSize:11,fontWeight:700,cursor:'pointer'}}>
            {a}
          </button>
        ))}
      </div>

      {/* Language */}
      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>Language</div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {(['English','Arabic'] as const).map(l=>(
          <button key={l} onClick={()=>setLanguage(l)} style={{flex:1,padding:'12px',borderRadius:14,border:language===l?'2px solid #8b5cf6':`1px solid ${C.border}`,background:language===l?'rgba(139,92,246,0.3)':C.card,color:language===l?'#6ee7e1':C.sub,fontSize:13,fontWeight:700,cursor:'pointer'}}>
            {l==='English'?'🇬🇧 English':'🇸🇦 العربية'}
          </button>
        ))}
      </div>

      {/* Topic (optional) */}
      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>Specific Topic (optional)</div>
      <input
        value={topic}
        onChange={e=>setTopic(e.target.value)}
        placeholder={`e.g. "STEMI in young patient" or "Drug interaction warfarin"`}
        style={{width:'100%',padding:'14px 16px',borderRadius:16,border:`1px solid ${C.border}`,background:'var(--bg-card,rgba(255,255,255,0.88))',color:'var(--text-primary, white)',fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:20}}
      />

      {/* Generate button */}
      <button onClick={generateCase} disabled={generating||audience.length===0}
        style={{width:'100%',padding:'18px',borderRadius:18,border:'none',background:generating?'rgba(139,92,246,0.3)':'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'var(--text-primary, white)',fontSize:16,fontWeight:800,cursor:generating?'not-allowed':'pointer',boxShadow:generating?'none':'0 8px 32px rgba(139,92,246,0.5)',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all 0.3s'}}>
        {generating ? (
          <>
            <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 1s linear infinite'}}/>
            Generating with Claude AI...
          </>
        ) : '🤖 Generate Case'}
      </button>

      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(255,255,255,0.25)}
      `}</style>
    </div>
  )

  // ── PREVIEW VIEW ──
  if (view === 'preview' && generated) {
    const g = generated
    const diffColor = DIFFICULTIES.find(d=>d.id===g.difficulty)?.color || '#00C4B4'
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('generator')} style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,color:'#0A84FF',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:'#0A1628'}}>Generated Case Preview</div>
            <div style={{fontSize:11,color:C.sub}}>{g.specialty} · {g.difficulty}</div>
          </div>
        </div>

        {/* Case header */}
        <div style={{background:`${g.color}12`,borderRadius:22,padding:'20px',marginBottom:12,border:`1px solid ${g.color}30`,boxShadow:`0 6px 24px ${g.color}15`}}>
          <div style={{fontSize:40,marginBottom:8,textAlign:'center'}}>{g.icon}</div>
          <div style={{fontSize:20,fontWeight:900,color:'#0A1628',textAlign:'center',marginBottom:4}}>{g.title}</div>
          <div style={{fontSize:13,color:C.sub,textAlign:'center',marginBottom:12}}>{g.subtitle}</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${diffColor}20`,color:diffColor,fontWeight:700,border:`1px solid ${diffColor}30`}}>{g.difficulty}</span>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${g.color}15`,color:g.color,fontWeight:700,border:`1px solid ${g.color}25`}}>{g.dept}</span>
            <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:'rgba(255,214,10,0.15)',color:'#ffd60a',fontWeight:700}}>+{g.xpReward} XP</span>
          </div>
        </div>

        {/* Vitals */}
        <div style={{background:C.card,borderRadius:16,padding:'14px',marginBottom:10,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>VITAL SIGNS</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {Object.entries(g.vitals).map(([k,v])=>(
              <div key={k} style={{background:'var(--bg-card,rgba(255,255,255,0.88))',borderRadius:10,padding:'8px',textAlign:'center'}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:3}}>{k.toUpperCase()}</div>
                <div style={{fontSize:13,fontWeight:800,color:'#0A1628'}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Presentation */}
        <div style={{background:C.card,borderRadius:16,padding:'14px',marginBottom:10,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>PRESENTATION</div>
          <div style={{fontSize:13,color:'rgba(10,22,40,0.85)',lineHeight:1.75}}>{g.presentation}</div>
        </div>

        {/* Management */}
        <div style={{background:C.card,borderRadius:16,padding:'14px',marginBottom:10,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:10,letterSpacing:0.5}}>MANAGEMENT</div>
          {g.management.map((m,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:8,alignItems:'flex-start'}}>
              <div style={{width:22,height:22,borderRadius:'50%',background:`${g.color}22`,border:`1px solid ${g.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:g.color,flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:'rgba(10,22,40,0.85)',lineHeight:1.6}}>{m}</div>
            </div>
          ))}
        </div>

        {/* Key Learning */}
        <div style={{background:'linear-gradient(135deg,rgba(10,132,255,0.08),rgba(0,196,180,0.05))',borderRadius:16,padding:'14px',marginBottom:10,border:'1px solid rgba(0,196,180,0.15)'}}>
          <div style={{fontSize:10,color:'#00C4B4',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>💡 KEY LEARNING</div>
          {g.keyLearning.map((l,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginBottom:6}}>
              <span style={{color:'#30d158',fontSize:12,flexShrink:0}}>✓</span>
              <span style={{fontSize:12,color:'rgba(10,22,40,0.80)',lineHeight:1.5}}>{l}</span>
            </div>
          ))}
        </div>

        {/* MCQs preview */}
        <div style={{background:C.card,borderRadius:16,padding:'14px',marginBottom:14,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>MCQs ({g.mcqs.length} questions included)</div>
          {g.mcqs.map((q,i)=>(
            <div key={i} style={{marginBottom:i<g.mcqs.length-1?12:0,paddingBottom:i<g.mcqs.length-1?12:0,borderBottom:i<g.mcqs.length-1?'1px solid rgba(36,63,82,0.50)':'none'}}>
              <div style={{fontSize:12,color:'rgba(10,22,40,0.85)',fontWeight:600,marginBottom:6}}>{i+1}. {q.q}</div>
              {q.opts.map((o,j)=>(
                <div key={j} style={{fontSize:11,color:j===q.correct?'#86efac':C.muted,padding:'4px 8px',borderRadius:8,background:j===q.correct?'rgba(48,209,88,0.1)':'transparent',marginBottom:3,border:j===q.correct?'1px solid rgba(48,209,88,0.2)':'none'}}>
                  {['A','B','C','D'][j]}. {o} {j===q.correct&&'✓'}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>{setGenerated(null);setView('generator')}}
            style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:13,fontWeight:700,cursor:'pointer'}}>
            🔄 Regenerate
          </button>
          <button onClick={saveToSupabase} disabled={saving||saved}
            style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:saved?'rgba(48,209,88,0.2)':saving?'rgba(139,92,246,0.3)':'linear-gradient(135deg,#30d158,#0a84ff)',color:'var(--text-primary, white)',fontSize:14,fontWeight:800,cursor:saved||saving?'not-allowed':'pointer',boxShadow:saved||saving?'none':'0 6px 20px rgba(48,209,88,0.4)'}}>
            {saved ? '✅ Saved to Library!' : saving ? 'Saving...' : '💾 Save to Library'}
          </button>
        </div>
      </div>
    )
  }

  // ── LIBRARY VIEW ──
  if (view === 'library') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <button onClick={()=>setView('generator')} style={{background:'rgba(10,132,255,0.08)',border:'1px solid rgba(10,132,255,0.15)',borderRadius:12,color:'#0A84FF',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:'#0A1628'}}>📚 Case Library</div>
          <div style={{fontSize:11,color:C.sub}}>AI-generated cases · {library.length} saved</div>
        </div>
      </div>

      {loadingLib ? (
        <div style={{textAlign:'center',padding:'40px'}}>
          <div style={{width:32,height:32,borderRadius:'50%',border:'3px solid rgba(139,92,246,0.3)',borderTop:'3px solid #8b5cf6',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}/>
          <div style={{fontSize:13,color:C.sub}}>Loading library...</div>
        </div>
      ) : library.length === 0 ? (
        <div style={{background:C.card,borderRadius:20,padding:'32px',border:`1px solid ${C.border}`,textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:12}}>📭</div>
          <div style={{fontSize:16,fontWeight:700,color:'#0A1628',marginBottom:6}}>Library Empty</div>
          <div style={{fontSize:13,color:C.sub}}>Generate your first case to start building the library</div>
        </div>
      ) : library.map(c=>(
        <div key={c.id} style={{background:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${c.color||'#00C4B4'}20`}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:13,background:`${c.color||'#00C4B4'}18`,border:`1px solid ${c.color||'#00C4B4'}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{c.icon||'🏥'}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:'#0A1628',marginBottom:2}}>{c.title}</div>
              <div style={{fontSize:11,color:C.sub,marginBottom:4}}>{c.subtitle}</div>
              <div style={{display:'flex',gap:6}}>
                <span style={{fontSize:9,padding:'2px 8px',borderRadius:6,background:'rgba(0,196,180,0.25)',color:'#6ee7e1',fontWeight:700}}>{c.specialty}</span>
                <span style={{fontSize:9,padding:'2px 8px',borderRadius:6,background:'rgba(255,214,10,0.15)',color:'#ffd60a',fontWeight:700}}>{c.difficulty}</span>
                {c.is_approved&&<span style={{fontSize:9,padding:'2px 8px',borderRadius:6,background:'rgba(48,209,88,0.15)',color:'#30d158',fontWeight:700}}>✓ Approved</span>}
              </div>
            </div>
            <div style={{fontSize:11,color:C.muted,textAlign:'right'}}>
              <div style={{fontWeight:700,color:'#ffd60a'}}>+{c.xp_reward} XP</div>
              <div style={{marginTop:4}}>{new Date(c.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      ))}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return null
}
