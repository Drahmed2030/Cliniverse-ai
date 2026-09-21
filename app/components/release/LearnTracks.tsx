'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'

// Learn is PRACTICE: three tracks, each opening an existing learner-facing destination.
// ECG opens the governed ECG workspace (/learn/ecg); Echo opens its existing learner destination. No new engine.
// Ward opens the existing Ward workspace in place. No resume/review metadata is shown because
// no per-track real state is available here; nothing user-specific is invented.
const TRACKS = [
  {
    id: 'ecg',
    verb: 'INTERPRET',
    title: 'ECG',
    description: 'Read the full tracing, commit an interpretation, then review the reasoning.',
    accent: 'var(--cv-teal)',
    href: '/learn/ecg',
  },
  {
    id: 'echo',
    verb: 'OBSERVE',
    title: 'Echo',
    description: 'Start with the cine, organize findings, then assign meaning.',
    accent: 'var(--cv-violet)',
    href: '/labs/echo-preview',
  },
  {
    id: 'ward',
    verb: 'DECIDE',
    title: 'Ward',
    description: 'Follow a changing patient state and see the consequence of each decision.',
    accent: 'var(--cv-blue)',
    href: null,
  },
] as const

export default function LearnTracks({ onOpenWard }: { onOpenWard: () => void }) {
  return (
    <ul data-commercial-surface="learn" data-commercial-learn-surface aria-label="Practice tracks">
      {TRACKS.map(track => {
        const body = (
          <>
            <span>
              <span className="cv-learn-track-verb">{track.verb}</span>
              <span className="cv-learn-track-title">{track.title}</span>
              <span className="cv-learn-track-text">{track.description}</span>
            </span>
            <span className="cv-learn-track-go" aria-hidden="true">→</span>
          </>
        )
        const style = { '--track-accent': track.accent } as CSSProperties
        return (
          <li key={track.id}>
            {track.href
              ? <Link className="cv-learn-track" href={track.href} style={style}>{body}</Link>
              : <button type="button" className="cv-learn-track" onClick={onOpenWard} style={style}>{body}</button>}
          </li>
        )
      })}
    </ul>
  )
}
