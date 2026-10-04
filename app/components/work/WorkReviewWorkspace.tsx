'use client'
import { useEffect, useRef } from 'react'
import type { WorkGateway } from '../../lib/work/contracts'
import { useWorkReview } from '../../lib/work/useWorkReview'
import SurfaceState from '../system/SurfaceState'
import styles from './workReview.module.css'

export default function WorkReviewWorkspace({ gateway }: { gateway: WorkGateway }) {
  const { state, items, busy, recovery, runtime } = useWorkReview(gateway)
  const title = useRef<HTMLHeadingElement>(null)
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const returnFocus = useRef<string | null>(null)
  const sourceRevision = state.kind === 'source' ? state.source.reviewRevision : null
  useEffect(() => {
    if (sourceRevision) runtime.sourceRendered(sourceRevision)
  }, [sourceRevision, runtime])
  useEffect(() => {
    if (state.kind === 'queue' && returnFocus.current) {
      const button = buttons.current.get(returnFocus.current)
      if (button) { button.focus(); returnFocus.current = null }
    } else if (!['checking', 'comparing', 'submitting'].includes(state.kind)) title.current?.focus()
  }, [state.kind, items, recovery?.kind])
  const heading = recovery?.kind === 'recorded' || state.kind === 'recorded' ? 'Review recorded'
    : recovery?.kind === 'uncertain' || state.kind === 'uncertain' ? 'Review outcome uncertain'
    : recovery?.kind === 'not-recorded' ? 'Review was not recorded'
    : state.kind === 'unavailable' ? 'Institution access unavailable'
    : state.kind === 'stale' ? 'Review needs a fresh source'
    : state.kind === 'source' || state.kind === 'submitting' ? 'Source evidence'
    : state.kind === 'detail' ? 'Review the change' : 'What changed'
  const back = () => {
    if ('assignment' in state) returnFocus.current = state.assignment.assignmentId
    void runtime.back()
  }
  const locked = busy || state.kind === 'uncertain' || recovery?.kind === 'uncertain'
  return <section className={styles.workspace} aria-labelledby="work-heading">
    <header className={styles.header}>
      <p className={styles.eyebrow}>Cliniverse · Work</p>
      <h1 id="work-heading" ref={title} tabIndex={-1}>{heading}</h1>
      {'session' in state && <p>{state.session.organizationLabel}</p>}
      <p className={styles.muted}>Review a specific source version. Recording a review does not close a clinical task.</p>
    </header>
    {(state.kind === 'checking' || state.kind === 'comparing') && <SurfaceState kind="loading" title="Checking the current context" detail="Please wait while access and source information are checked." />}
    {state.kind === 'unavailable' && <SurfaceState kind="unavailable" title="Content is hidden" detail="Reconnect or return to the original institution, then check access again." action={<button onClick={() => void runtime.start()}>Check access again</button>} />}
    {!recovery && state.kind === 'queue' && !busy && <div className={styles.stack}>
      {items.length === 0 ? <SurfaceState kind="empty" title="No assigned changes" detail="There are no changes available for review in this context." /> : items.map(item => <button className={styles.assignment} key={item.assignmentId} ref={el => { if (el) buttons.current.set(item.assignmentId, el); else buttons.current.delete(item.assignmentId) }} onClick={() => void runtime.select(item.assignmentId)}>{item.title}</button>)}
    </div>}
    {!recovery && state.kind === 'detail' && <>
      <div className={styles.card}>
        <h2>{state.assignment.title}</h2>
        <dl className={styles.changes}>{state.assignment.changes.map(change => <div key={change.field}>
          <dt>{change.field}</dt><dd><span>Before</span> {change.before ?? 'Not available'}</dd><dd><span>Current</span> {change.current ?? 'Not available'}</dd>
        </div>)}</dl>
        <p className={styles.muted}>Source updated: <time dateTime={state.assignment.sourceUpdatedAt}>{state.assignment.sourceUpdatedAt}</time></p>
      </div>
      <div className={styles.actions}><button disabled={busy} onClick={() => void runtime.openSource()}>Open source evidence</button><button disabled={busy} onClick={back}>Back to changes</button></div>
    </>}
    {!recovery && (state.kind === 'source' || state.kind === 'submitting') && <>
      <article className={styles.card} aria-label="Source content"><p className={styles.source}>{state.source.content}</p></article>
      <p>Opening this source does not confirm that you have reviewed it. Select the button below only after completing your review.</p>
      <div className={styles.actions}><button disabled={busy || state.sourceSeenRevision !== state.assignment.reviewRevision} onClick={() => void runtime.confirm()}>{state.kind === 'submitting' ? 'Recording review…' : 'Record my review'}</button><button disabled={busy} onClick={back}>Back to changes</button></div>
    </>}
    {(state.kind === 'uncertain' || recovery?.kind === 'uncertain') && <SurfaceState kind="partial" title="Confirmation has not arrived" detail="The review may already be recorded. Check its outcome before taking another action." action={<button disabled={busy} onClick={() => void runtime.reconcile()}>Check review outcome</button>} />}
    {state.kind === 'stale' && <SurfaceState kind="stale" title="The reviewed version is no longer current" detail="Reload the assignment and open its source again before reviewing." action={<button disabled={busy} onClick={() => void runtime.select(state.assignment.assignmentId)}>Refresh assignment</button>} />}
    {(state.kind === 'recorded' || recovery?.kind === 'recorded') && <div className={styles.card} role="status"><h2>Review confirmed</h2><p>The clinical task remains open.</p><p className={styles.muted}>This preview uses an in-memory synthetic receipt.</p></div>}
    {recovery?.kind === 'not-recorded' && <SurfaceState kind="read-only" title="No recorded review was found" detail="Refresh the list and review the current source before trying again." />}
    {(state.kind === 'recorded' || (recovery && recovery.kind !== 'uncertain')) && <button disabled={!!locked} onClick={back}>Back to changes</button>}
    <p className={styles.status} role="status" aria-live="polite">{busy ? 'Checking…' : ''}</p>
  </section>
}
