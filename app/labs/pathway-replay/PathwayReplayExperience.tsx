'use client'

import {
  Activity,
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileLock2,
  Film,
  LockKeyhole,
  ShieldAlert,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'
import {
  DOOR_TO_ECG_MARKER_LEADS,
  DOOR_TO_ECG_SYNTHETIC_LEADS,
  type SyntheticLeadId,
} from '../../lib/cardiology/ecgWaveform'
import {
  DOOR_TO_ECG_CODE_LAB_ACTIVITY,
  type CodeLabTrainingCompletionReceipt,
} from '../../lib/codelab/trainingActivity'
import type { PathwayReplayReport, ReplayAgentState, ReplayIntegrityState } from '../../lib/cardiology/pathwayReplayAgents'
import {
  completePathwayReassessment,
  createPathwayClosureBrief,
  isPathwayStageAvailable,
  openPathwayStage,
  parsePathwayReplaySession,
  PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES,
  PATHWAY_SESSION_STORAGE_KEY,
  retryPathwayDrill,
  serializePathwayReplaySession,
  submitPathwayDrill,
  togglePathwayLead,
  type PathwayReplaySession,
  type PathwaySessionStage,
} from '../../lib/cardiology/pathwaySession'
import type { MedicalOperationsRegistrySnapshot } from '../../lib/cardiology/nexusReferences'
import styles from './pathway-replay.module.css'

const ClinicalMediaPreview = dynamic(
  () => import('../../components/clinical-media/ClinicalMediaPreview'),
  {
    loading: () => <div className={styles.mediaLoadingPanel} role="status">Loading governed media preview…</div>,
    ssr: false,
  },
)

interface Props {
  report: PathwayReplayReport
  labels: {
    back: string
    humanReview: string
    disclaimer: string
  }
}

const agentLabels: Record<ReplayAgentState, string> = {
  complete: 'Complete', ready: 'Ready', 'human-review': 'Human review',
}

const PATHWAY_SESSION_EVENT = 'cliniverse:pathway-session-change'
let pathwaySessionMemory: string | null = null

function subscribePathwaySession(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(PATHWAY_SESSION_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(PATHWAY_SESSION_EVENT, onStoreChange)
  }
}

function readPathwaySessionSnapshot() {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(PATHWAY_SESSION_STORAGE_KEY) ?? pathwaySessionMemory
  } catch {
    return pathwaySessionMemory
  }
}

function readServerPathwaySessionSnapshot() {
  return null
}

