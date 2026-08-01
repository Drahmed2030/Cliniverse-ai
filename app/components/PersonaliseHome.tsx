'use client'
import { useState, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const CSS = `
  @keyframes slideIn {
    from{opacity:0;transform:translateY(12px);}
    to  {opacity:1;transform:translateY(0);}
  }
  @keyframes checkIn {
    from{transform:scale(0.6);opacity:0;}
    to  {transform:scale(1);opacity:1;}
  }
  @keyframes dragPulse {
    0%,100%{opacity:0.5;} 50%{opacity:1;}
  }
`

// ── ALL HOME SECTIONS ──
const HOME_SECTIONS = [
  { id:'scribe',    icon:'🎙️', label:'Ambient Scribe',    desc:'Record consultation → SOAP note',    color:'#00C8B8', defaultOn:true  },
  { id:'case',      icon:'🏥', label:'Case of the Day',   desc:'AI clinical case · Interactive',      color:'#FF453A', defaultOn:true  },
  { id:'bento',     icon:'📊', label:'Dashboard Stats',   desc:'XP · Streak · Cases done',            color:'#FFD60A', defaultOn:true  },
  { id:'quicktools',icon:'⚡', label:'Quick Tools',       desc:'Fast access to clinical tools',       color:'#1A8CFF', defaultOn:true  },
  { id:'livefeed',  icon:'🔴', label:'Live Clinical Feed',desc:'Real-time cases worldwide',           color:'#FF453A', defaultOn:true  },
  { id:'academy',   icon:'🎓', label:'PulseAcademy',      desc:'AI lectures · CME credits',           color:'#BF5AF2', defaultOn:false },
  { id:'caselibrary',icon:'📚',label:'Case Library',      desc:'Critical · Sports · Pediatrics',     color:'#30D158', defaultOn:true  },
  { id:'discover',  icon:'🔬', label:'Discover',          desc:'Coming soon features',               color:'#636E82', defaultOn:false },
  { id:'pubmed',    icon:'📰', label:'PubMed Feed',       desc:'Latest research articles',           color:'#1A8CFF', defaultOn:false },
  { id:'pearl',     icon:'💎', label:'Clinical Pearl',    desc:'Weekly high-yield pearl',            color:'#FFD60A', defaultOn:false },
]

// ── ALL TOOLS ──
const ALL_TOOLS = [
  { id:'scribe',     icon:'🎙️', label:'Scribe',    color:'#00C8B8' },
  { id:'memory',     icon:'🗂️', label:'Memory',    color:'#00C8B8' },
  { id:'rx',         icon:'💊', label:'Rx AI',     color:'#30D158' },
  { id:'explorer',   icon:'🔬', label:'Explorer',  color:'#1A8CFF' },
  { id:'renal',      icon:'🫘', label:'Renal',     color:'#FF9F0A' },
  { id:'drugcheck',  icon:'⚗️', label:'Drug Int',  color:'#FF453A' },
  { id:'riskcalc',   icon:'📊', label:'Scores',    color:'#BF5AF2' },
  { id:'logbook',    icon:'📋', label:'Logbook',   color:'#FFD60A' },
  { id:'fhir',       icon:'🌐', label:'FHIR',      color:'#30D158' },
  { id:'terminology',icon:'📖', label:'Codes',     color:'#00C8B8' },
  { id:'enterprise', icon:'🤝', label:'Enterprise',color:'#FFD60A' },
  { id:'pearl',      icon:'💎', label:'Pearls',    color:'#FFD60A' },
]

const SPECIALTIES = [
  '🫀 Cardiology', '🚨 Emergency', '🧠 Neurology',
  '🫁 Respiratory', '🧸 Pediatrics', '⚽ Sports Med',
  '🔬 Critical Care', '🫘 Nephrology', '💊 Internal Med',
]

interface Prefs {
  sections:  { id:string, on:boolean }[]
  quickTools: string[]
  specialty:  string
  greeting:   string
}

const DEFAULT_PREFS: Prefs = {
  sections:   HOME_SECTIONS.map(s => ({ id:s.id, on:s.defaultOn })),
  quickTools: ['scribe','rx','explorer','riskcalc'],
  specialty:  '🫀 Cardiology',
  greeting:   'Doctor',
}

export default function PersonaliseHome({ onSave }: { onSave?: (p:Prefs)=>void }) {
  const [prefs, setPrefs]   = useState<Prefs>(DEFAULT_PREFS)
  const [tab, setTab]       = useState<'sections'|'tools'|'profile'>('sections')
  const [saved, setSaved]   = useState(false)
  const [dragIdx, setDragIdx] = useState<number|null>(null)
  const [overIdx, setOverIdx] = useState<number|null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('cliniverse-home-prefs')
    if (stored) setPrefs(JSON.parse(stored))
  }, [])

  const toggleSection = (id:string) => {
    setPrefs(p => ({
      ...p,
      sections: p.sections.map(s => s.id===id ? {...s, on:!s.on} : s)
    }))
    if ('vibrate' in navigator) navigator.vibrate(6)
  }

  const toggleTool = (id:string) => {
    setPrefs(p => {
      const has = p.quickTools.includes(id)
      if (!has && p.quickTools.length >= 6) return p // max 6
      return { ...p, quickTools: has ? p.quickTools.filter(t=>t!==id) : [...p.quickTools, id] }
    })
    if ('vibrate' in navigator) navigator.vibrate(6)
  }

  // Drag reorder
  const onDragStart = (i:number) => setDragIdx(i)
  const onDragOver  = (e:any, i:number) => { e.preventDefault(); setOverIdx(i) }
  const onDrop      = (i:number) => {
    if (dragIdx === null || dragIdx === i) return
    const next = [...prefs.sections]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(i, 0, moved)
    setPrefs(p => ({ ...p, sections: next }))
    setDragIdx(null); setOverIdx(null)
  }

  const save = () => {
    localStorage.setItem('cliniverse-home-prefs', JSON.stringify(prefs))
    onSave?.(prefs)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if ('vibrate' in navigator) navigator.vibrate([6,50,6])
  }

  const reset = () => { setPrefs(DEFAULT_PREFS); localStorage.removeItem('cliniverse-home-prefs') }

  const activeCount = prefs.sections.filter(s=>s.on).length

  return (
    <div style={{ fontFamily:F }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, color:'rgba(0,200,184,0.85)', fontWeight:700, letterSpacing:1.5, marginBottom:3 }}>SETTINGS</div>
        <div style={{ fontSize:20, fontWeight:900, color:'var(--text-primary, #F2F8FC)', letterSpacing:-0.4 }}>
          Personalise <span style={{ color:'#00C8B8' }}>Home</span>
        </div>
        <div style={{ fontSize:12, color:'var(--text-muted, rgba(242,248,252,0.50))', marginTop:4 }}>
          Customise your clinical workspace
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:5, background:'rgba(255,255,255,0.05)', borderRadius:16, padding:4, marginBottom:18, border:'1px solid rgba(255,255,255,0.08)' }}>
        {([
          ['sections','🏠 Sections'],
          ['tools',   '⚡ Quick Tools'],
          ['profile', '👤 Profile'],
        ] as [string,string][]).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id as any)} style={{
            flex:1, padding:'9px 2px', cursor:'pointer', borderRadius:12, fontFamily:F,
            fontWeight:700, fontSize:10,
            border:tab===id?'1px solid rgba(0,200,184,0.35)':'1px solid transparent',
            background:tab===id?'rgba(0,200,184,0.12)':'transparent',
            color:tab===id?'#00C8B8':'rgba(242,248,252,0.45)',
            transition:'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* ── SECTIONS TAB ── */}
      {tab === 'sections' && (
        <div style={{ animation:'slideIn 0.3s ease' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:10, color:'rgba(242,248,252,0.42)', fontWeight:700, letterSpacing:1.5 }}>
              HOME SECTIONS ({activeCount} active)
            </div>
            <div style={{ fontSize:10, color:'var(--text-muted, rgba(242,248,252,0.35))' }}>Drag to reorder</div>
          </div>

          {prefs.sections.map((sec, i) => {
            const info = HOME_SECTIONS.find(s => s.id === sec.id)!
            const isDragging = dragIdx === i
            const isOver = overIdx === i

            return (
              <div
                key={sec.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                onDrop={() => onDrop(i)}
                onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  background: isDragging ? `${info.color}15` : isOver ? 'rgba(0,200,184,0.08)' : sec.on ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  border:`1.5px solid ${isDragging ? info.color+'40' : isOver ? '#00C8B840' : sec.on ? info.color+'20' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius:16, padding:'12px 14px', marginBottom:7,
                  cursor:'grab', transition:'all 0.15s',
                  opacity: sec.on ? 1 : 0.50,
                  transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* Drag handle */}
                <div style={{ fontSize:14, color:'rgba(242,248,252,0.25)', flexShrink:0, animation: isDragging?'dragPulse 0.5s infinite':'' }}>
                  ⋮⋮
                </div>

                {/* Icon */}
                <div style={{ width:38, height:38, borderRadius:12, background:`${info.color}18`, border:`1px solid ${info.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {info.icon}
                </div>

                {/* Info */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary, #F2F8FC)', marginBottom:2 }}>{info.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted, rgba(242,248,252,0.45))' }}>{info.desc}</div>
                </div>

                {/* Toggle */}
                <div
                  onClick={() => toggleSection(sec.id)}
                  style={{
                    width:46, height:26, borderRadius:13, flexShrink:0, cursor:'pointer',
                    background: sec.on ? `linear-gradient(135deg,${info.color},${info.color}AA)` : 'rgba(255,255,255,0.12)',
                    position:'relative', transition:'all 0.25s',
                    boxShadow: sec.on ? `0 0 12px ${info.color}40` : 'none',
                  }}
                >
                  <div style={{
                    position:'absolute', top:3, left: sec.on ? 23 : 3,
                    width:20, height:20, borderRadius:'50%',
                    background:'#fff', transition:'left 0.25s',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.25)',
                  }}/>
                </div>
              </div>
            )
          })}

          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'10px 14px', marginTop:8 }}>
            <div style={{ fontSize:10, color:'rgba(242,248,252,0.38)' }}>
              💡 Drag sections to reorder · Toggle to show/hide on Home
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK TOOLS TAB ── */}
      {tab === 'tools' && (
        <div style={{ animation:'slideIn 0.3s ease' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:10, color:'rgba(242,248,252,0.42)', fontWeight:700, letterSpacing:1.5 }}>
              QUICK ACCESS TOOLS
            </div>
            <div style={{ fontSize:10, color: prefs.quickTools.length>=6 ? '#FF453A' : 'rgba(242,248,252,0.35)' }}>
              {prefs.quickTools.length}/6 selected
            </div>
          </div>

          {/* Preview */}
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'14px', marginBottom:14 }}>
            <div style={{ fontSize:9, color:'rgba(242,248,252,0.38)', fontWeight:700, letterSpacing:1, marginBottom:10 }}>PREVIEW — HOME QUICK TOOLS</div>
            <div style={{ display:'flex', gap:10, overflowX:'auto' }}>
              {prefs.quickTools.length === 0
                ? <div style={{ fontSize:12, color:'var(--text-muted, rgba(242,248,252,0.35))' }}>No tools selected</div>
                : prefs.quickTools.map(id => {
                    const t = ALL_TOOLS.find(t=>t.id===id)!
                    return t ? (
                      <div key={id} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                        <div style={{ width:48, height:48, borderRadius:15, background:`${t.color}15`, border:`1.5px solid ${t.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{t.icon}</div>
                        <div style={{ fontSize:8, color:'var(--text-secondary, rgba(242,248,252,0.55))', fontWeight:700 }}>{t.label}</div>
                      </div>
                    ) : null
                  })
              }
            </div>
          </div>

          {/* Tool grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {ALL_TOOLS.map(t => {
              const on = prefs.quickTools.includes(t.id)
              const maxed = !on && prefs.quickTools.length >= 6
              return (
                <div key={t.id} onClick={()=>!maxed&&toggleTool(t.id)} style={{
                  background: on ? `${t.color}14` : 'rgba(255,255,255,0.04)',
                  border:`1.5px solid ${on ? t.color+'40' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius:16, padding:'12px 8px',
                  cursor: maxed ? 'not-allowed' : 'pointer',
                  textAlign:'center', transition:'all 0.2s',
                  opacity: maxed ? 0.4 : 1, position:'relative',
                }}>
                  <div style={{ fontSize:24, marginBottom:4 }}>{t.icon}</div>
                  <div style={{ fontSize:10, fontWeight:700, color: on?t.color:'var(--text-primary, #F2F8FC)' }}>{t.label}</div>
                  {on && <div style={{ position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#000', fontWeight:900, animation:'checkIn 0.2s ease' }}>✓</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <div style={{ animation:'slideIn 0.3s ease' }}>

          {/* Greeting name */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:'rgba(242,248,252,0.42)', fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>YOUR NAME (shown in greeting)</div>
            <input
              value={prefs.greeting}
              onChange={e => setPrefs(p => ({ ...p, greeting: e.target.value }))}
              placeholder="Doctor"
              style={{ width:'100%', padding:'13px 14px', borderRadius:14, border:'1.5px solid rgba(0,200,184,0.28)', background:'rgba(255,255,255,0.06)', color:'var(--text-primary, #F2F8FC)', fontSize:14, outline:'none', fontFamily:F, boxSizing:'border-box' }}
            />
            <div style={{ fontSize:10, color:'var(--text-muted, rgba(242,248,252,0.35))', marginTop:5 }}>
              Preview: "Good morning, {prefs.greeting||'Doctor'} 👋"
            </div>
          </div>

          {/* Specialty */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:'rgba(242,248,252,0.42)', fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>YOUR SPECIALTY</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {SPECIALTIES.map(sp => (
                <button key={sp} onClick={()=>setPrefs(p=>({...p,specialty:sp}))} style={{
                  background: prefs.specialty===sp ? 'rgba(0,200,184,0.15)' : 'rgba(255,255,255,0.05)',
                  border:`1.5px solid ${prefs.specialty===sp ? 'rgba(0,200,184,0.45)' : 'rgba(255,255,255,0.10)'}`,
                  borderRadius:20, padding:'7px 13px', cursor:'pointer', fontFamily:F,
                  color: prefs.specialty===sp ? '#00C8B8' : 'rgba(242,248,252,0.60)',
                  fontSize:11, fontWeight:700, transition:'all 0.2s',
                }}>{sp}</button>
              ))}
            </div>
            <div style={{ fontSize:10, color:'var(--text-muted, rgba(242,248,252,0.35))', marginTop:6 }}>
              Used to personalise AI cases and recommendations
            </div>
          </div>

          {/* Home greeting preview */}
          <div style={{ background:'linear-gradient(135deg,rgba(0,200,184,0.08),rgba(26,140,255,0.05))', border:'1.5px solid rgba(0,200,184,0.20)', borderRadius:18, padding:'16px', marginBottom:4 }}>
            <div style={{ fontSize:9, color:'rgba(0,200,184,0.80)', fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>HOME PREVIEW</div>
            <div style={{ fontSize:22, fontWeight:900, color:'var(--text-primary, #F2F8FC)', letterSpacing:-0.5, marginBottom:4 }}>
              ☀️ Good morning,<br/><span style={{ color:'#00C8B8' }}>{prefs.greeting||'Doctor'}</span>
            </div>
            <div style={{ fontSize:12, color:'var(--text-secondary, rgba(242,248,252,0.55))' }}>
              {prefs.specialty} · Cliniverse AI
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap:10, marginTop:20 }}>
        <button onClick={reset} style={{ flex:1, padding:'13px', borderRadius:16, border:'1px solid rgba(255,69,58,0.25)', background:'rgba(255,69,58,0.08)', color:'#FF453A', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:F }}>
          ↺ Reset
        </button>
        <button onClick={save} style={{
          flex:2, padding:'13px', borderRadius:16, border:'none',
          background: saved ? 'rgba(48,209,88,0.20)' : 'linear-gradient(135deg,#00C8B8,#1A8CFF)',
          color: saved ? '#30D158' : '#fff',
          fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:F,
          boxShadow: saved ? 'none' : '0 6px 20px rgba(0,200,184,0.35)',
          transition:'all 0.3s',
        }}>
          {saved ? '✓ Saved!' : '💾 Save Preferences'}
        </button>
      </div>

      <div style={{ marginTop:12, textAlign:'center', fontSize:10, color:'rgba(242,248,252,0.28)' }}>
        🍎 Preferences saved locally · Sync coming soon
      </div>

      <style>{CSS}</style>
    </div>
  )
}
