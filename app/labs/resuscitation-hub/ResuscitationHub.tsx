'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RESUSCITATION_LEARNING_UNITS, catalogReviewStatusFor } from '../../lib/resuscitation/curriculumContract.ts'
import { RESUSCITATION_SCENARIOS } from '../../lib/resuscitation/scenarios/index.ts'
import type { ResuscitationScenario } from '../../lib/resuscitation/scenarioContract.ts'
import {
  applyResuscitationAction,
  checkResuscitationTimeouts,
  createResuscitationEngineState,
  type ResuscitationEngineState,
} from '../../lib/resuscitation/scenarioEngine.ts'
import { presentRapidReplayFeedback, rewindToCheckpoint } from '../../lib/resuscitation/rapidReplay.ts'
import { appendResuscitationEvent } from '../../lib/resuscitation/resuscitationEvent.ts'
import type { ResuscitationEvent } from '../../lib/resuscitation/resuscitationCore.ts'
import { generateResuscitationDebrief } from '../../lib/resuscitation/debriefEngine.ts'
import { deriveResuscitationPerformance, deriveOverallScore } from '../../lib/resuscitation/performanceModel.ts'
import { createResuscitationEvidenceReceipt } from '../../lib/resuscitation/evidenceReceipt.ts'
import { summarizeResuscitationProgress } from '../../lib/resuscitation/progressAdapter.ts'
import styles from './resuscitation-hub.module.css'

type HubSection = 'foundations' | 'practice' | 'simulate' | 'replay' | 'progress'
const SECTIONS: { id: HubSection; label: string }[] = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'practice', label: 'Practice' },
  { id: 'simulate', label: 'Simulate' },
  { id: 'replay', label: 'Replay' },
  { id: 'progress', label: 'Progress' },
]