function writePathwaySessionSnapshot(session: PathwayReplaySession) {
  const serialized = serializePathwayReplaySession(session)
  pathwaySessionMemory = serialized
  try {
    sessionStorage.setItem(PATHWAY_SESSION_STORAGE_KEY, serialized)
  } catch {
    // The deterministic prototype remains usable in memory when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(PATHWAY_SESSION_EVENT))
}

export default function PathwayReplayExperience({ report, labels }: Props) {
  const [showMediaPreview, setShowMediaPreview] = useState(false)
  const sessionSnapshot = useSyncExternalStore(
    subscribePathwaySession,
    readPathwaySessionSnapshot,
    readServerPathwaySessionSnapshot,
  )
  const session = parsePathwayReplaySession(sessionSnapshot, report)
  const measuredEvents = report.events.filter(event => event.occurredAt !== null).length
  const view = session.stage
  const selectedLeads = session.selectedLeads
  const submitted = session.drillResult !== 'not-submitted'
  const passed = session.drillResult === 'passed'
  const drillComplete = session.trainingReceipt !== null

  function toggleLead(id: SyntheticLeadId) {
    writePathwaySessionSnapshot(togglePathwayLead(session, id))
  }

  function openStage(stage: PathwaySessionStage) {
    writePathwaySessionSnapshot(openPathwayStage(session, stage))
  }

  if (view === 'drill') {
    return (
      <Shell disclaimer={labels.disclaimer} onOpenStage={openStage} session={session}>
        <button className={styles.inlineBack} onClick={() => openStage('replay')} type="button">
          <ArrowLeft aria-hidden="true" size={18} /> Back to pathway
        </button>
        <header className={styles.drillHeader}>
          <p className={styles.eyebrow}>CODE LAB · TARGETED PATHWAY ACTIVITY · {report.training.durationMinutes} MIN</p>
          <h1>{DOOR_TO_ECG_CODE_LAB_ACTIVITY.title}</h1>
          <p>One governed activity links the detected pathway gap to deterministic practice, a completion receipt, and the same-session reassessment.</p>
        </header>

        <CodeLabActivityBridge report={report} />

        <section className={styles.mediaLauncher} aria-labelledby="media-launcher-title">
          <div>
            <p className={styles.eyebrow}>CLINICAL MEDIA COMPILER · V0</p>
            <h2 id="media-launcher-title">Preview the same lesson as governed motion</h2>
            <p>One deterministic source produces the in-app lesson, bilingual captions and three export ratios.</p>
          </div>
          <button
            aria-expanded={showMediaPreview}
            className={styles.secondaryAction}
            onClick={() => setShowMediaPreview(current => !current)}
            type="button"
          >
            <Film aria-hidden="true" size={18} /> {showMediaPreview ? 'Close preview' : 'Open 24-second preview'}
          </button>
        </section>
        {showMediaPreview ? <ClinicalMediaPreview /> : null}

        <section className={styles.drillPanel} aria-labelledby="waveform-title">
          <div className={styles.sectionHeading}>
            <h2 id="waveform-title">Synthetic ECG workspace</h2>
            <span><Activity aria-hidden="true" size={16} /> Generated by SVG engine</span>
          </div>
          <p className={styles.instructions}>Select every lead containing the configured post-QRS elevation marker. This is a controlled visual-recognition task, not ECG diagnosis.</p>
          <div className={styles.ecgGrid}>
            {DOOR_TO_ECG_SYNTHETIC_LEADS.map(lead => {
              const selected = selectedLeads.includes(lead.id)
              const resultClass = submitted && lead.configuredMarker ? styles.correctLead : submitted && selected ? styles.incorrectLead : ''
              return (
                <button
                  aria-label={`${lead.accessibleSummary} ${selected ? 'Selected.' : 'Not selected.'}`}
                  aria-pressed={selected}
                  className={`${styles.ecgLead} ${selected ? styles.selectedLead : ''} ${resultClass}`}
                  key={lead.id}
                  onClick={() => toggleLead(lead.id)}
                  type="button"
                >
                  <span>{lead.label}</span>
                  <svg aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 640 108">
                    <path className={styles.ecgTrace} d={lead.path} />
                  </svg>
                </button>
              )
            })}
          </div>

          <div className={styles.evidenceChecklist}>
            <h3>Acquisition evidence checklist</h3>
            <ul>
              <li><CheckCircle2 aria-hidden="true" size={17} /> Source timestamp captured: 08:12</li>
              <li><CheckCircle2 aria-hidden="true" size={17} /> Synthetic record provenance: SIM-ECG</li>
              <li><CheckCircle2 aria-hidden="true" size={17} /> Waveform is readable at review scale</li>
              <li><FileLock2 aria-hidden="true" size={17} /> Rule revision frozen: {report.training.referenceIds.join(', ')}</li>
            </ul>
          </div>

          {!submitted ? (
            <button className={styles.primaryAction} disabled={selectedLeads.length === 0} onClick={() => writePathwaySessionSnapshot(submitPathwayDrill(session, report))} type="button">Check selection</button>
          ) : passed ? (
            <div className={styles.resultSuccess} role="status">
              <CheckCircle2 aria-hidden="true" size={22} />
              <div><strong>Configured marker found</strong><span>{DOOR_TO_ECG_MARKER_LEADS.join(', ')} matched the deterministic answer key and generated a session-only Code Lab receipt.</span></div>
              <button className={styles.primaryAction} onClick={() => openStage('reassessment')} type="button">Open reassessment</button>
            </div>
          ) : (
            <div className={styles.resultWarning} role="alert">
              <ShieldAlert aria-hidden="true" size={22} />
              <div><strong>Selection needs review</strong><span>Compare the segment immediately after the QRS complex across all four synthetic leads.</span></div>
              <button className={styles.secondaryAction} onClick={() => writePathwaySessionSnapshot(retryPathwayDrill(session))} type="button">Try again</button>
            </div>
          )}
          {session.trainingReceipt ? <TrainingReceiptCard receipt={session.trainingReceipt} /> : null}
        </section>
      </Shell>
    )
  }

  if (view === 'reassessment') {
    return (
      <Shell disclaimer={labels.disclaimer} onOpenStage={openStage} session={session}>
        <button className={styles.inlineBack} onClick={() => openStage('drill')} type="button">
          <ArrowLeft aria-hidden="true" size={18} /> Back to drill
        </button>
        <header className={styles.drillHeader}>
          <p className={styles.eyebrow}>REASSESSMENT · ILLUSTRATIVE ONLY</p>
          <h1>Re-run the same operational competency</h1>
          <p>The training result changes only the fictional replay. It does not alter the baseline record or claim a patient outcome.</p>
        </header>
        <section className={styles.reassessmentPanel} aria-labelledby="reassessment-title">
          <h2 id="reassessment-title">Door-to-ECG comparison</h2>
          <div className={styles.comparisonGrid}>
            <article><span>Baseline replay</span><strong>{report.metrics.elapsedMinutes} min</strong><small>Recorded synthetic interval</small></article>
            <article><span>Post-training simulation</span><strong>{PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES} min</strong><small>Illustrative target run</small></article>
          </div>
          {session.trainingReceipt ? <TrainingReceiptCard compact receipt={session.trainingReceipt} /> : null}
          <div className={styles.reassessmentStatus}>
            <Clock3 aria-hidden="true" size={20} />
            <div><strong>Configured exercise passed</strong><span>ECG acquisition evidence was recognized before the 10-minute demonstration threshold.</span></div>
          </div>
          <div className={styles.openGate}>
            <ShieldAlert aria-hidden="true" size={20} />
            <div><strong>Closure remains blocked</strong><span>The Cath Lab arrival timestamp is still missing and requires human review.</span></div>
          </div>
          <button className={styles.primaryAction} onClick={() => writePathwaySessionSnapshot(completePathwayReassessment(session))} type="button">
            Create review brief
          </button>
        </section>
      </Shell>
    )
  }

  if (view === 'closure') {
    const brief = createPathwayClosureBrief(report, session)
    return (
      <Shell disclaimer={labels.disclaimer} onOpenStage={openStage} session={session}>
        <button className={styles.inlineBack} onClick={() => openStage('reassessment')} type="button">
          <ArrowLeft aria-hidden="true" size={18} /> Back to reassessment
        </button>
        <header className={styles.drillHeader}>
          <p className={styles.eyebrow}>CLOSURE BRIEF · HUMAN DECISION REQUIRED</p>
          <h1>One reviewable pathway record</h1>
          <p>The brief joins the configured gap, completed training, illustrative reassessment and unresolved evidence without changing the source replay.</p>
        </header>
        <article className={styles.closureBrief} aria-labelledby="closure-title">
          <header className={styles.closureHeader}>
            <div>
              <p className={styles.eyebrow}>NEURAOPS TRUST ARTIFACT · V1</p>
              <h2 id="closure-title">{brief.pathway.label}</h2>
              <p>{brief.caseId} · {brief.pathway.version} · Synthetic simulation</p>
            </div>
            <span className={`${styles.statusChip} ${styles.review}`}><span aria-hidden="true" />Human review</span>
          </header>

          <div className={styles.briefGrid}>
            <section aria-labelledby="brief-gap-title">
              <h3 id="brief-gap-title">Gap and ownership</h3>
              <dl className={styles.definitionList}>
                <Definition label="Finding" value={brief.gap.title} />
                <Definition label="Configured rule" value={brief.gap.configuredRule} />
                <Definition label="Evidence" value={brief.gap.evidenceIds.join(' → ')} />
                <Definition label="Accountable role" value={roleLabel(brief.gap.accountableRole)} tone="warning" />
              </dl>
            </section>
            <section aria-labelledby="brief-training-title">
              <h3 id="brief-training-title">Training evidence</h3>
              <dl className={styles.definitionList}>
                <Definition label="Activity" value={brief.training.activityId} />
                <Definition label="Activity version" value={brief.training.receipt.activityVersion} />
                <Definition label="Receipt" value={brief.training.receipt.receiptId} />
                <Definition label="Attempts" value={String(brief.training.attempts)} />
                <Definition label="Source snapshot" value={brief.training.receipt.source.registrySnapshotId} />
                <Definition label="Result" value="Configured marker matched" />
              </dl>
            </section>
          </div>

          <section className={styles.briefComparison} aria-labelledby="brief-reassessment-title">
            <div>
              <h3 id="brief-reassessment-title">Illustrative reassessment</h3>
              <p>No patient outcome or causal improvement claim.</p>
            </div>
            <div className={styles.metricShift} aria-label={`Baseline ${brief.reassessment.baselineMinutes ?? 'not measured'} minutes. Illustrative reassessment ${brief.reassessment.illustrativeMinutes} minutes. Configured target ${brief.reassessment.configuredTargetMinutes} minutes.`}>
              <span><small>Baseline</small><strong>{brief.reassessment.baselineMinutes ?? '—'} min</strong></span>
              <span aria-hidden="true">→</span>
              <span><small>Illustrative rerun</small><strong>{brief.reassessment.illustrativeMinutes} min</strong></span>
            </div>
          </section>

          <RegistryPassport compact idPrefix="closure" registry={brief.registry} />

          <section className={styles.limitations} aria-labelledby="limitations-title">
            <div className={styles.sectionHeading}>
              <h3 id="limitations-title">Open limitations</h3>
              <span>{brief.closure.reasons.length} requiring review</span>
            </div>
            <ul>
              {brief.closure.reasons.map(reason => <li key={reason}><ShieldAlert aria-hidden="true" size={17} />{reason}</li>)}
            </ul>
          </section>

          <div className={styles.closureDecision} role="status">
            <ClipboardCheck aria-hidden="true" size={22} />
            <div>
              <strong>Brief compiled; closure not granted</strong>
              <span>A licensed human reviewer still owns classification, evidence acceptance and final closure.</span>
            </div>
          </div>
          <button className={styles.primaryAction} onClick={() => openStage('replay')} type="button">Return to pathway overview</button>
        </article>
      </Shell>
    )
  }

  const integrityLabels: Record<ReplayIntegrityState, string> = {
    complete: 'Complete', delayed: `Delayed ${report.metrics.deltaMinutes ?? 0} min`, missing: 'Timestamp missing', conflict: 'Conflicting evidence',
  }

  return (
    <Shell disclaimer={labels.disclaimer} onOpenStage={openStage} session={session}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>CLINIVERSE AI · BY NEURAOPS</p>
          <h1>{report.pathwayLabel}</h1>
          <p className={styles.subtitle}>Fictional simulation · Pathway {report.pathwayVersion} · Evidence review pending</p>
        </div>
        <div className={styles.headerActions}>
          <span className={`${styles.statusChip} ${styles.review}`}><span aria-hidden="true" />{labels.humanReview}</span>
          <Link className={styles.backLink} href="/">{labels.back}</Link>
        </div>
      </header>

      <section aria-labelledby="performance-title">
        <h2 id="performance-title">Pathway performance</h2>
        <div className={styles.kpiGrid}>
          <KpiCard label="Door to ECG" value={`${report.metrics.elapsedMinutes ?? '—'} min`} target={`Target ≤ ${report.metrics.targetMinutes} min`} status="At risk" tone="warning" fill={81} />
          <KpiCard label="Pathway completeness" value={`${report.metrics.completenessPercent}%`} target="Target 100%" status={`${measuredEvents} of ${report.events.length} measured`} tone="success" fill={report.metrics.completenessPercent} />
          <KpiCard label="Open safety gates" value={String(report.metrics.openSafetyGates)} target="Target 0 open" status="Closure blocked" tone="critical" fill={96} />
        </div>
      </section>

      <div className={styles.workspace}>
        <div>
          <section className={styles.timelinePanel} aria-labelledby="timeline-title">
            <div className={styles.sectionHeading}><h2 id="timeline-title">Event timeline</h2><span>{measuredEvents} of {report.events.length} measured</span></div>
            <ol className={styles.eventList}>
              {report.events.map(event => (
                <li className={styles.eventRow} key={event.id}>
                  <span className={`${styles.eventRail} ${styles[event.integrity]}`} aria-hidden="true" />
                  <div className={styles.eventBody}><strong>{event.label}</strong><span>{roleLabel(event.owner)} · {event.source.system}</span></div>
                  <div className={styles.eventMeta}><strong>{event.displayTime}</strong><span className={styles[event.integrity]}>{integrityLabels[event.integrity]}</span></div>
                </li>
              ))}
            </ol>
          </section>
          <section className={styles.actionCard} aria-labelledby="action-title">
            <p className={styles.eyebrow}>NEXT CONTROLLED ACTION</p>
            <h2 id="action-title">{report.training.label}</h2>
            <p>{drillComplete ? 'The drill is complete. Reassessment evidence is available for reviewer inspection.' : 'Inspect the synthetic waveform, verify acquisition evidence, then reassess the same configured competency.'}</p>
            <p className={styles.trainingMeta}>Code Lab {DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityVersion} · {report.training.durationMinutes}-minute fictional exercise · No diagnosis or treatment authority</p>
          </section>
        </div>
        <div>
          <section className={styles.gapCard} aria-labelledby="gap-title">
            <p className={styles.eyebrow}>WHY IT WAS FLAGGED</p>
            <h2 id="gap-title">Door to ECG exceeded target by {report.metrics.deltaMinutes} minutes</h2>
            <dl className={styles.definitionList}>
              <Definition label="Rule" value={`${report.gap.rule.label} · ${report.gap.rule.version}`} />
              <Definition label="Source revision" value={report.registry.sourceIds.join(', ')} />
              <Definition label="Evidence" value={report.gap.evidenceIds.join(' → ')} />
              <Definition label="Owner" value={`${roleLabel(report.gap.owner)} · Human review required`} tone="warning" />
            </dl>
            <button className={styles.actionLink} onClick={() => openStage(drillComplete ? 'reassessment' : 'drill')} type="button">
              {drillComplete ? 'Review reassessment' : 'Open Code Lab ECG drill'}
            </button>
          </section>
          <section className={styles.agentsPanel} aria-labelledby="agents-title">
            <div className={styles.sectionHeading}><h2 id="agents-title">Six governed agents</h2><span>Deterministic · Network-free</span></div>
            <ol className={styles.agentList}>
              {report.agents.map((agent, index) => (
                <li className={styles.agentRow} key={agent.id}>
                  <span className={`${styles.agentIndex} ${styles[agent.state]}`}>{String(index + 1).padStart(2, '0')}</span>
                  <div><strong>{agent.label}</strong><span>{agent.output}</span></div>
                  <em className={styles[agent.state]}>{agentLabels[agent.state]}</em>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
      <RegistryPassport idPrefix="overview" registry={report.registry} />
    </Shell>
  )
}

function Shell({
  children,
  disclaimer,
  onOpenStage,
  session,
}: {
  children: React.ReactNode
  disclaimer: string
  onOpenStage: (stage: PathwaySessionStage) => void
  session: PathwayReplaySession
}) {
  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <JourneyProgress onOpenStage={onOpenStage} session={session} />
        {children}
        <footer className={styles.disclaimer}>{disclaimer}</footer>
      </div>
    </main>
  )
}

const JOURNEY_STAGES: { id: PathwaySessionStage; label: string; detail: string }[] = [
  { id: 'replay', label: 'Replay', detail: 'See the gap' },
  { id: 'drill', label: 'Code Lab', detail: 'ECG drill' },
  { id: 'reassessment', label: 'Reassess', detail: 'Compare' },
  { id: 'closure', label: 'Review brief', detail: 'Human closure' },
]

function JourneyProgress({
  onOpenStage,
  session,
}: {
  onOpenStage: (stage: PathwaySessionStage) => void
  session: PathwayReplaySession
}) {
  return (
    <nav className={styles.journeyProgress} aria-label="Pathway replay progress">
      <div className={styles.journeyMeta}>
        <span>CONTROLLED PATHWAY SESSION</span>
        <small>Session-only · No upload</small>
      </div>
      <ol>
        {JOURNEY_STAGES.map((stage, index) => {
          const current = session.stage === stage.id
          const available = isPathwayStageAvailable(session, stage.id)
          const completed = stage.id === 'replay'
            ? session.trainingReceipt !== null
            : stage.id === 'drill'
              ? session.trainingReceipt !== null
              : stage.id === 'reassessment'
                ? session.reassessment.state === 'passed'
                : false
          const status = current ? 'Current' : completed ? 'Completed' : available ? 'Available' : 'Locked'

          return (
            <li className={current ? styles.currentJourneyStep : undefined} key={stage.id}>
              <button
                aria-current={current ? 'step' : undefined}
                disabled={!available || current}
                onClick={() => onOpenStage(stage.id)}
                type="button"
              >
                <span className={styles.journeyIndex} aria-hidden="true">
                  {!available ? <LockKeyhole size={15} /> : completed && !current ? <CheckCircle2 size={17} /> : String(index + 1).padStart(2, '0')}
                </span>
                <span><strong>{stage.label}</strong><small>{stage.detail} · {status}</small></span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function CodeLabActivityBridge({ report }: { report: PathwayReplayReport }) {
  return (
    <section className={styles.codeLabBridge} aria-labelledby="codelab-bridge-title">
      <header>
        <div>
          <p className={styles.eyebrow}>CODE LAB BRIDGE · V1</p>
          <h2 id="codelab-bridge-title">One activity, one governed return path</h2>
        </div>
        <span className={styles.bridgeStatus}><FileLock2 aria-hidden="true" size={16} />Session-only</span>
      </header>
      <div className={styles.bridgeFlow}>
        <article>
          <small>Opened from</small>
          <strong>Door-to-ECG gap</strong>
          <span>{report.gap.rule.id}</span>
        </article>
        <article>
          <small>Code Lab activity</small>
          <strong>{report.training.activityId}</strong>
          <span>Version {DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityVersion}</span>
        </article>
        <article>
          <small>Returns to</small>
          <strong>Reassessment</strong>
          <span>Only after a valid receipt</span>
        </article>
      </div>
      <div className={styles.bridgeSource}>
        <span>Frozen source snapshot</span>
        <code>{report.training.registrySnapshotId}</code>
      </div>
    </section>
  )
}

function TrainingReceiptCard({
  compact = false,
  receipt,
}: {
  compact?: boolean
  receipt: CodeLabTrainingCompletionReceipt
}) {
  return (
    <section
      aria-label="Code Lab completion receipt"
      className={`${styles.trainingReceipt} ${compact ? styles.trainingReceiptCompact : ''}`}
      role="status"
    >
      <header>
        <span className={styles.receiptIcon}><CheckCircle2 aria-hidden="true" size={19} /></span>
        <div>
          <p className={styles.eyebrow}>CODE LAB COMPLETION RECEIPT</p>
          <strong>Accepted by the same-session contract</strong>
        </div>
        <span className={styles.receiptState}>Recorded</span>
      </header>
      <dl className={styles.receiptDetails}>
        <Definition label="Receipt ID" value={receipt.receiptId} />
        <Definition label="Content" value={`${receipt.contentAssetId} · ${receipt.contentVersion}`} />
        <Definition label="Source" value={receipt.source.registrySnapshotId} />
        <Definition label="Attempts" value={String(receipt.assessment.attempts)} />
      </dl>
      <p>Deterministic structural evidence only; not certification, clinical validation, or a digital signature.</p>
    </section>
  )
}

function KpiCard({ label, value, target, status, tone, fill }: { label: string; value: string; target: string; status: string; tone: 'success' | 'warning' | 'critical'; fill: number }) {
  return <article className={styles.kpiCard}><div><span>{label}</span><strong>{value}</strong></div><div className={styles.kpiTrack} aria-hidden="true"><span className={styles[tone]} style={{ width: `${Math.min(Math.max(fill, 0), 100)}%` }} /></div><div><small>{target}</small><em className={styles[tone]}>{status}</em></div></article>
}

function RegistryPassport({
  compact = false,
  idPrefix,
  registry,
}: {
  compact?: boolean
  idPrefix: string
  registry: MedicalOperationsRegistrySnapshot
}) {
  const titleId = `${idPrefix}-registry-title`
  const Heading = compact ? 'h3' : 'h2'
  const SourceHeading = compact ? 'h4' : 'h3'

  return (
    <section className={`${styles.registryPassport} ${compact ? styles.registryCompact : ''}`} aria-labelledby={titleId}>
      <header className={styles.registryHeader}>
        <div>
          <p className={styles.eyebrow}>NEURAOPS TRUST SPARK · SOURCE PASSPORT</p>
          <Heading id={titleId}>Medical Operations Registry</Heading>
          <p>Exact source revisions travel with this replay; later updates cannot silently rewrite it.</p>
        </div>
        <span className={styles.registryBlocked}><LockKeyhole aria-hidden="true" size={16} />Clinical rule blocked</span>
      </header>

      <div className={styles.registrySnapshot}>
        <FileLock2 aria-hidden="true" size={18} />
        <span>Immutable snapshot</span>
        <code>{registry.snapshotId}</code>
      </div>

      <div className={styles.registrySources}>
        {registry.sources.map(source => (
          <article className={styles.registrySource} key={source.id}>
            <header>
              <span className={styles.registryIcon}><BookOpenCheck aria-hidden="true" size={19} /></span>
              <div>
                <SourceHeading>{source.title}</SourceHeading>
                <p>{source.publisher} · {source.version}</p>
              </div>
            </header>
            <dl className={styles.registryDetails}>
              <Definition label="Review" value={registryReviewLabel(source.reviewStatus)} />
              <Definition label="Jurisdiction" value={source.jurisdiction} />
              <Definition label="Intended use" value={source.intendedUse} />
              <Definition label="Rights" value={registryRightsLabel(source.rights.status)} tone="warning" />
            </dl>
            {source.sourceUrl ? (
              <a className={styles.registryLink} href={source.sourceUrl} rel="noreferrer" target="_blank">
                Open primary source <ExternalLink aria-hidden="true" size={15} />
              </a>
            ) : (
              <p className={styles.registryInternal}>Controlled internal source · no public URL</p>
            )}
          </article>
        ))}
      </div>

      <div className={styles.registryBoundary} role="note">
        <ShieldAlert aria-hidden="true" size={19} />
        <div>
          <strong>Reference is not clinical authority</strong>
          <span>{registry.clinicalExecution.reasons.join(' ')}</span>
        </div>
      </div>
    </section>
  )
}

function Definition({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return <div className={styles.definition}><dt>{label}</dt><dd className={tone ? styles[tone] : undefined}>{value}</dd></div>
}

function roleLabel(role: string) {
  return ({ referring: 'ED team', coordination: 'Pathway coordination', cardiology: 'Cardiology', 'cath-lab': 'Cath Lab', quality: 'Quality lead' } as Record<string, string>)[role] ?? role
}

function registryReviewLabel(status: MedicalOperationsRegistrySnapshot['sources'][number]['reviewStatus']) {
  return ({
    'reviewed-synthetic-only': 'Reviewed for synthetic demonstration only',
    'verified-public-reference': 'Public source verified; clinical review pending',
    'requires-local-review': 'Local review required',
  } as const)[status]
}

function registryRightsLabel(status: MedicalOperationsRegistrySnapshot['sources'][number]['rights']['status']) {
  return ({
    'owned-internal': 'Internal rights recorded',
    'internal-use-review-required': 'Internal-use rights review required',
    'link-only-review-required': 'Link only; reuse rights review required',
  } as const)[status]
}
