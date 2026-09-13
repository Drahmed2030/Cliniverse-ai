'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { EchoStudy } from '../../lib/clinicalMedia/echoStudyContract'
import type { EchoStudyCompetencyState } from '../../lib/competency/echoStudyCompetencyState'
import { createEchoStudySession, navigateEchoStudySession, projectEchoStudySession, type EchoStudySessionState } from '../../lib/competency/echoStudySessionController'

interface EchoStudyNavigationProps {
  study: EchoStudy
  session?: EchoStudySessionState
  competency?: EchoStudyCompetencyState | null
  onSessionChange?: (session: EchoStudySessionState) => void
}

const shellStyle = { display:'grid', gap:12, margin:'14px 0 18px', padding:14, border:'1px solid rgba(148,163,184,.22)', borderRadius:16, background:'rgba(15,23,42,.72)' } as const
const rowStyle = { display:'grid', gridTemplateColumns:'minmax(92px,1fr) auto minmax(92px,1fr)', alignItems:'center', gap:10 } as const
const buttonStyle = { minHeight:42, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7, border:'1px solid rgba(148,163,184,.24)', borderRadius:11, background:'rgba(30,41,59,.88)', color:'#e5e7eb', fontWeight:750, cursor:'pointer' } as const

export default function EchoStudyNavigation({ study, session: controlledSession, competency = null, onSessionChange }: EchoStudyNavigationProps) {
  const [internalSession, setInternalSession] = useState(() => createEchoStudySession(study))
  const session = controlledSession ?? internalSession
  const projection = useMemo(() => projectEchoStudySession({ study, session, competency }), [study, session, competency])
  const activeClip = study.clips.find(clip => clip.clipId === projection.activeClipId)

  function move(direction: 'previous' | 'next') {
    const next = navigateEchoStudySession({ study, session, direction })
    if (controlledSession) onSessionChange?.(next)
    else setInternalSession(next)
  }

  return (
    <section aria-label="Echo study navigation" data-testid="echo-study-navigation" style={shellStyle}>
      <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'baseline', flexWrap:'wrap' }}>
        <div><div style={{ color:'#94a3b8', fontSize:11, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase' }}>Study navigation</div><strong style={{ color:'#f8fafc', fontSize:14 }}>{study.title}</strong></div>
        <span style={{ color:'#94a3b8', fontSize:12 }}>{activeClip?.view ?? 'Echo'} · {projection.position}/{projection.total}</span>
      </div>
      <div style={rowStyle}>
        <button aria-label="Previous Echo clip" disabled={!projection.previousClipId} onClick={() => move('previous')} style={{ ...buttonStyle, opacity:projection.previousClipId?1:.45, cursor:projection.previousClipId?'pointer':'default' }} type="button"><ChevronLeft aria-hidden="true" size={17}/> Previous</button>
        <div style={{ textAlign:'center', minWidth:0 }}><strong style={{ display:'block', color:'#f8fafc', fontSize:13, overflowWrap:'anywhere' }}>{activeClip?.label ?? projection.activeClipId}</strong><span style={{ color:'#94a3b8', fontSize:11 }}>Clip {projection.position} of {projection.total}</span></div>
        <button aria-label="Next Echo clip" disabled={!projection.nextClipId} onClick={() => move('next')} style={{ ...buttonStyle, opacity:projection.nextClipId?1:.45, cursor:projection.nextClipId?'pointer':'default' }} type="button">Next <ChevronRight aria-hidden="true" size={17}/></button>
      </div>
      <div style={{ display:'grid', gap:7 }}>
        <div aria-label={`Viewing progress ${projection.viewingProgressPercent}%`} style={{ height:6, overflow:'hidden', borderRadius:999, background:'rgba(71,85,105,.55)' }}><span style={{ width:`${projection.viewingProgressPercent}%`, height:'100%', display:'block', borderRadius:999, background:'linear-gradient(90deg,#3b82f6,#22d3ee)' }}/></div>
        <div style={{ display:'flex', justifyContent:'space-between', gap:12, color:'#94a3b8', fontSize:11, fontVariantNumeric:'tabular-nums' }}><span>Viewed position {projection.viewingProgressPercent}%</span><span>Competency coverage {projection.competencyCoveragePercent}%</span></div>
      </div>
      {projection.total===1?<p style={{ margin:0, color:'#94a3b8', fontSize:11, lineHeight:1.45 }}>This governed Preview currently contains one verified clip. The same control expands automatically when additional reviewed clips are added to the study manifest.</p>:null}
    </section>
  )
}
