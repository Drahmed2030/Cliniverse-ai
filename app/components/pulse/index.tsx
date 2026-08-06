'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { L } from '../../lib/tokens'
import { TodayCard } from './TodayCard'
import { ActionsRow } from './ActionsRow'
import { AIAmbient } from './AIAmbient'
import { Sheet } from '../ui/Sheet'

const AmbientScribe  = dynamic(() => import('../AmbientScribe'),  { ssr:false })
const LiveCaseViewer = dynamic(() => import('../LiveCaseViewer'), { ssr:false })

interface Props {
  xp:number; streak:number; casesCompleted:number; mcqCorrect:number
  isPro:boolean; criticalCases:any[]; sportsCases:any[]; pedsCases:any[]
  setActiveCase:(id:string)=>void; setShowUpgrade:(v:boolean)=>void
  setTab:(t:string)=>void; setToolTab:(t:string)=>void; onXP:(n:number)=>void
}

export default function PulseIndex(props:Props) {
  const { xp, streak, casesCompleted, mcqCorrect, isPro,
    criticalCases, sportsCases, pedsCases,
    setActiveCase, setShowUpgrade, setTab, setToolTab, onXP } = props

  const [showScribe, setShowScribe] = useState(false)
  const [showCase,   setShowCase]   = useState(false)
  const [aiAnswer,   setAiAnswer]   = useState('')

  const handleAI = async (q:string) => {
    setAiAnswer('Thinking...')
    try {
      const res = await fetch('/api/generate-case', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userPrompt:q, systemPrompt:'You are a senior clinical consultant. Answer in 3-4 sentences, evidence-based.' })
      })
      const data = await res.json()
      setAiAnswer(data.content?.[0]?.text || 'Unable to get response.')
    } catch { setAiAnswer('Connection error.') }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:L.font }}>
      <div style={{ padding:'16px 16px 160px', maxWidth:560, margin:'0 auto' }}>

        {/* Disclaimer */}
        <div style={{
          background:'rgba(252,211,77,0.12)',
          border:'1px solid rgba(252,211,77,0.25)',
          borderRadius:12, padding:'8px 12px',
          marginBottom:12, display:'flex', gap:8, alignItems:'center',
        }}>
          <span>⚠️</span>
          <p style={{ margin:0, fontSize:11, color:'#92400E', lineHeight:1.5 }}>
            <b>Educational use only.</b> AI-generated simulations. Not a substitute for clinical judgment.
          </p>
        </div>

        {/* Today Card */}
        <TodayCard xp={xp} streak={streak} isPro={isPro}/>

        {/* AI Ambient */}
        <AIAmbient onAsk={handleAI}/>

        {/* AI Answer */}
        {aiAnswer && (
          <div style={{
            background:'#FFFFFF', border:`1px solid ${L.tealBd}`,
            borderRadius:16, padding:'14px 16px', marginBottom:14,
            boxShadow:L.shadowSm,
          }}>
            <div style={{ fontSize:10, color:L.teal, fontWeight:700, marginBottom:6 }}>🤖 AI RESPONSE</div>
            <div style={{ fontSize:13, color:L.text, lineHeight:1.7 }}>{aiAnswer}</div>
          </div>
        )}

        {/* Actions */}
        <ActionsRow
          onScribe={()=>setShowScribe(true)}
          onCase={()=>setShowCase(true)}
          onTools={()=>setTab('tools')}
        />

        {/* Global Room */}
        <div onClick={()=>setShowNexus(true)} style={{
          backgroundImage:'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80)',
          backgroundSize:'cover',backgroundPosition:'center',
          borderRadius:24,overflow:'hidden',marginBottom:16,cursor:'pointer',
          boxShadow:'0 4px 20px rgba(124,58,237,0.20)',
          position:'relative',height:140,
        }}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(160deg,rgba(124,58,237,0.70),rgba(15,23,42,0.85))'}}/>
          <div style={{position:'absolute',inset:0,padding:'16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#EF4444'}}/>
              <span style={{fontSize:10,color:'#FCA5A5',fontWeight:700,letterSpacing:1}}>LIVE WORLDWIDE</span>
            </div>
            <div style={{fontSize:11,color:'#A78BFA',fontWeight:700,letterSpacing:2,marginBottom:4}}>🌐 CLINICAL NEXUS</div>
            <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:-0.5,lineHeight:1.1}}>The Global<br/>Medical Room</div>
            <div style={{position:'absolute',bottom:16,right:16,
              background:'rgba(255,255,255,0.20)',backdropFilter:'blur(8px)',
              border:'1px solid rgba(255,255,255,0.30)',
              borderRadius:20,padding:'6px 14px',
              fontSize:12,fontWeight:700,color:'white',
            }}>Enter →</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:L.textMuted, marginBottom:10, textTransform:'uppercase' }}>
            📊 Clinical Dashboard
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[
              { icon:'🏥', label:'Cases Done',  value:casesCompleted, color:'#DC2626' },
              { icon:'🧬', label:'MCQ Correct', value:mcqCorrect,     color:'#1E40AF' },
              { icon:'🔥', label:'Day Streak',  value:streak,         color:'#D97706' },
            ].map(s=>(
              <div key={s.label} style={{
                background:'#FFFFFF', border:`1px solid ${L.border}`,
                borderRadius:18, padding:'16px 10px', textAlign:'center',
                boxShadow:L.shadowSm,
              }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:10, color:L.textMuted, marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      {/* Sheets */}
      <Sheet open={showScribe} onClose={()=>setShowScribe(false)} title="AI Scribe" size="lg">
        <AmbientScribe onXP={onXP}/>
      </Sheet>
      <Sheet open={showCase} onClose={()=>setShowCase(false)} title="Today's Case" size="lg">
        <LiveCaseViewer specialty="Emergency Medicine" difficulty="Intermediate" onXP={onXP}/>
      </Sheet>

      <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  )
}
