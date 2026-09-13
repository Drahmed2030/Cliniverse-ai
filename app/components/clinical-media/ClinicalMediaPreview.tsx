'use client'

import type { EchoAssessmentResponse } from '../../lib/competency/echoAssessmentContract'
import { Player, type PlayerRef } from '@remotion/player'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import {
  CLINICAL_MEDIA_FORMATS,
  compileClinicalMediaPreview,
  type ClinicalMediaFormat,
  type ClinicalMediaProgram,
} from '../../lib/clinicalMedia/clinicalMediaCompiler'
import { ECHO_A4C_PREVIEW_STUDY } from '../../lib/clinicalMedia/echoPreviewStudy'
import { createEchoStudyCompetencyState, recordEchoClipCompetency } from '../../lib/competency/echoStudyCompetencyState'
import { createEchoStudySession } from '../../lib/competency/echoStudySessionController'
import { buildEchoStudySummary } from '../../lib/competency/echoStudySummary'
import DoorToEcgMediaComposition from './DoorToEcgMediaComposition'
import EchoA4cLesson from './EchoA4cLesson'
import EchoA4cMediaComposition from './EchoA4cMediaComposition'
import EchoStudyNavigation from './EchoStudyNavigation'
import EchoStudySummaryPanel from './EchoStudySummaryPanel'
import EchoPlaybackControls from './EchoPlaybackControls'
import { studioPlayerCapabilities } from '../../lib/clinicalMedia/studioPlayerCapabilities'
import { LOCAL_DCM_REVIEW } from '../../lib/clinicalMedia/localDcmReview'
import styles from './clinical-media.module.css'

const FORMAT_ORDER: ClinicalMediaFormat[] = ['landscape', 'portrait', 'square']
const PROGRAM_ORDER = ['echo-a4c-normal', 'door-to-ecg'] as const satisfies readonly ClinicalMediaProgram[]
const RESPONSIVE_PLAYER_STYLE = { width: '100%' } satisfies CSSProperties
const PLAYER_VIEWPORT_CLASS = {
  landscape: styles.landscapePlayerViewport,
  portrait: styles.portraitPlayerViewport,
  square: styles.squarePlayerViewport,
} as const satisfies Record<ClinicalMediaFormat, string>

const PROGRAM_COPY = {
  'echo-a4c-normal': {
    label: 'ECHO · Real A4C',
    title: 'Clinical Studio · licensed real ECHO cine',
    body: 'A source-labelled normal A4C cine with governed study navigation, competency feedback and session-safe learning evidence.',
    status: {
      summary: 'Licensed cine · rights verified',
      detail: 'The English lesson copy and answer key remain Preview-only until clinical approval. No learner or Production release is enabled.',
    },
  },
  'door-to-ecg': {
    label: 'ECG · Current prototype',
    title: 'Clinical Studio · ECG learning engine',
    body: 'A governed synthetic signal proves the current interaction while calibrated PhysioNet cases remain the next independent ingestion tranche.',
    status: {
      summary: 'Synthetic signal · controlled prototype',
      detail: 'No real ECG record has been ingested yet. The signal contract remains separate from ECHO cine and cannot be presented as a clinical tracing.',
    },
  },
} as const satisfies Record<typeof PROGRAM_ORDER[number], {
  label: string
  title: string
  body: string
  status: { summary: string; detail: string }
}>

const CONTROL_COPY = { program:'Program', ratio:'Export format', reduced:'Reduced Motion active' } as const