export default function ResuscitationHub() {
  const [section, setSection] = useState<HubSection>('foundations')
  const [activeScenario, setActiveScenario] = useState<ResuscitationScenario | null>(null)
  const [progressSignals, setProgressSignals] = useState<ReturnType<typeof deriveResuscitationPerformance>>([])

  if (activeScenario) {
    return (
      <SimulationPlayer
        onExit={signals => { setActiveScenario(null); if (signals) setProgressSignals(current => [...current, ...signals]) }}
        scenario={activeScenario}
      />
    )
  }

  const lessons = RESUSCITATION_LEARNING_UNITS.filter(unit => unit.kind === 'lesson')
  const drills = RESUSCITATION_LEARNING_UNITS.filter(unit => unit.kind === 'drill')

  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>CLINIVERSE AI · RESUSCITATION</p>
          <h1>Resuscitation Hub</h1>
          <p>Learn, practice, simulate, replay and track resuscitation competency in one place.</p>
          <Link className={styles.backLink} href="/">← Back to Cliniverse</Link>
        </header>

        <nav aria-label="Resuscitation Hub sections" className={styles.tabBar}>
          {SECTIONS.map(tab => (
            <button
              aria-current={section === tab.id ? 'page' : undefined}
              className={`${styles.tabButton} ${section === tab.id ? styles.tabButtonActive : ''}`}
              key={tab.id}
              onClick={() => setSection(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {section === 'foundations' ? (
          <section aria-labelledby="foundations-title">
            <h2 id="foundations-title" style={{ fontSize: 14 }}>BLS / ACLS curriculum</h2>
            {lessons.map(unit => (
              <div className={styles.card} key={unit.unitId}>
                <div className={styles.cardRow}>
                  <div>
                    <p className={styles.cardTitle}>{unit.title}</p>
                    <p className={styles.cardSub}>{unit.track.toUpperCase()} · {unit.objectives[0]}</p>
                  </div>
                  <span className={`${styles.badge} ${unit.reviewStatus === 'reviewed' ? styles.badgeReady : styles.badgePending}`}>
                    {unit.reviewStatus === 'reviewed' ? 'Reviewed' : 'Pending review'}
                  </span>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {section === 'practice' ? (
          <section aria-labelledby="practice-title">
            <h2 id="practice-title" style={{ fontSize: 14 }}>Code Lab drills</h2>
            {drills.map(unit => (
              <div className={styles.card} key={unit.unitId}>
                <div className={styles.cardRow}>
                  <div>
                    <p className={styles.cardTitle}>{unit.title}</p>
                    <p className={styles.cardSub}>{unit.competencyDomains.join(', ') || 'general'}</p>
                  </div>
                  <span className={`${styles.badge} ${styles.badgePending}`}>Pending review</span>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {section === 'simulate' ? (
          <section aria-labelledby="simulate-title">
            <h2 id="simulate-title" style={{ fontSize: 14 }}>Governed simulations</h2>
            {RESUSCITATION_SCENARIOS.map(scenario => {
              // Learner launchability is gated by the catalog row for this
              // exact scenarioId, not by scenario.reviewStatus (that field
              // is the scenario manifest's own declared governance state —
              // see curriculumContract.ts's catalogReviewStatusFor header).
              // Registry presence alone is never sufficient for exposure.
              const learnerReady = catalogReviewStatusFor(scenario.scenarioId) === 'reviewed'
              return (
                <div className={styles.card} key={scenario.scenarioId}>
                  <div className={styles.cardRow}>
                    <div>
                      <p className={styles.cardTitle}>{scenario.title}</p>
                      <p className={styles.cardSub}>v{scenario.version} · {scenario.phases.length} phases</p>
                    </div>
                    <span className={`${styles.badge} ${learnerReady ? styles.badgeReady : styles.badgePending}`}>
                      {learnerReady ? 'Reviewed' : 'Under clinical review'}
                    </span>
                  </div>
                  <button
                    className={styles.launchButton}
                    disabled={!learnerReady}
                    onClick={() => { if (learnerReady) setActiveScenario(scenario) }}
                    type="button"
                  >
                    {learnerReady ? 'Start simulation' : 'Under clinical review — not yet available'}
                  </button>
                </div>
              )
            })}
          </section>
        ) : null}

        {section === 'replay' ? (
          <section aria-labelledby="replay-title">
            <h2 id="replay-title" style={{ fontSize: 14 }}>Replay</h2>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Rapid Replay</p>
              <p className={styles.cardSub}>A critical error during Simulate pauses the scenario automatically, shows focused feedback, and lets you retry from the last checkpoint — no separate entry point needed.</p>
            </div>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Pathway Replay</p>
              <p className={styles.cardSub}>The governed STEMI pathway replay and Code Lab drill bridge from Batch 7.</p>
              <Link className={styles.secondaryButton} href="/labs/pathway-replay" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', marginTop: 10 }}>
                Open Pathway Replay →
              </Link>
            </div>
          </section>
        ) : null}

        {section === 'progress' ? (
          <section aria-labelledby="progress-title">
            <h2 id="progress-title" style={{ fontSize: 14 }}>Competency progress (this session)</h2>
            {progressSignals.length === 0 ? (
              <p className={styles.cardSub}>Complete a simulation to see competency signals here.</p>
            ) : (
              summarizeResuscitationProgress(progressSignals).map((summary, index) => (
                <div className={styles.card} key={`${summary.competencyDomain}-${index}`}>
                  <div className={styles.cardRow}>
                    <p className={styles.cardTitle}>{summary.competencyDomain.replace(/_/g, ' ')}</p>
                    <span className={`${styles.badge} ${styles.badgePending}`}>{summary.band.replace(/_/g, ' ')}</span>
                  </div>
                  <p className={styles.cardSub}>{summary.score === null ? 'No evidence yet' : `${Math.round(summary.score * 100)}%`} · {summary.reviewStatus.replace(/_/g, ' ')}</p>
                </div>
              ))
            )}
          </section>
        ) : null}

        <p className={styles.disclaimer}>Educational simulation only. Not real-time clinical guidance. Not an official AHA course. Not a certification or credential.</p>
      </div>
    </main>
  )
}

function newId(): string {
  return crypto.randomUUID()
}

function SimulationPlayer({ scenario, onExit }: {
  scenario: ResuscitationScenario
  onExit: (signals: ReturnType<typeof deriveResuscitationPerformance> | null) => void
}) {
  const sessionIdRef = useRef(`resus-session-${newId()}`)
  const [state, setState] = useState<ResuscitationEngineState>(() => createResuscitationEngineState(scenario))
  const [events, setEvents] = useState<ResuscitationEvent[]>([])
  const [phaseEnteredAt, setPhaseEnteredAt] = useState(Date.now())
  const [elapsedMs, setElapsedMs] = useState(0)
  const [showTimeline, setShowTimeline] = useState(false)
  const [receiptId, setReceiptId] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    appendResuscitationEvent([], {
      eventId: newId(), sessionId: sessionIdRef.current, eventType: 'simulation.started',
      occurredAt: new Date().toISOString(), scenarioId: scenario.scenarioId, actorType: 'learner', payload: {},
    }).then(setEvents)
  }, [scenario.scenarioId])

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - phaseEnteredAt
      setElapsedMs(elapsed)
      setState(current => checkResuscitationTimeouts(scenario, current, elapsed))
    }, 1000)
    return () => clearInterval(interval)
  }, [scenario, phaseEnteredAt])

  useEffect(() => { setPhaseEnteredAt(Date.now()); setElapsedMs(0) }, [state.currentPhaseId])

  async function handleAction(actionId: string) {
    const next = applyResuscitationAction(scenario, state, actionId)
    setState(next)
    let history = events
    history = await appendResuscitationEvent(history, {
      eventId: newId(), sessionId: sessionIdRef.current, eventType: 'action.selected',
      occurredAt: new Date().toISOString(), scenarioId: scenario.scenarioId, actorType: 'learner',
      payload: { actionId, phaseId: state.currentPhaseId },
    })
    if (next.status === 'paused_for_feedback') {
      history = await appendResuscitationEvent(history, {
        eventId: newId(), sessionId: sessionIdRef.current, eventType: 'critical_error.detected',
        occurredAt: new Date().toISOString(), scenarioId: scenario.scenarioId, actorType: 'system',
        payload: { actionId, phaseId: state.currentPhaseId },
      })
      history = await appendResuscitationEvent(history, {
        eventId: newId(), sessionId: sessionIdRef.current, eventType: 'segment.paused',
        occurredAt: new Date().toISOString(), scenarioId: scenario.scenarioId, actorType: 'system', payload: {},
      })
      history = await appendResuscitationEvent(history, {
        eventId: newId(), sessionId: sessionIdRef.current, eventType: 'feedback.presented',
        occurredAt: new Date().toISOString(), scenarioId: scenario.scenarioId, actorType: 'system', payload: {},
      })
    }
    if (next.status === 'completed') {
      history = await appendResuscitationEvent(history, {
        eventId: newId(), sessionId: sessionIdRef.current, eventType: 'scenario.completed',
        occurredAt: new Date().toISOString(), scenarioId: scenario.scenarioId, actorType: 'system',
        payload: { passed: next.passed ?? false },
      })
    }
    setEvents(history)
  }

  async function handleRetry() {
    const next = rewindToCheckpoint(scenario, state)
    setState(next)
    const history = await appendResuscitationEvent(events, {
      eventId: newId(), sessionId: sessionIdRef.current, eventType: 'segment.retried',
      occurredAt: new Date().toISOString(), scenarioId: scenario.scenarioId, actorType: 'learner', payload: {},
    })
    setEvents(history)
  }

  const currentPhase = scenario.phases.find(phase => phase.phaseId === state.currentPhaseId)
  const feedback = presentRapidReplayFeedback(state)

  // Every hook in this component must run unconditionally, every render —
  // this effect only takes real action once (guarded internally, and by
  // its own receiptId !== null check) when the engine reaches 'completed',
  // but the hook call itself is never behind an if-branch.
  useEffect(() => {
    if (state.status !== 'completed' || receiptId) return
    const signals = deriveResuscitationPerformance(scenario, state)
    const overall = deriveOverallScore(signals)
    createResuscitationEvidenceReceipt({
      subtype: 'simulation',
      unitOrScenarioId: scenario.scenarioId,
      sourceRefs: scenario.sourceRefs,
      eventRefs: events.map(event => event.eventId),
      payload: { passed: state.passed ?? false, totalScore: overall.totalScore },
    }).then(receipt => setReceiptId(receipt.receiptId))
  }, [state, scenario, events, receiptId])

  if (state.status === 'completed') {
    const signals = deriveResuscitationPerformance(scenario, state)
    const debrief = generateResuscitationDebrief(scenario, state, events)

    return (
      <main className={styles.shell}>
        <div className={styles.page}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>{state.passed ? 'SCENARIO COMPLETE' : 'SCENARIO ENDED'}</p>
            <h1>{scenario.title}</h1>
          </header>

          <div className={styles.debriefSection}>
            <h3>Reaction</h3>
            <p>{debrief.reaction}</p>
          </div>
          <div className={styles.debriefSection}>
            <h3>Description</h3>
            <p>{debrief.description}</p>
          </div>
          <div className={styles.debriefSection}>
            <h3>Analysis</h3>
            <ul>{debrief.analysis.map(line => <li key={line}>{line}</li>)}</ul>
          </div>
          <div className={styles.debriefSection}>
            <h3>Summary</h3>
            <p>{debrief.summary}</p>
          </div>
          {debrief.nextPractice.length ? (
            <div className={styles.debriefSection}>
              <h3>Next practice</h3>
              <ul>{debrief.nextPractice.map(item => <li key={item.competencyDomain}>{item.competencyDomain.replace(/_/g, ' ')} → {item.recommendedUnitId}</li>)}</ul>
            </div>
          ) : null}
          {receiptId ? (
            <div className={styles.debriefSection}>
              <h3>Evidence receipt</h3>
              <p>{receiptId}</p>
              <p style={{ fontSize: 11, color: 'var(--rh-muted)' }}>Tamper-evident structural receipt. Not a certification, signature, or credential.</p>
            </div>
          ) : null}

          <button className={styles.launchButton} onClick={() => onExit(signals)} type="button">
            Back to Resuscitation Hub
          </button>
          <p className={styles.disclaimer}>Educational simulation only. Not real-time clinical guidance. Not an official AHA course.</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.shell}>
      <div className={styles.simShell}>
        <div className={styles.simStrip}>
          <div>
            <strong>{scenario.title}</strong>
            <small>{currentPhase?.label}</small>
          </div>
          <div className={styles.simTimer} aria-label="Elapsed time in this phase">{Math.floor(elapsedMs / 1000)}s</div>
        </div>

        <div className={styles.simBody}>
          <div className={styles.actionGrid}>
            {currentPhase?.actions.map(action => (
              <button
                className={`${styles.actionButton} ${action.critical ? styles.actionCritical : ''}`}
                key={action.actionId}
                onClick={() => handleAction(action.actionId)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>

          <button aria-expanded={showTimeline} className={styles.timelineToggle} onClick={() => setShowTimeline(current => !current)} type="button">
            {showTimeline ? 'Hide' : 'Show'} event timeline ({state.history.length})
          </button>
          {showTimeline ? (
            <div className={styles.timeline}>
              {state.history.length === 0 ? <p style={{ fontSize: 11, color: 'var(--rh-muted)' }}>No actions yet.</p> : null}
              {state.history.map((entry, index) => (
                <div className={styles.timelineRow} key={`${entry.actionId}-${index}`}>
                  <span className={entry.correct ? styles.timelineOk : styles.timelineBad}>{entry.correct ? '✓' : '✗'} {entry.actionId}</span>
                  <span>{entry.phaseId}</span>
                </div>
              ))}
            </div>
          ) : null}

          <button className={styles.secondaryButton} onClick={() => onExit(null)} style={{ marginTop: 16, width: '100%' }} type="button">
            Exit simulation
          </button>
        </div>
      </div>

      {feedback ? (
        <div className={styles.pauseOverlay} role="alertdialog" aria-labelledby="pause-title">
          <div className={styles.pauseSheet}>
            <p className={styles.eyebrow}>CRITICAL ERROR · PAUSED</p>
            <h2 id="pause-title">{feedback.actionLabel}</h2>
            <p>{feedback.feedback}</p>
            <p style={{ fontSize: 11, color: 'var(--rh-muted)' }}>{feedback.sourceRefs.join(' · ')}</p>
            <div className={styles.pauseActions}>
              <button className={styles.launchButton} onClick={handleRetry} type="button">
                Retry from checkpoint
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
