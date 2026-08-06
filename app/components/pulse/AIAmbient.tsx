'use client'
import { useState } from 'react'
import { L } from '../../lib/tokens'

interface Props {
  onAsk: (q: string) => void
}

const SUGGESTIONS = [
  'What is the STEMI protocol?',
  'Sepsis bundle checklist',
  'Drug dose calculator',
]

export function AIAmbient({ onAsk }: Props) {
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)

  return (
    <div style={{
      background:'rgba(255,255,255,0.72)',
      backdropFilter:'blur(24px) saturate(180%)',
      WebkitBackdropFilter:'blur(24px) saturate(180%)',
      border:`1px solid ${L.border}`,
      borderRadius:20,
      padding:'12px 14px',
      marginBottom:14,
      boxShadow:L.shadowSm,
    }}>
      {/* Header */}
      <div style={{
        display:'flex',alignItems:'center',
        gap:8,marginBottom:10,
      }}>
        <div style={{
          width:28,height:28,borderRadius:8,
          background:L.gradPrimary,
          display:'flex',alignItems:'center',
          justifyContent:'center',fontSize:14,
        }}>🤖</div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:L.text}}>AI Clinical Assistant</div>
          <div style={{fontSize:10,color:L.textMuted}}>Powered by Claude · Evidence-based</div>
        </div>
        <div style={{
          marginLeft:'auto',
          background:`${L.teal}15`,
          border:`1px solid ${L.tealBd}`,
          borderRadius:20,padding:'3px 10px',
          fontSize:9,fontWeight:700,color:L.teal,
        }}>● LIVE</div>
      </div>

      {/* Input */}
      <div style={{
        display:'flex',gap:8,alignItems:'center',
        background:L.raised,
        border:`1px solid ${focused ? L.teal : L.border}`,
        borderRadius:14,padding:'10px 14px',
        transition:'border 0.2s',
        marginBottom: focused ? 10 : 0,
      }}>
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setTimeout(()=>setFocused(false),200)}
          onKeyDown={e=>e.key==='Enter'&&q.trim()&&onAsk(q)}
          placeholder="Ask a clinical question..."
          style={{
            flex:1,border:'none',background:'transparent',
            fontSize:13,color:L.text,outline:'none',
            fontFamily:L.font,
          }}
        />
        {q.trim() && (
          <button onClick={()=>onAsk(q)} style={{
            width:28,height:28,borderRadius:8,border:'none',
            background:L.gradPrimary,
            color:'white',fontSize:14,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>→</button>
        )}
      </div>

      {/* Suggestions */}
      {focused && (
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {SUGGESTIONS.map(s=>(
            <button key={s} onClick={()=>onAsk(s)} style={{
              background:L.surface,
              border:`1px solid ${L.border}`,
              borderRadius:10,padding:'8px 12px',
              fontSize:12,color:L.textSub,
              cursor:'pointer',textAlign:'left',
              fontFamily:L.font,fontWeight:500,
            }}>{s}</button>
          ))}
        </div>
      )}
    </div>
  )
}
