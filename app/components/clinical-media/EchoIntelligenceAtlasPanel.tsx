'use client'

// EchoIntelligenceAtlasPanel — Batch 6 live wiring. Surfaces the one
// learner-ready Echo Intelligence Atlas activity (next-best-evidence,
// tied to the Normal A4C study) inside the EXISTING Echo Preview page.
// This is deliberately not a new player and not a new route: it renders
// inside ClinicalMediaPreview's already-gated echo-a4c-normal branch,
// reusing the same styling as EchoA4cLesson's assessment UI.
//
// This panel must never name or describe any governed, non-learner-ready
// Echo phenotype — those stay hidden/reviewer-only per
// docs/ECHO_INTELLIGENCE_ATLAS_V1.md. If the seeded next-best-evidence
// activity/task pair is ever missing or invalid, this renders nothing
// rather than fabricating content.

import { useRef, useState } from 'react'
import { ECHO_LEARNING_ACTIVITY_SEED, ECHO_NEXT_BEST_EVIDENCE_TASKS, assertNextBestEvidenceFraming } from '../../lib/competency/echoLearningActivity'
import { scoreEchoAssessment, type EchoConfidence } from '../../lib/competency/echoAssessmentContract'
import { classifyEchoCalibration, type EchoCalibrationSignal } from '../../lib/competency/echoConfidenceCalibration'
import styles from './clinical-media.module.css'

const ACTIVITY = ECHO_LEARNING_ACTIVITY_SEED.find(activity => activity.type === 'next_best_evidence') ?? null
const TASK = ACTIVITY ? ECHO_NEXT_BEST_EVIDENCE_TASKS.find(task => task.id === ACTIVITY.taskId) ?? null : null

export default function EchoIntelligenceAtlasPanel() {
  const [selected, setSelected] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<EchoConfidence>(3)
  const [signal, setSignal] = useState<EchoCalibrationSignal | null>(null)
  const startedAtRef = useRef(Date.now())

  if (!ACTIVITY || !TASK) return null
  assertNextBestEvidenceFraming(TASK)

  function checkReasoning() {
    if (!selected || !TASK) return
    const result = scoreEchoAssessment(TASK, {
      taskId: TASK.id,
      selectedOptionIds: [selected],
      confidence,
      responseTimeMs: Math.max(0, Date.now() - startedAtRef.current),
      attemptedAt: new Date().toISOString(),
    })
    setSignal(classifyEchoCalibration(result))
  }

  function reset() {
    setSelected(null)
    setConfidence(3)
    setSignal(null)
    startedAtRef.current = Date.now()
  }

  return (
    <section className={styles.echoAssessment} aria-labelledby="echo-atlas-next-best-evidence-title" data-testid="echo-intelligence-atlas-panel">
      <p className={styles.echoEyebrow}>ECHO INTELLIGENCE ATLAS · NEXT-BEST-EVIDENCE</p>
      <h3 id="echo-atlas-next-best-evidence-title">{TASK.prompt}</h3>
      <div className={styles.echoQuestionGrid}>
        <fieldset className={styles.echoQuestion}>
          <legend><span>1</span>Reasoning check</legend>
          <div className={styles.echoOptions}>
            {TASK.options.map(option => (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected === option.id}
                className={selected === option.id ? styles.echoOptionSelected : undefined}
                disabled={signal !== null}
                onClick={() => setSelected(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className={styles.echoAssessmentActions}>
        <label>
          Confidence{' '}
          <select
            aria-label="Confidence"
            disabled={signal !== null}
            value={confidence}
            onChange={event => setConfidence(Number(event.target.value) as EchoConfidence)}
          >
            <option value={1}>1 · Guessing</option>
            <option value={2}>2 · Low</option>
            <option value={3}>3 · Moderate</option>
            <option value={4}>4 · High</option>
            <option value={5}>5 · Very high</option>
          </select>
        </label>
        <button type="button" className={styles.echoPrimaryAction} disabled={!selected || signal !== null} onClick={checkReasoning}>
          Check my reasoning
        </button>
        {!selected ? <span>Choose one option to continue.</span> : null}
      </div>
      {signal ? (
        <div className={signal.correct ? styles.echoResultSuccess : styles.echoResultWarning} role="status">
          <div>
            <strong>{signal.correct ? 'Good evidence-seeking reasoning' : 'Review this reasoning step'}</strong>
            <span>{TASK.rationale}</span>
          </div>
        </div>
      ) : null}
      {signal ? (
        <button type="button" className={styles.echoSecondaryAction} onClick={reset}>
          Try again
        </button>
      ) : null}
      <p className={styles.echoDisclaimer}>{TASK.evidenceBoundary}</p>
    </section>
  )
}
