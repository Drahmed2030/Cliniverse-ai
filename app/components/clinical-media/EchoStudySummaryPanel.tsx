'use client'

import type { EchoStudySummary } from '../../lib/competency/echoStudySummary'
import type { EchoAdaptiveSelection } from '../../lib/competency/echoAdaptiveSelector'
import styles from './EchoStudySummaryPanel.module.css'

interface EchoStudySummaryPanelProps {
  summary: EchoStudySummary
  recommendation?: EchoAdaptiveSelection | null
}

export default function EchoStudySummaryPanel({ summary, recommendation = null }: EchoStudySummaryPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="echo-study-summary-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>STUDY SUMMARY</p>
          <h3 id="echo-study-summary-title">Clinical learning progress</h3>
        </div>
        <span>{summary.status.replaceAll('-', ' ')}</span>
      </header>

      <div className={styles.metrics}>
        <div><span>Visited</span><strong>{summary.visitedPercent}%</strong></div>
        <div><span>Competency coverage</span><strong>{summary.competencyCoveragePercent}%</strong></div>
        <div><span>Completed tasks</span><strong>{summary.completedCompetencyTasks}</strong></div>
      </div>

      {summary.skillSignals.length ? (
        <div className={styles.signals}>
          {summary.skillSignals.map(signal => (
            <div key={signal.skillId}>
              <span>{signal.skillId}</span>
              <strong>{signal.band} · {signal.score}%</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No competency signal yet. Viewing the study remains available without assessment.</p>
      )}

      {recommendation ? (
        <div className={styles.recommendation}>
          <span>Recommended next</span>
          <strong>{recommendation.caseId}</strong>
          <small>{recommendation.reason.replaceAll('-', ' ')} · priority {recommendation.priorityScore}</small>
        </div>
      ) : (
        <p className={styles.empty}>Next-case recommendation unlocks when another learner-ready Echo case is available in the governed batch.</p>
      )}
    </section>
  )
}
