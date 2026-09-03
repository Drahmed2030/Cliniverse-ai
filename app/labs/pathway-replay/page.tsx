import type { Metadata } from 'next'
import Link from 'next/link'
import {
  runPathwayReplay,
  STEMI_REPLAY_DEMO,
  type ReplayAgentState,
  type ReplayIntegrityState,
} from '../../lib/cardiology/pathwayReplayAgents'
import styles from './pathway-replay.module.css'

export const metadata: Metadata = {
  title: 'Clinical Pathway Replay · Cliniverse AI',
  description: 'A synthetic, governed clinical pathway replay prototype.',
}

const report = runPathwayReplay(STEMI_REPLAY_DEMO)

const integrityLabels: Record<ReplayIntegrityState, string> = {
  complete: 'Complete',
  delayed: `Delayed ${report.metrics.deltaMinutes ?? 0} min`,
  missing: 'Timestamp missing',
  conflict: 'Conflicting evidence',
}

const agentLabels: Record<ReplayAgentState, string> = {
  complete: 'Complete',
  ready: 'Ready',
  'human-review': 'Human review',
}

export default function PathwayReplayPage() {
  const measuredEvents = report.events.filter(event => event.occurredAt !== null).length

  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>CLINIVERSE AI · BY NEURAOPS</p>
            <h1>{report.pathwayLabel}</h1>
            <p className={styles.subtitle}>
              Fictional simulation · Pathway {report.pathwayVersion} · Evidence review pending
            </p>
          </div>
          <div className={styles.headerActions}>
            <span className={`${styles.statusChip} ${styles.review}`}>
              <span aria-hidden="true" />Review required
            </span>
            <Link className={styles.backLink} href="/">Back to Cliniverse</Link>
          </div>
        </header>

        <section aria-labelledby="performance-title">
          <h2 id="performance-title">Pathway performance</h2>
          <div className={styles.kpiGrid}>
            <KpiCard
              label="Door to ECG"
              value={`${report.metrics.elapsedMinutes ?? '—'} min`}
              target={`Target ≤ ${report.metrics.targetMinutes} min`}
              status={report.metrics.status === 'at-risk' ? 'At risk' : 'Within target'}
              tone={report.metrics.status === 'at-risk' ? 'warning' : 'success'}
              fill={81}
            />
            <KpiCard
              label="Pathway completeness"
              value={`${report.metrics.completenessPercent}%`}
              target="Target 100%"
              status={`${measuredEvents} of ${report.events.length} measured`}
              tone="success"
              fill={report.metrics.completenessPercent}
            />
            <KpiCard
              label="Open safety gates"
              value={String(report.metrics.openSafetyGates)}
              target="Target 0 open"
              status={report.closure.state === 'blocked' ? 'Closure blocked' : 'Review required'}
              tone="critical"
              fill={96}
            />
          </div>
        </section>

        <div className={styles.workspace}>
          <div>
            <section className={styles.timelinePanel} aria-labelledby="timeline-title">
              <div className={styles.sectionHeading}>
                <h2 id="timeline-title">Event timeline</h2>
                <span>{measuredEvents} of {report.events.length} measured</span>
              </div>
              <ol className={styles.eventList}>
                {report.events.map(event => (
                  <li className={styles.eventRow} key={event.id}>
                    <span className={`${styles.eventRail} ${styles[event.integrity]}`} aria-hidden="true" />
                    <div className={styles.eventBody}>
                      <strong>{event.label}</strong>
                      <span>{roleLabel(event.owner)} · {event.source.system}</span>
                    </div>
                    <div className={styles.eventMeta}>
                      <strong>{event.displayTime}</strong>
                      <span className={styles[event.integrity]}>{integrityLabels[event.integrity]}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.actionCard} id="targeted-training" aria-labelledby="action-title">
              <p className={styles.eyebrow}>NEXT CONTROLLED ACTION</p>
              <h2 id="action-title">{report.training.label}</h2>
              <p>
                Practise the flagged handover, reassess the same configured competency,
                then return for reviewer closure.
              </p>
              <p className={styles.trainingMeta}>
                {report.training.durationMinutes}-minute fictional exercise · No diagnosis or treatment authority
              </p>
            </section>
          </div>

          <div>
            <section className={styles.gapCard} aria-labelledby="gap-title">
              <p className={styles.eyebrow}>WHY IT WAS FLAGGED</p>
              <h2 id="gap-title">Door to ECG exceeded target by {report.metrics.deltaMinutes} minutes</h2>
              <dl className={styles.definitionList}>
                <Definition label="Rule" value={`${report.gap.rule.label} · ${report.gap.rule.version}`} />
                <Definition label="Evidence" value={report.gap.evidenceIds.join(' → ')} />
                <Definition label="Owner" value={`${roleLabel(report.gap.owner)} · Human review required`} tone="warning" />
              </dl>
              <Link className={styles.actionLink} href="#targeted-training">
                Open targeted training
              </Link>
            </section>

            <section className={styles.agentsPanel} aria-labelledby="agents-title">
              <div className={styles.sectionHeading}>
                <h2 id="agents-title">Six governed agents</h2>
                <span>Deterministic · Network-free</span>
              </div>
              <ol className={styles.agentList}>
                {report.agents.map((agent, index) => (
                  <li className={styles.agentRow} key={agent.id}>
                    <span className={`${styles.agentIndex} ${styles[agent.state]}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <strong>{agent.label}</strong>
                      <span>{agent.output}</span>
                    </div>
                    <em className={styles[agent.state]}>{agentLabels[agent.state]}</em>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>

        <footer className={styles.disclaimer}>
          Illustrative and unvalidated · Synthetic data only · No patient outcome claim
        </footer>
      </div>
    </main>
  )
}

function KpiCard({
  label,
  value,
  target,
  status,
  tone,
  fill,
}: {
  label: string
  value: string
  target: string
  status: string
  tone: 'success' | 'warning' | 'critical'
  fill: number
}) {
  return (
    <article className={styles.kpiCard}>
      <div><span>{label}</span><strong>{value}</strong></div>
      <div className={styles.kpiTrack} aria-hidden="true">
        <span className={styles[tone]} style={{ width: `${Math.min(Math.max(fill, 0), 100)}%` }} />
      </div>
      <div><small>{target}</small><em className={styles[tone]}>{status}</em></div>
    </article>
  )
}

function Definition({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return (
    <div className={styles.definition}>
      <dt>{label}</dt>
      <dd className={tone ? styles[tone] : undefined}>{value}</dd>
    </div>
  )
}

function roleLabel(role: string) {
  return ({
    referring: 'ED team',
    coordination: 'Pathway coordination',
    cardiology: 'Cardiology',
    'cath-lab': 'Cath Lab',
    quality: 'Quality lead',
  } as Record<string, string>)[role] ?? role
}
