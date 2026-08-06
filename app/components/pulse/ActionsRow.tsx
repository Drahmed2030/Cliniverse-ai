'use client'
import { L } from '../../lib/tokens'
import { Card } from '../ui/Card'

interface Action {
  icon: string
  label: string
  sub: string
  color: string
  tags: string[]
  onClick: () => void
}

interface Props {
  onScribe: () => void
  onCase: () => void
  onTools: () => void
}

export function ActionsRow({ onScribe, onCase, onTools }: Props) {
  const actions: Action[] = [
    {
      icon:'🎙️', label:'AI Scribe', sub:'Record → SOAP · EN+AR',
      color:L.teal, tags:['2h saved','Arabic'],
      onClick: onScribe,
    },
    {
      icon:'📋', label:"Today's Case", sub:'AI simulation · +30 XP',
      color:'#DC2626', tags:['Interactive','Evidence'],
      onClick: onCase,
    },
    {
      icon:'🔬', label:'Quick Tools', sub:'FDA · PubMed · ESC 2026',
      color:'#7C3AED', tags:['Calculators','Drug search'],
      onClick: onTools,
    },
  ]

  return (
    <div style={{marginBottom:16}}>
      <div style={{
        fontSize:10,fontWeight:700,letterSpacing:2,
        color:L.textMuted,marginBottom:10,
        textTransform:'uppercase',
      }}>⚡ Quick Actions</div>

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {actions.map((a,i) => (
          <div key={i} onClick={a.onClick} style={{
            background:L.surface,
            border:`1px solid ${L.border}`,
            borderRadius:20,
            padding:'14px 16px',
            cursor:'pointer',
            display:'flex',alignItems:'center',gap:14,
            boxShadow:L.shadowSm,
            transition:'all 0.2s ease',
            borderLeft:`3px solid ${a.color}`,
          }}
          onTouchStart={e=>(e.currentTarget.style.transform='scale(0.98)')}
          onTouchEnd={e=>(e.currentTarget.style.transform='scale(1)')}
          >
            {/* Icon */}
            <div style={{
              width:48,height:48,borderRadius:16,flexShrink:0,
              background:`${a.color}10`,
              border:`1px solid ${a.color}20`,
              display:'flex',alignItems:'center',
              justifyContent:'center',fontSize:24,
            }}>{a.icon}</div>

            {/* Text */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{
                fontSize:15,fontWeight:700,
                color:L.text,marginBottom:2,
              }}>{a.label}</div>
              <div style={{
                fontSize:12,color:L.textSub,marginBottom:6,
              }}>{a.sub}</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {a.tags.map(tag=>(
                  <span key={tag} style={{
                    fontSize:9,fontWeight:700,
                    background:`${a.color}10`,
                    border:`1px solid ${a.color}20`,
                    color:a.color,
                    borderRadius:8,padding:'2px 8px',
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              width:28,height:28,borderRadius:8,flexShrink:0,
              background:L.raised,border:`1px solid ${L.border}`,
              display:'flex',alignItems:'center',
              justifyContent:'center',
              color:L.textMuted,fontSize:14,
            }}>›</div>
          </div>
        ))}
      </div>
    </div>
  )
}
