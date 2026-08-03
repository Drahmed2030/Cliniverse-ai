'use client'
import { useState, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const CSS = `
  @keyframes checkIn {
    from{transform:scale(0.7);opacity:0;}
    to  {transform:scale(1);opacity:1;}
  }
  @keyframes slideIn {
    from{opacity:0;transform:translateY(10px);}
    to  {opacity:1;transform:translateY(0);}
  }
  @keyframes logoFloat {
    0%,100%{opacity:0.06;} 50%{opacity:0.11;}
  }
`

// ── SETTINGS CONFIG ──
const FONTS = [
  { id:'sf',       label:'SF Pro',    desc:'Apple default · Clean',     sample:'Aa',  style:{fontFamily:'-apple-system,sans-serif'} },
  { id:'newyork',  label:'New York',  desc:'Elegant serif · Premium',   sample:'Aa',  style:{fontFamily:'Georgia,serif'} },
  { id:'rounded',  label:'Rounded',   desc:'Friendly · Modern',         sample:'Aa',  style:{fontFamily:'ui-rounded,sans-serif'} },
  { id:'mono',     label:'Mono',      desc:'Technical · Clinical data', sample:'Aa',  style:{fontFamily:'ui-monospace,monospace'} },
]

const TEXT_SIZES = [
  { id:'sm',   label:'Small',      scale:0.88 },
  { id:'md',   label:'Medium',     scale:1.00 },
  { id:'lg',   label:'Large',      scale:1.14 },
  { id:'xl',   label:'Extra Large',scale:1.28 },
]

const CARD_STYLES = [
  {
    id:'glass',
    label:'Glass',
    desc:'Frosted · Translucent',
    icon:'🪟',
    preview:{ background:'var(--bg-card-2,rgba(255,255,255,0.08))', backdropFilter:'blur(16px)', border:'1.5px solid rgba(255,255,255,0.16)', borderRadius:16 },
  },
  {
    id:'solid',
    label:'Solid',
    desc:'Clean · High contrast',
    icon:'⬛',
    preview:{ background:'#1a3050', border:'1.5px solid rgba(255,255,255,0.10)', borderRadius:16 },
  },
  {
    id:'outline',
    label:'Outline',
    desc:'Minimal · Lightweight',
    icon:'⬜',
    preview:{ background:'transparent', border:'2px solid rgba(0,200,184,0.45)', borderRadius:16 },
  },
  {
    id:'floating',
    label:'Floating',
    desc:'Depth · Elevated shadow',
    icon:'🃏',
    preview:{ background:'#1a3050', border:'1px solid var(--border-card,rgba(10,132,255,0.10))', borderRadius:20, boxShadow:'0 12px 36px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.30)' },
  },
]

const DENSITIES = [
  { id:'compact',     label:'Compact',     desc:'More info · Less space',    spacing:8  },
  { id:'regular',     label:'Regular',     desc:'Balanced · Default',        spacing:14 },
  { id:'comfortable', label:'Comfortable', desc:'Spacious · Easy to read',   spacing:20 },
]

const MOTION_OPTIONS = [
  { id:'full',    label:'Full Motion',    desc:'All animations enabled',     icon:'✨' },
  { id:'reduced', label:'Reduced',        desc:'Subtle transitions only',    icon:'🌊' },
  { id:'none',    label:'No Motion',      desc:'Static · Accessibility',     icon:'⏸' },
]

const NAV_STYLES = [
  { id:'filled',  label:'Filled',  desc:'Solid icons',    icon:'●' },
  { id:'outline', label:'Outline', desc:'Line icons',     icon:'○' },
  { id:'colored', label:'Colored', desc:'Vibrant icons',  icon:'🎨' },
]

const RADIUS_OPTIONS = [
  { id:'sharp',  label:'Sharp',   desc:'0px corners',  radius:4  },
  { id:'medium', label:'Medium',  desc:'12px corners', radius:12 },
  { id:'round',  label:'Round',   desc:'20px corners', radius:20 },
  { id:'pill',   label:'Pill',    desc:'Full round',   radius:99 },
]

interface Settings {
  font:     string
  textSize: string
  card:     string
  density:  string
  motion:   string
  nav:      string
  radius:   string
}

const DEFAULT: Settings = {
  font:'sf', textSize:'md', card:'glass',
  density:'regular', motion:'full', nav:'filled', radius:'round',
}

function applySettings(s: Settings) {
  const root = document.documentElement
  const font = FONTS.find(f => f.id === s.font)
  const size = TEXT_SIZES.find(t => t.id === s.textSize)
  const rad  = RADIUS_OPTIONS.find(r => r.id === s.radius)

  if (font)  root.style.setProperty('--font-ui',    font.style.fontFamily)
  if (size)  root.style.setProperty('--text-scale', String(size.scale))
  if (rad)   root.style.setProperty('--radius',     rad.radius + 'px')
  root.setAttribute('data-card',    s.card)
  root.setAttribute('data-density', s.density)
  root.setAttribute('data-motion',  s.motion)
  root.setAttribute('data-nav',     s.nav)
}

// ── SECTION HEADER ──
function SectionHeader({ title, icon }: { title:string, icon:string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, marginTop:4 }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <div style={{ fontSize:10, color:'var(--text-muted, rgba(242,248,252,0.45))', fontWeight:700, letterSpacing:1.5 }}>{title}</div>
    </div>
  )
}

