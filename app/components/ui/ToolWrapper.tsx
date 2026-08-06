'use client'
import { L } from '../../lib/tokens'

interface Props {
  title: string
  sub?: string
  icon: string
  color: string
  heroImg?: string
  onBack: () => void
  children: React.ReactNode
}

export function ToolWrapper({ title, sub, icon, color, heroImg, onBack, children }: Props) {
  return (
    <div style={{ minHeight:'100vh', background:L.canvas, fontFamily:L.font }}>

      {/* Hero */}
      <div style={{
        height: heroImg ? 140 : 'auto',
        backgroundImage: heroImg ? `url(${heroImg})` : 'none',
        backgroundSize:'cover', backgroundPosition:'center',
        position:'relative',
        background: heroImg ? undefined : L.surface,
        borderBottom:`1px solid ${L.border}`,
      }}>
        {heroImg && (
          <div style={{
            position:'absolute', inset:0,
            background:`linear-gradient(180deg,rgba(248,250,252,0.15) 0%,rgba(248,250,252,0.97) 100%)`,
          }}/>
        )}

        <div style={{ position: heroImg ? 'absolute' : 'relative', inset:0, padding:'16px 16px 0' }}>
          <button onClick={onBack} style={{
            background:'rgba(255,255,255,0.90)',
            backdropFilter:'blur(12px)',
            border:`1px solid ${L.border}`,
            borderRadius:20, padding:'8px 16px',
            fontSize:13, fontWeight:700, color:L.text, cursor:'pointer',
            boxShadow:L.shadowSm,
          }}>← Back</button>
        </div>

        {heroImg && (
          <div style={{ position:'absolute', bottom:14, left:16 }}>
            <div style={{ fontSize:10, color, fontWeight:700, letterSpacing:2, marginBottom:2 }}>
              {icon} {title.toUpperCase()}
            </div>
            <div style={{ fontSize:11, color:L.textSub }}>{sub}</div>
          </div>
        )}

        {!heroImg && (
          <div style={{ padding:'12px 16px 16px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:44, height:44, borderRadius:14, flexShrink:0,
              background:`${color}12`, border:`1px solid ${color}20`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
            }}>{icon}</div>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:L.text }}>{title}</div>
              {sub && <div style={{ fontSize:12, color:L.textSub }}>{sub}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding:'16px 16px 160px' }}>
        {children}
      </div>
    </div>
  )
}