function subscribeToReducedMotion(onStoreChange:()=>void){const query=window.matchMedia('(prefers-reduced-motion: reduce)');query.addEventListener('change',onStoreChange);return()=>query.removeEventListener('change',onStoreChange)}
function readReducedMotionPreference(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function readServerReducedMotionPreference(){return false}

export default function ClinicalMediaPreview({ echoOnly = false, onAssessment }: {
  echoOnly?: boolean
  onAssessment?: (responses: EchoAssessmentResponse[]) => void
} = {}) {
  const playerRef=useRef<PlayerRef>(null)
  const [expandedCine,setExpandedCine]=useState(false)
  const [loopPlayback,setLoopPlayback]=useState(false)
  const [dcmReview,setDcmReview]=useState(false)
  const [dcmStatus,setDcmStatus]=useState<'checking'|'ready'|'hold'>('checking')
  useEffect(()=>{
    if (!dcmReview) return
    let active=true
    fetch(LOCAL_DCM_REVIEW.mediaUrl,{method:'HEAD',cache:'no-store'}).then(response=>{if(active)setDcmStatus(response.ok?'ready':'hold')}).catch(()=>{if(active)setDcmStatus('hold')})
    return ()=>{active=false}
  },[dcmReview])
  const [program,setProgram]=useState<typeof PROGRAM_ORDER[number]>('echo-a4c-normal')
  const [format,setFormat]=useState<ClinicalMediaFormat>('landscape')
  const [echoSession,setEchoSession]=useState(()=>createEchoStudySession(ECHO_A4C_PREVIEW_STUDY))
  const [echoCompetency,setEchoCompetency]=useState(()=>createEchoStudyCompetencyState(ECHO_A4C_PREVIEW_STUDY))
  const reducedMotion=useSyncExternalStore(subscribeToReducedMotion,readReducedMotionPreference,readServerReducedMotionPreference)
  const media=useMemo(()=>compileClinicalMediaPreview('en',format,program),[format,program])
  const echoSummary=useMemo(()=>buildEchoStudySummary({study:ECHO_A4C_PREVIEW_STUDY,session:echoSession,competency:echoCompetency}),[echoSession,echoCompetency])
  const capabilities=studioPlayerCapabilities(dcmReview?'echo-review':program==='echo-a4c-normal'?'echo-preview':'ecg-preview')
  const frameCount=dcmReview?44:media.durationInFrames
  const playerKey=`${media.compilationId}-${dcmReview}`
  const copy=dcmReview?{title:'DCM candidate · local review only',body:'Not learner-ready · clinical review pending · privacy review pending. Assessments, scoring, persistence and progression disabled.',status:{summary:'Local review only · not learner-ready',detail:'Clinical review pending · privacy review pending. No numerical EF claims. CardioNetworks ECHOpedia / AMC Echolab · CC BY-SA 3.0. Re-encoded with one-pixel right padding; no crop or interpolation.'}}:PROGRAM_COPY[program]
  const Composition=program==='echo-a4c-normal'?EchoA4cMediaComposition:DoorToEcgMediaComposition
  const playerViewportClass=`${styles.playerViewport} ${PLAYER_VIEWPORT_CLASS[format]}`

  return <section className={styles.previewShell} aria-labelledby="clinical-media-preview-title" data-testid="clinical-media-preview" dir="ltr">
    <div className={styles.previewHeader}><div><h2 id="clinical-media-preview-title">{copy.title}</h2><p>{copy.body}</p></div><div className={styles.previewControls}>
      {!echoOnly&&process.env.NODE_ENV==='development'?<button type="button" className={styles.controlButton} aria-pressed={dcmReview} onClick={()=>{setDcmStatus('checking');setLoopPlayback(!dcmReview);setDcmReview(!dcmReview);setProgram('echo-a4c-normal')}}>DCM candidate · local review only</button>:null}
      <div className={styles.controlSet}><span className={styles.controlLabel}>{CONTROL_COPY.program}</span><div aria-label={CONTROL_COPY.program} className={`${styles.controlGroup} ${styles.programControl}`} role="group">{(echoOnly ? ['echo-a4c-normal'] as const : PROGRAM_ORDER).map(option=><button disabled={dcmReview} aria-pressed={program===option} className={`${styles.controlButton} ${program===option?styles.activeControl:''}`} key={option} onClick={()=>{setProgram(option);setLoopPlayback(false);setExpandedCine(false)}} type="button">{PROGRAM_COPY[option].label}</button>)}</div></div>
      <div className={styles.controlSet}><span className={styles.controlLabel}>{CONTROL_COPY.ratio}</span><div aria-label={CONTROL_COPY.ratio} className={`${styles.controlGroup} ${styles.formatControl}`} role="group">{FORMAT_ORDER.map(option=><button aria-pressed={format===option} className={`${styles.controlButton} ${format===option?styles.activeControl:''}`} key={option} onClick={()=>setFormat(option)} type="button">{CLINICAL_MEDIA_FORMATS[option].label}</button>)}</div></div>
    </div></div>

    <details className={styles.previewStatus} data-testid="clinical-media-status"><summary><span aria-hidden="true"/><strong>{copy.status.summary}</strong><small>Preview status</small></summary><p>{copy.status.detail}</p></details>

    {capabilities.studyNavigation&&!dcmReview&&program==='echo-a4c-normal'?<EchoStudyNavigation study={ECHO_A4C_PREVIEW_STUDY} session={echoSession} competency={echoCompetency} onSessionChange={setEchoSession}/>:null}

    {dcmReview&&dcmStatus!=='ready'?<p role="status">{dcmStatus==='checking'?'Checking local derivative checksum…':'HOLD: derivative unavailable or checksum mismatch. No playback enabled.'}</p>:<div className={styles.playerStage} data-testid="clinical-media-stage"><div className={playerViewportClass} data-export-format={format} data-testid="clinical-media-player-viewport"><Player ref={playerRef} autoPlay={false} className={styles.player} clickToPlay component={Composition} compositionHeight={expandedCine&&capabilities.cine?480:media.height} compositionWidth={expandedCine&&capabilities.cine?(dcmReview?648:624):media.width} controls durationInFrames={dcmReview?44:media.durationInFrames} fps={dcmReview?51:media.fps} inputProps={{locale:'en' as const,format,reducedMotion,localDcmReview:dcmReview,expandedCine:expandedCine&&capabilities.cine}} key={playerKey} loop={loopPlayback} showVolumeControls={false} spaceKeyToPlayOrPause style={RESPONSIVE_PLAYER_STYLE}/></div></div>}

    {capabilities.frameNavigation&&(!dcmReview||dcmStatus==='ready')?<EchoPlaybackControls key={playerKey} playerRef={playerRef} frameCount={frameCount} cineReview={dcmReview} loop={loopPlayback} onLoopChange={setLoopPlayback} expanded={expandedCine} onExpandedChange={setExpandedCine}/>:null}

    <div className={styles.previewFooter}><span><strong>Device-fit preview</strong>{reducedMotion?` · ${CONTROL_COPY.reduced}`:''}</span><span>{dcmReview?'DCM · 648×480 · 44 frames · 51 fps · local review only':`Export ${media.durationInFrames/media.fps}s · ${media.width}×${media.height} · ${media.compilationId}`}</span></div>

    {capabilities.assessment&&!dcmReview&&program==='echo-a4c-normal'?<>
      <EchoA4cLesson onAssessment={onAssessment} reducedMotion={reducedMotion} onCompetencySignal={({mastery,taskId,observedAt})=>setEchoCompetency(current=>recordEchoClipCompetency({state:current,study:ECHO_A4C_PREVIEW_STUDY,clipId:echoSession.activeClipId,mastery,taskId,updatedAt:observedAt}))}/>
      <EchoStudySummaryPanel summary={echoSummary} recommendation={null}/>
    </>:null}
  </section>
}
