'use client'

import { CheckCircle2, ExternalLink, RotateCcw, ShieldAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  createEchoA4cCompletionReceipt,
  ECHO_A4C_TRAINING_ACTIVITY,
  matchesEchoA4cAnswerKey,
  type EchoA4cAnswerId,
  type EchoA4cAnswers,
  type EchoA4cCompletionReceipt,
  type EchoA4cQuestionId,
} from '../../lib/codelab/echoA4cTrainingActivity'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../../lib/clinicalMedia/licensedEchoAsset'
import { submitEchoPreviewCompetency } from '../../lib/competency/echoPreviewCompetencySession'
import type { EchoSkillMastery } from '../../lib/competency/echoMasteryEngine'
import styles from './clinical-media.module.css'

interface EchoA4cLessonProps {
  reducedMotion: boolean
  onCompetencySignal?: (payload: { mastery: EchoSkillMastery; taskId: string; observedAt: string }) => void
}
interface EchoA4cQuestion { id: EchoA4cQuestionId; prompt: string; options: { id: EchoA4cAnswerId; label: string }[] }

const QUESTIONS: EchoA4cQuestion[] = [
  { id:'view-identity', prompt:'Which view signature is demonstrated in the cine?', options:[
    { id:'apical-four-chamber', label:'Apical four-chamber (A4C)' }, { id:'parasternal-long-axis', label:'Parasternal long-axis (PLAX)' }, { id:'subcostal-ivc', label:'Subcostal IVC view' },
  ]},
  { id:'visible-landmarks', prompt:'Which landmark set supports A4C recognition?', options:[
    { id:'four-chambers-av-valves-septa', label:'Four chambers, AV valve planes and septa' }, { id:'aortic-arch-only', label:'Aortic arch only' }, { id:'coronary-arteries-only', label:'Coronary arteries only' },
  ]},
  { id:'safe-conclusion', prompt:'What is the safe conclusion from this short learning loop?', options:[
    { id:'source-labeled-view-recognition-only', label:'Use the source-labelled normal cine for view recognition only' }, { id:'calculate-ejection-fraction', label:'Calculate ejection fraction from this loop' }, { id:'exclude-all-pathology', label:'Exclude all structural pathology' },
  ]},
]

const COMPETENCY_TASK_BY_QUESTION: Partial<Record<EchoA4cQuestionId, string>> = {
  'view-identity':'echo-a4c-view-identity-v1',
  'visible-landmarks':'echo-a4c-landmarks-v1',
}