// ── OPTION ROW ──
function OptionRow({ label, desc, selected, onSelect, accent='#00C8B8' }:
  { label:string, desc:string, selected:boolean, onSelect:()=>void, accent?:string }) {
  return (
    <div onClick={onSelect} style={{
      display:'flex', alignItems:'center', gap:12,
      background: selected ? `${accent}10` : 'rgba(255,255,255,0.04)',
      border:`1.5px solid ${selected ? accent+'40' : 'rgba(255,255,255,0.08)'}`,
      borderRadius:14, padding:'11px 14px', cursor:'pointer',
      transition:'all 0.2s ease', marginBottom:7,
    }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary, #F2F8FC)' }}>{label}</div>
        <div style={{ fontSize:10, color:'var(--text-muted, rgba(242,248,252,0.45))', marginTop:2 }}>{desc}</div>
      </div>
      {selected && (
        <div style={{ width:22, height:22, borderRadius:'50%', background:accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#000', fontWeight:900, flexShrink:0, animation:'checkIn 0.2s ease' }}>✓</div>
      )}
    </div>
  )
}

export default function AppearanceSettings({ onClose }: { onClose?: ()=>void }) {
  const [s, setS]         = useState<Settings>(DEFAULT)
  const [saved, setSaved] = useState(false)
  const [tab, setTab]     = useState<'text'|'cards'|'layout'|'effects'>('text')

  useEffect(() => {
    const stored = localStorage.getItem('cliniverse-appearance')
    if (stored) { const p = JSON.parse(stored); setS(p); applySettings(p) }
  }, [])

  const update = (key: keyof Settings, val: string) => {
    const next = { ...s, [key]: val }
    setS(next)
    applySettings(next)
    if ('vibrate' in navigator) navigator.vibrate(6)
  }

  const save = () => {
    localStorage.setItem('cliniverse-appearance', JSON.stringify(s))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const reset = () => { setS(DEFAULT); applySettings(DEFAULT); localStorage.removeItem('cliniverse-appearance') }

  return (
    <div style={{ fontFamily:F, position:'relative' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        {onClose && (
          <button onClick={onClose} style={{ background:'var(--bg-card-2,rgba(255,255,255,0.07))', border:'1px solid var(--border-card,rgba(10,132,255,0.10))', borderRadius:12, padding:'9px 16px', color:'var(--text-secondary,rgba(242,248,252,0.72))', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:F }}>← Back</button>
        )}
        <div>
          <div style={{ fontSize:10, color:'rgba(0,200,184,0.85)', fontWeight:700, letterSpacing:1.5, marginBottom:3 }}>APPEARANCE</div>
          <div style={{ fontSize:19, fontWeight:900, color:'var(--text-primary, #F2F8FC)', letterSpacing:-0.4 }}>
            Customise <span style={{ color:'#00C8B8' }}>Display</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:5, background:'var(--bg-card,rgba(255,255,255,0.88))', borderRadius:16, padding:4, marginBottom:18, border:'1px solid var(--border-card,rgba(10,132,255,0.10))' }}>
        {([['text','Aa Text'],['cards','⬛ Cards'],['layout','📐 Layout'],['effects','✨ Effects']] as [string,string][]).map(([id,label])=>(
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

      {/* ── TEXT TAB ── */}
      {tab === 'text' && (
        <div style={{ animation:'slideIn 0.3s ease' }}>
          <SectionHeader title="FONT FAMILY" icon="🔤"/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
            {FONTS.map(f => (
              <div key={f.id} onClick={()=>update('font', f.id)} style={{
                background: s.font===f.id ? 'rgba(0,200,184,0.10)' : 'rgba(255,255,255,0.04)',
                border:`1.5px solid ${s.font===f.id ? '#00C8B840' : 'rgba(255,255,255,0.08)'}`,
                borderRadius:16, padding:'14px 12px', cursor:'pointer',
                position:'relative', overflow:'hidden', transition:'all 0.2s',
              }}>
                <div style={{ fontSize:26, fontWeight:900, color: s.font===f.id?'#00C8B8':'#F2F8FC', marginBottom:6, ...f.style }}>{f.sample}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary, #F2F8FC)', marginBottom:2 }}>{f.label}</div>
                <div style={{ fontSize:9, color:'var(--text-muted, rgba(242,248,252,0.45))' }}>{f.desc}</div>
                {s.font===f.id && <div style={{ position:'absolute', top:8, right:8, width:18, height:18, borderRadius:'50%', background:'#00C8B8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#000', fontWeight:900, animation:'checkIn 0.2s ease' }}>✓</div>}
              </div>
            ))}
          </div>

          <SectionHeader title="TEXT SIZE" icon="📏"/>
          <div style={{ display:'flex', gap:7, marginBottom:8 }}>
            {TEXT_SIZES.map(t => (
              <div key={t.id} onClick={()=>update('textSize', t.id)} style={{
                flex:1, background: s.textSize===t.id?'rgba(0,200,184,0.10)':'rgba(255,255,255,0.04)',
                border:`1.5px solid ${s.textSize===t.id?'#00C8B840':'rgba(255,255,255,0.08)'}`,
                borderRadius:14, padding:'12px 4px', cursor:'pointer', textAlign:'center', transition:'all 0.2s',
              }}>
                <div style={{ fontSize:10+t.scale*6, fontWeight:800, color:s.textSize===t.id?'#00C8B8':'#F2F8FC', marginBottom:4 }}>Aa</div>
                <div style={{ fontSize:8, color:'var(--text-muted, rgba(242,248,252,0.45))', fontWeight:600 }}>{t.label}</div>
              </div>
            ))}
          </div>

          {/* Live preview */}
          <div style={{ background:'var(--bg-card,rgba(255,255,255,0.88))', border:'1px solid var(--border-card,rgba(10,132,255,0.10))', borderRadius:16, padding:'14px', marginTop:12 }}>
            <div style={{ fontSize:9, color:'var(--text-muted, rgba(242,248,252,0.40))', fontWeight:700, letterSpacing:1, marginBottom:8 }}>PREVIEW</div>
            <div style={{ ...FONTS.find(f=>f.id===s.font)?.style, fontSize:14*( TEXT_SIZES.find(t=>t.id===s.textSize)?.scale||1), fontWeight:800, color:'var(--text-primary, #F2F8FC)', marginBottom:4 }}>Clinical Excellence</div>
            <div style={{ ...FONTS.find(f=>f.id===s.font)?.style, fontSize:12*(TEXT_SIZES.find(t=>t.id===s.textSize)?.scale||1), color:'var(--text-secondary, rgba(242,248,252,0.60))' }}>Medical Intelligence Platform · 2026</div>
          </div>
        </div>
      )}

      {/* ── CARDS TAB ── */}
      {tab === 'cards' && (
        <div style={{ animation:'slideIn 0.3s ease' }}>
          <SectionHeader title="CARD STYLE" icon="🃏"/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            {CARD_STYLES.map(c => (
              <div key={c.id} onClick={()=>update('card', c.id)} style={{
                background: s.card===c.id?'rgba(0,200,184,0.08)':'rgba(255,255,255,0.03)',
                border:`1.5px solid ${s.card===c.id?'#00C8B840':'rgba(255,255,255,0.08)'}`,
                borderRadius:18, padding:'14px', cursor:'pointer', transition:'all 0.2s',
                position:'relative', overflow:'hidden',
              }}>
                {/* Card preview */}
                <div style={{ ...c.preview, padding:'10px', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:24, height:24, borderRadius:8, background:'rgba(0,200,184,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>🫀</div>
                  <div>
                    <div style={{ width:40, height:4, borderRadius:2, background:'rgba(242,248,252,0.40)', marginBottom:3 }}/>
                    <div style={{ width:28, height:3, borderRadius:2, background:'rgba(242,248,252,0.22)' }}/>
                  </div>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary, #F2F8FC)', marginBottom:2 }}>{c.icon} {c.label}</div>
                <div style={{ fontSize:9, color:'var(--text-muted, rgba(242,248,252,0.45))' }}>{c.desc}</div>
                {s.card===c.id && <div style={{ position:'absolute', top:8, right:8, width:18, height:18, borderRadius:'50%', background:'#00C8B8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#000', fontWeight:900, animation:'checkIn 0.2s ease' }}>✓</div>}
              </div>
            ))}
          </div>

          <SectionHeader title="CORNER RADIUS" icon="⬛"/>
          <div style={{ display:'flex', gap:7 }}>
            {RADIUS_OPTIONS.map(r => (
              <div key={r.id} onClick={()=>update('radius', r.id)} style={{
                flex:1, background: s.radius===r.id?'rgba(0,200,184,0.10)':'rgba(255,255,255,0.04)',
                border:`1.5px solid ${s.radius===r.id?'#00C8B840':'rgba(255,255,255,0.08)'}`,
                borderRadius:14, padding:'12px 6px', cursor:'pointer', textAlign:'center', transition:'all 0.2s',
              }}>
                <div style={{ width:28, height:20, borderRadius:r.radius>20?10:r.radius/2, background:s.radius===r.id?'#00C8B8':'rgba(242,248,252,0.25)', margin:'0 auto 6px' }}/>
                <div style={{ fontSize:8, color:s.radius===r.id?'#00C8B8':'rgba(242,248,252,0.45)', fontWeight:700 }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LAYOUT TAB ── */}
      {tab === 'layout' && (
        <div style={{ animation:'slideIn 0.3s ease' }}>
          <SectionHeader title="CONTENT DENSITY" icon="📐"/>
          {DENSITIES.map(d => (
            <OptionRow key={d.id} label={d.label} desc={d.desc} selected={s.density===d.id} onSelect={()=>update('density', d.id)}/>
          ))}

          <SectionHeader title="NAV BAR ICONS" icon="🧭"/>
          <div style={{ display:'flex', gap:8 }}>
            {NAV_STYLES.map(n => (
              <div key={n.id} onClick={()=>update('nav', n.id)} style={{
                flex:1, background: s.nav===n.id?'rgba(0,200,184,0.10)':'rgba(255,255,255,0.04)',
                border:`1.5px solid ${s.nav===n.id?'#00C8B840':'rgba(255,255,255,0.08)'}`,
                borderRadius:14, padding:'12px 6px', cursor:'pointer', textAlign:'center', transition:'all 0.2s',
              }}>
                <div style={{ fontSize:24, marginBottom:5 }}>{n.icon}</div>
                <div style={{ fontSize:10, fontWeight:700, color:s.nav===n.id?'#00C8B8':'#F2F8FC', marginBottom:2 }}>{n.label}</div>
                <div style={{ fontSize:8, color:'var(--text-muted, rgba(242,248,252,0.40))' }}>{n.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EFFECTS TAB ── */}
      {tab === 'effects' && (
        <div style={{ animation:'slideIn 0.3s ease' }}>
          <SectionHeader title="MOTION & ANIMATION" icon="✨"/>
          {MOTION_OPTIONS.map(m => (
            <OptionRow key={m.id} label={`${m.icon} ${m.label}`} desc={m.desc} selected={s.motion===m.id} onSelect={()=>update('motion', m.id)}/>
          ))}

          <div style={{ background:'rgba(255,149,10,0.08)', border:'1px solid rgba(255,149,10,0.20)', borderRadius:14, padding:'12px 14px', marginTop:8 }}>
            <div style={{ fontSize:11, color:'rgba(255,149,10,0.90)', fontWeight:700, marginBottom:4 }}>♿ Accessibility</div>
            <div style={{ fontSize:11, color:'var(--text-secondary, rgba(242,248,252,0.55))', lineHeight:1.6 }}>
              "No Motion" recommended for users with vestibular disorders. App also respects iPhone's Reduce Motion setting.
            </div>
          </div>

          <SectionHeader title="BLUR & GLASS EFFECTS" icon="🪟"/>
          {[
            {id:'high',   label:'High Blur',   desc:'Maximum glass effect · GPU intensive'},
            {id:'medium', label:'Medium Blur',  desc:'Balanced · Recommended'},
            {id:'low',    label:'Low Blur',     desc:'Performance mode · Battery saving'},
            {id:'off',    label:'No Blur',      desc:'Solid colours · Maximum performance'},
          ].map(b => (
            <OptionRow key={b.id} label={b.label} desc={b.desc} selected={false} onSelect={()=>{}} accent="#BF5AF2"/>
          ))}
        </div>
      )}

      {/* ── ACTION BUTTONS ── */}
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
          {saved ? '✓ Saved!' : '💾 Save Settings'}
        </button>
      </div>

      <div style={{ marginTop:12, textAlign:'center', fontSize:10, color:'rgba(242,248,252,0.28)' }}>
        🍎 Settings sync with iPhone appearance automatically
      </div>

      <style>{CSS}</style>
    </div>
  )
}
