'use client'

import { BLS_LESSONS } from '../../lib/codelab/blsLessons'
import { ACLS_LESSONS } from '../../lib/codelab/aclsLessons'

type Props = {
  completedIds: string[]
  latestTitle?: string
  loading: boolean
  failed: boolean
  onRetry: () => void
  onOpen: () => void
  /** Today only: three real counts and nothing else (no last-completed line, no Code Lab action). Same data, same states. */
  compact?: boolean
}

export default function LessonProgressSummary({ completedIds, latestTitle, loading, failed, onRetry, onOpen, compact }: Props) {
  const catalogs = [BLS_LESSONS, ACLS_LESSONS]
  const total = catalogs.flat().filter(lesson => completedIds.includes(lesson.id)).length
  if (compact) {
    const metrics = [
      { label: 'Lessons completed', value: String(total) },
      ...catalogs.map(catalog => ({
        label: `${catalog[0].track.toUpperCase()} lessons`,
        value: `${catalog.filter(lesson => completedIds.includes(lesson.id)).length}/${catalog.length}`,
      })),
    ]
    return <section data-learning-summary data-learning-compact aria-labelledby="learning-compact-title">
      <h2 id="learning-compact-title">Your learning · Code Lab</h2>
      {loading ? <p role="status">Loading saved lessons…</p> : failed ? <><p role="status">We couldn’t load your saved lessons. You can retry or continue reading.</p><button type="button" onClick={onRetry}>Retry progress</button></> : <>
        <dl data-learning-metrics>{metrics.map(metric => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl>
      </>}
      <p>Lesson completion reflects your learning record, not clinical certification.</p>
    </section>
  }
  return <section data-learning-summary aria-label="Your Code Lab learning">
    <span style={{ color: 'var(--cv-teal)', fontSize: 12, letterSpacing: '0.1em', fontWeight: 800 }}>YOUR LEARNING · CODE LAB</span>
    <h2>{loading ? 'Your learning, in one place.' : failed ? 'Your progress will be back.' : total ? 'Build on what you know.' : 'Start with the essentials.'}</h2>
    {loading ? <p role="status">Loading saved lessons…</p> : failed ? <><p role="status">We couldn’t load your saved lessons. You can retry or continue reading.</p><button onClick={onRetry}>Retry progress</button></> : <>
      <p>{latestTitle ? `Last completed: ${latestTitle}` : 'Choose a short BLS or ACLS lesson, practise, then check your understanding.'}</p>
      <div data-learning-tracks>{catalogs.map(catalog => {
        const count = catalog.filter(lesson => completedIds.includes(lesson.id)).length
        const track = catalog[0].track.toUpperCase()
        return <article key={track}>
          <strong>{track}</strong><p>{count} of {catalog.length} lessons completed</p>
          <progress aria-label={`${track} completed lessons`} value={count} max={catalog.length} />
        </article>
      })}</div>
    </>}
    <button type="button" onClick={onOpen}>{total && !failed ? 'Continue in Code Lab →' : 'Open Code Lab →'}</button>
    <p style={{ fontSize: 12 }}>Lesson completion reflects your learning record, not clinical certification.</p>
  </section>
}
