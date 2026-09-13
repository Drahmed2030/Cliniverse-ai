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
}

export default function LessonProgressSummary({ completedIds, latestTitle, loading, failed, onRetry, onOpen }: Props) {
  const catalogs = [BLS_LESSONS, ACLS_LESSONS]
  const total = catalogs.flat().filter(lesson => completedIds.includes(lesson.id)).length
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