export default function EchoA4cLesson({ reducedMotion, onCompetencySignal }: EchoA4cLessonProps) {
  const [answers,setAnswers]=useState<Partial<EchoA4cAnswers>>({})
  const [attempts,setAttempts]=useState(0)
  const [result,setResult]=useState<'idle'|'needs-review'|'passed'>('idle')
  const [receipt,setReceipt]=useState<EchoA4cCompletionReceipt|null>(null)
  const [confidence,setConfidence]=useState<1|2|3|4|5>(3)
  const [mastery,setMastery]=useState<EchoSkillMastery|null>(null)
  const [competencyStatus,setCompetencyStatus]=useState<'idle'|'ready'|'degraded'>('idle')
  const startedAtRef=useRef<number | null>(null)
  useEffect(() => { startedAtRef.current = Date.now() }, [])
  const isComplete=QUESTIONS.every(question=>answers[question.id])

  function chooseAnswer(questionId:EchoA4cQuestionId,answerId:EchoA4cAnswerId){if(receipt)return;setAnswers(current=>({...current,[questionId]:answerId}));setResult('idle')}

  async function updatePreviewCompetency(){
    const selected=answers['view-identity']; const taskId=COMPETENCY_TASK_BY_QUESTION['view-identity']; if(!selected||!taskId)return
    try{
      const observedAt=new Date().toISOString()
      const output=await submitEchoPreviewCompetency({userId:'preview-session',taskId,selectedOptionId:selected,confidence,responseTimeMs:Math.max(0,Date.now()-(startedAtRef.current ?? Date.now())),attemptedAt:observedAt})
      setMastery(output.mastery);setCompetencyStatus(output.persistenceState?'degraded':'ready')
      onCompetencySignal?.({ mastery:output.mastery, taskId, observedAt })
    }catch{setCompetencyStatus('degraded')}
  }

  async function checkAnswers(){
    const viewIdentity=answers['view-identity']; const visibleLandmarks=answers['visible-landmarks']; const safeConclusion=answers['safe-conclusion']; if(!viewIdentity||!visibleLandmarks||!safeConclusion)return
    const completeAnswers:EchoA4cAnswers={'view-identity':viewIdentity,'visible-landmarks':visibleLandmarks,'safe-conclusion':safeConclusion}
    const nextAttempts=attempts+1; setAttempts(nextAttempts); void updatePreviewCompetency()
    if(!matchesEchoA4cAnswerKey(completeAnswers)){setReceipt(null);setResult('needs-review');return}
    setReceipt(createEchoA4cCompletionReceipt({attempts:nextAttempts,answers:completeAnswers}));setResult('passed')
  }

  function restartLesson(){setAnswers({});setAttempts(0);setResult('idle');setReceipt(null);setMastery(null);setCompetencyStatus('idle');setConfidence(3);startedAtRef.current=Date.now()}

  return <section className={styles.echoLesson} aria-labelledby="echo-a4c-lesson-title" dir="ltr">
    <header className={styles.echoLessonHeader}><div><p className={styles.echoEyebrow}>REAL ECHO · A4C NORMAL · PREVIEW</p><h2 id="echo-a4c-lesson-title">Recognize the A4C view without over-interpreting a short loop</h2><p>Use the governed cine above to identify the complete view signature, observe cyclical motion and preserve the boundary between view recognition and diagnostic measurement.</p></div><span className={styles.realMediaBadge}>English · A4C recognition</span></header>
    <div className={styles.realEchoGuideGrid}><article><span>Note 01 · View signature</span><strong>Apical four-chamber</strong><p>Both atria and ventricles appear in one apical plane with the atrioventricular valve planes and septa.</p></article><article><span>Note 02 · Motion task</span><strong>Observe before measuring</strong><p>Track chamber and valve motion across the cine. Screen-side convention alone is not a reliable view identifier.</p></article><article><span>Note 03 · Learning scope</span><strong>View recognition only</strong><p>This 0.98-second source loop is not sufficient for EF, chamber measurements or exclusion of pathology.</p></article></div>
    {reducedMotion?<p className={styles.reducedMotionNote}>Reduced Motion is active. Playback remains off until you explicitly use the player controls; non-essential transitions are disabled.</p>:null}
    <section className={styles.echoAssessment} aria-labelledby="echo-a4c-assessment-title"><h3 id="echo-a4c-assessment-title">Three-question A4C check</h3><div className={`${styles.echoQuestionGrid} ${styles.realEchoQuestionGrid}`}>{QUESTIONS.map((question,index)=><fieldset className={styles.echoQuestion} key={question.id}><legend><span>{index+1}</span>{question.prompt}</legend><div className={styles.echoOptions}>{question.options.map(option=>{const selected=answers[question.id]===option.id;return <button aria-pressed={selected} className={selected?styles.echoOptionSelected:undefined} disabled={receipt!==null} key={option.id} onClick={()=>chooseAnswer(question.id,option.id)} type="button">{option.label}</button>})}</div></fieldset>)}</div>
      <div className={styles.echoAssessmentActions}><label>Confidence <select aria-label="Confidence" disabled={receipt!==null} value={confidence} onChange={event=>setConfidence(Number(event.target.value) as 1|2|3|4|5)}><option value={1}>1 · Guessing</option><option value={2}>2 · Low</option><option value={3}>3 · Moderate</option><option value={4}>4 · High</option><option value={5}>5 · Very high</option></select></label><button className={styles.echoPrimaryAction} disabled={!isComplete||receipt!==null} onClick={checkAnswers} type="button">Check all three answers</button>{!isComplete?<span>Choose one answer for each question.</span>:null}</div>
      {result==='needs-review'?<div className={styles.echoResultWarning} role="alert"><ShieldAlert aria-hidden="true" size={21}/><div><strong>Review the A4C view boundary</strong><span>Use the full four-chamber landmark set and do not convert this short preview into a quantitative or exclusion claim.</span></div></div>:null}
      {result==='passed'?<div className={styles.echoResultSuccess} role="status"><CheckCircle2 aria-hidden="true" size={21}/><div><strong>A4C check passed</strong><span>The view signature, visible landmark set and non-diagnostic boundary matched the governed answer key.</span></div></div>:null}
      {mastery?<div className={styles.echoResultSuccess} role="status"><CheckCircle2 aria-hidden="true" size={21}/><div><strong>Learning signal · {mastery.band}</strong><span>{mastery.skillId} · {mastery.score}% · confidence calibration {mastery.confidenceCalibration}%{competencyStatus==='degraded'?' · session-only preview':''}</span></div></div>:competencyStatus==='degraded'?<p className={styles.reducedMotionNote}>Competency enhancement is temporarily unavailable. The Echo lesson and assessment remain fully usable.</p>:null}
    </section>
    {receipt?<section aria-label="Unified completion receipt" className={styles.echoReceipt} role="status"><header><div><p className={styles.echoEyebrow}>UNIFIED COMPLETION RECEIPT</p><strong>{receipt.activityId}</strong></div><span>Session only</span></header><dl><div><dt>Receipt ID</dt><dd>{receipt.receiptId}</dd></div><div><dt>Content</dt><dd>{receipt.contentAssetId} · {receipt.contentVersion}</dd></div><div><dt>Engine</dt><dd>{receipt.engineId}</dd></div><div><dt>Attempts</dt><dd>{receipt.assessment.attempts}</dd></div><div><dt>Source</dt><dd>{receipt.source.sourceId}</dd></div><div><dt>License</dt><dd>{receipt.source.licenseId}</dd></div></dl><p>Deterministic learning evidence only. This receipt is not certification, clinical validation or medical approval.</p><button className={styles.echoSecondaryAction} onClick={restartLesson} type="button"><RotateCcw aria-hidden="true" size={18}/> Restart this lesson</button></section>:null}
    <details className={styles.realEchoAttribution}><summary><span><span className={styles.echoEyebrow}>SOURCE &amp; LICENSE</span><strong>CardioNetworks / Vdbilt · CC BY-SA 3.0</strong></span><span>View record</span></summary><div className={styles.realEchoAttributionBody}><div><h3>A4C normal · CardioNetworks ECHOpedia</h3><p>Creator: CardioNetworks / Vdbilt. The source file also displays courtesy credit to the Department of Echocardiography AMC and I.A.C. van der Bilt, MD.</p><p>Licensed under CC BY-SA 3.0. Changes: the burned-in acquisition date/time was masked for privacy hardening, the VP8 WebM was re-encoded to H.264 MP4, container metadata was removed, and no diagnostic annotation was added. This media derivative remains CC BY-SA 3.0.</p><p className={styles.echoDisclaimer}>{A4C_NORMAL_CLINICAL_STUDIO_ASSET.disclaimer}</p><span className={styles.echoContractId}>{ECHO_A4C_TRAINING_ACTIVITY.contentVersion} · {ECHO_A4C_TRAINING_ACTIVITY.engineId} · {A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.derivativeSha256}</span></div><div className={styles.realEchoSourceLinks}><a href={A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.sourcePageUrl} rel="noreferrer" target="_blank">Source file page <ExternalLink aria-hidden="true" size={14}/></a><a href={A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.licenseUrl} rel="noreferrer" target="_blank">CC BY-SA 3.0 <ExternalLink aria-hidden="true" size={14}/></a></div></div></details>
  </section>
}
