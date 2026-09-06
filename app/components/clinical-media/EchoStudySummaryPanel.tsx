'use client'

import type { EchoStudySummary } from '../../lib/competency/echoStudySummary'
import type { EchoAdaptiveSelection } from '../../lib/competency/echoAdaptiveSelector'
import styles from './clinical-media.module.css'

interface EchoStudySummaryPanelProps {
  summary: EchoStudySummary
  recommendation?: EchoAdaptiveSelection | null
}

export default function EchoStudySummaryPanel({ summary, recommendation = null }: EchoStudySummaryPanelProps) {
  return (
    <section className={styles.echoStudySummaryPanel} aria-labelledby="echo-study-summary-title">
      <header>
        <div>
          <p className={styles.echoEyebrow}>STUDY SUMMARY</p>
          <h3 id="echo-study-summary-title">Clinical learning progress</h3>
        </div>
        <span>{summary.status.replaceAll('-', ' ')}</span>
      </header>

      <div className={styles.echoStudySummaryMetrics}>
        <div><span>Visited</span><strong>{summary.visitedPercent}%</strong></div>
        <div><span>Competency coverage</span><strong>{summary.competencyCoveragePercent}%</strong></div>
        <div><span>Completed tasks</span><strong>{summary.completedCompetencyTasks}</strong></div>
      </div>

      {summary.skillSignals.length ? (
        <div className={styles.echoStudySkillSignals}>
          {summary.skillSignals.map(signal => (
            <div key={signal.skillId}>
              <span>{signal.skillId}</span>
              <strong>{signal.band} · {signal.score}%</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.reducedMotionNote}>No competency signal yet. Viewing the study remains available without assessment.</p>
      )}

      {recommendation ? (
        <div className={styles.echoStudyRecommendation}>
          <span>Recommended next</span>
          <strong>{recommendation.caseId}</strong>
          <small>{recommendation.reason.replaceAll('-', ' ')} · priority {recommendation.priorityScore}</small>
        </div>
      ) : null}
    </section>
  )
}
