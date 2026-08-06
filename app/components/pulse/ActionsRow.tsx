'use client'
import { L } from '../../lib/tokens'

// SVG Icons 2026 — Lucide style + Gradient
const MicIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="micGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0D9488"/>
        <stop offset="100%" stopColor="#0891B2"/>
      </linearGradient>
    </defs>
    <rect x="9" y="2" width="6" height="11" rx="3" fill="url(#micGrad)"/>
    <path d="M5 10a7 7 0 0 0 14 0" stroke="url(#micGrad)" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="19" x2="12" y2="22" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
    <line x1="9" y1="22" x2="15" y2="22" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const CaseIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="cG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DC2626"/>
        <stop offset="100%" stopColor="#EA580C"/>
      </linearGradient>
    </defs>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="url(#cG)" strokeWidth="1.8" strokeLinecap="round"/>
    <rect x="9" y="3" width="6" height="4" rx="1.5" fill="url(#cG)" opacity="0.3" stroke="url(#cG)" strokeWidth="1.5"/>
    <line x1="9" y1="12" x2="15" y2="12" stroke="url(#cG)" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="9" y1="15" x2="13" y2="15" stroke="url(#cG)" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const ToolsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="tG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED"/>
        <stop offset="100%" stopColor="#4F46E5"/>
      </linearGradient>
    </defs>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      stroke="url(#tG)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

interface Action {
  IconEl: React.FC
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
      IconEl: MicIcon,
      label:'AI Scribe', sub:'Record → SOAP · EN+AR',
      color:'#0D9488', tags:['2h saved','Arabic'],
      onClick: onScribe,
    },
    {
      IconEl: CaseIcon,
      label:"Today's Case", sub:'AI simulation · +30 XP',
      color:'#DC2626', tags:['Interactive','Evidence'],
      onClick: onCase,
    },
    {
      IconEl: ToolsIcon,
      label:'Quick Tools', sub:'FDA · PubMed · ESC 2026',
      color:'#7C3AED', tags:['Calculators','Drug search'],
      onClick: onTools,
    },
  ]

  return (
    <div style={{marginBottom:16}}>
      <div style={{
        fontSize:10, fontWeight:700, letterSpacing:2,
        color:'#94A3B8', marginBottom:10,
        textTransform:'uppercase',
      }}>⚡ Quick Actions</div>

      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {actions.map((a,i) => (
          <div key={i} onClick={a.onClick} style={{
            background:'#FFFFFF',
            border:`1px solid #E2E8F0`,
            borderLeft:`3px solid ${a.color}`,
            borderRadius:20,
            padding:'14px 16px',
            cursor:'pointer',
            display:'flex', alignItems:'center', gap:14,
            boxShadow:'0 1px 3px rgba(15,23,42,0.08)',
            transition:'all 0.2s ease',
          }}
          onTouchStart={e=>(e.currentTarget.style.transform='scale(0.98)')}
          onTouchEnd={e=>(e.currentTarget.style.transform='scale(1)')}
          >
            {/* SVG Icon */}
            <div style={{
              width:52, height:52, borderRadius:16, flexShrink:0,
              background:`${a.color}10`,
              border:`1px solid ${a.color}20`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <a.IconEl/>
            </div>

            {/* Text */}
            <div style={{flex:1, minWidth:0}}>
              <div style={{
                fontSize:15, fontWeight:700,
                color:'#0F172A', marginBottom:2,
              }}>{a.label}</div>
              <div style={{
                fontSize:12, color:'#475569', marginBottom:6,
              }}>{a.sub}</div>
              <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
                {a.tags.map(tag=>(
                  <span key={tag} style={{
                    fontSize:9, fontWeight:700,
                    background:`${a.color}10`,
                    border:`1px solid ${a.color}25`,
                    color:a.color,
                    borderRadius:8, padding:'2px 8px',
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              width:28, height:28, borderRadius:8, flexShrink:0,
              background:'#F1F5F9', border:'1px solid #E2E8F0',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#94A3B8', fontSize:16,
            }}>›</div>
          </div>
        ))}
      </div>
    </div>
  )
}
