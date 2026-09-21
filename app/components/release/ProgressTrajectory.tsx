'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import AuthGate from '../auth/AuthGate'
import { supabase } from '../../supabase'
import { createEchoAccountEventRepository } from '../../lib/competency/echoAccountEventRepository'
import { handoverAccountRepository } from '../../lib/ward/handoverAccountRepository'
import { restoreHandover } from '../../lib/ward/handoverCheckpoint'
import { scenarioFor } from '../../lib/ward/handoverScenarios'
import { loadEcgSavedAnswers } from './EcgSavedHistory'
import {
  projectEcg, projectEcho, projectWard, summarize,
  type EcgEvidence, type EchoEvidence, type TrackId, type TrackLoad, type TrackProjection, type WardEvidence,
} from '../../lib/progressTrajectory'

// Progress is trajectory, not analytics. Every value below is projected from records the account already
// owns, through the same repositories the saved-record lists use. Nothing here scores, schedules a review
// or claims competence; see lib/progressTrajectory.ts for the definitions.

// Same destinations the Learn landing uses for these tracks (guarded by tests/progress-trajectory.test.mjs).
const TRACK_UI: Record<TrackId, { accent: string; href: string | null }> = {
  ecg: { accent: 'var(--cv-teal)', href: '/learn/ecg' },
  echo: { accent: 'var(--cv-violet)', href: '/learn/echo' },
  ward: { accent: 'var(--cv-blue)', href: null },
}

const echoRepository = createEchoAccountEventRepository(supabase)
const wardRepository = handoverAccountRepository(supabase)

async function loadEcg(owner: string): Promise<EcgEvidence> {
  const rows = await loadEcgSavedAnswers(owner)
  return { count: rows.length, latestAt: rows[0]?.at ?? null }
}

async function loadEcho(owner: string): Promise<EchoEvidence> {
  const page = await echoRepository.historyPage(owner)
  return { count: page.events.length, hasMore: page.nextCursor !== null, latestAt: page.events[0]?.observedAt ?? null }
}

async function loadWard(owner: string): Promise<WardEvidence | null> {
  const row = await wardRepository.latest(owner)
  if (!row) return null
  const session = restoreHandover(owner, row)
  return { stage: session.stage, title: scenarioFor(session).title, actionCount: session.events.length }
}

/** A null loader means this account type has no saved records for the track (not an empty history). */
function useTrackLoad<T>(owner: string, loader: ((owner: string) => Promise<T>) | null) {
  const [state, setState] = useState<TrackLoad<T>>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!loader) return
    let active = true
    loader(owner).then(data => { if (active) setState({ state: 'ready', data }) }).catch(() => { if (active) setState({ state: 'error' }) })
    return () => { active = false }
  }, [owner, loader, attempt])
  const retry = useCallback(() => { setState({ state: 'loading' }); setAttempt(value => value + 1) }, [])
  const resolved: TrackLoad<T> = loader ? state : { state: 'unsupported' }
  return [resolved, retry] as const
}

type Props = { includeWard: boolean; onOpenWard: () => void; onOpenLearn: () => void }

export default function ProgressTrajectory(props: Props) {
  return <AuthGate allowGuest={false}>{user => <Trajectory key={user.id} owner={user.id} {...props} />}</AuthGate>
}

function Trajectory({ owner, includeWard, onOpenWard, onOpenLearn }: Props & { owner: string }) {
  const [ecg, retryEcg] = useTrackLoad(owner, loadEcg)
  const [echo, retryEcho] = useTrackLoad(owner, loadEcho)
  const [ward, retryWard] = useTrackLoad(owner, includeWard ? loadWard : null)
  const rows = [projectEcg(ecg), projectEcho(echo), projectWard(ward)]
  const retry: Record<TrackId, () => void> = { ecg: retryEcg, echo: retryEcho, ward: retryWard }
  const summary = summarize(rows)
  const metric = (value: number, of: number) => summary.status === 'ready' ? `${value} of ${of}` : summary.status === 'loading' ? '…' : '—'

  return (
    <>
      <section className="cv-progress-summary" aria-labelledby="progress-summary-title">
        <h2 id="progress-summary-title" className="cv-progress-eyebrow">YOUR RECORD</h2>
        <dl data-progress-metrics>
          <div>
            <dt>Tracks with saved activity</dt>
            <dd>{metric(summary.activityTracks, summary.activityOf)}{summary.status === 'unavailable' && <span className="cv-progress-sr"> unavailable</span>}</dd>
          </div>
          <div>
            <dt>Tracks with scored attempts</dt>
            <dd>{metric(summary.scoredTracks, summary.scoredOf)}{summary.status === 'unavailable' && <span className="cv-progress-sr"> unavailable</span>}</dd>
          </div>
        </dl>
      </section>

      <section className="cv-progress-tracks" aria-labelledby="progress-tracks-title">
        <h2 id="progress-tracks-title" className="cv-progress-eyebrow">BY TRACK</h2>
        <ul>
          {rows.map(row => <TrackRow key={row.id} row={row} onRetry={retry[row.id]} onOpenWard={onOpenWard} />)}
        </ul>
        <p className="cv-progress-note">Saved activity and attempt scores are not competency levels. A competency level needs its own verified evidence.</p>
      </section>

      {/* No review-scheduling data exists in this release, so this preserves the section's role with an honest next action. */}
      <section className="cv-progress-next" aria-labelledby="progress-next-title">
        <div className="cv-progress-eyebrow">NEXT REVIEW</div>
        <h2 id="progress-next-title">No review scheduled</h2>
        <p>Nothing is due for review. Keep practising to build your record.</p>
        <button type="button" onClick={onOpenLearn}>Continue in Learn →</button>
      </section>
    </>
  )
}

function TrackRow({ row, onRetry, onOpenWard }: { row: TrackProjection; onRetry: () => void; onOpenWard: () => void }) {
  const ui = TRACK_UI[row.id]
  const style = { '--track-accent': ui.accent } as CSSProperties
  return (
    <li className="cv-progress-track" style={style} data-evidence={row.evidence}>
      <div className="cv-progress-track-head">
        <h3>{row.title}</h3>
        <span className="cv-progress-status">{row.status}</span>
      </div>
      <p className="cv-progress-track-text">
        {row.detail}
        {row.latestAt && <> · Latest <time dateTime={row.latestAt}>{new Date(row.latestAt).toLocaleDateString()}</time></>}
      </p>
      {row.stage && <>
        <progress value={row.stage.step} max={row.stage.of} aria-label={`${row.title} practice step`} aria-valuetext={`Step ${row.stage.step} of ${row.stage.of}: ${row.stage.label}`} />
        <p className="cv-progress-track-stage">Step {row.stage.step} of {row.stage.of} · {row.stage.label}</p>
      </>}
      <div className="cv-progress-track-actions">
        {row.evidence === 'unavailable' && <button type="button" onClick={onRetry}>Retry</button>}
        {ui.href
          ? <Link href={ui.href}>{row.action} →</Link>
          : <button type="button" onClick={onOpenWard}>{row.action} →</button>}
      </div>
    </li>
  )
}
