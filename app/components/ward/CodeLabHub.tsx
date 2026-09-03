'use client'

import { ArrowLeft, Check, ChevronRight, LockKeyhole } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  EMPTY_CODELAB_PROGRESS,
  parseCodeLabProgress,
  TRAINING_TRACKS,
  type CodeLabProgress,
  type TrainingTrack,
} from '../../lib/codelab/trainingContent'
import TrainingLessonPlayer from './TrainingLessonPlayer'
import styles from './code-lab.module.css'

interface CodeLabHubProps {
  isPro: boolean
  onUpgrade: () => void
  onBack: () => void
}

const PROGRESS_KEY = 'cliniverse_codelab_progress_v1'
const LEGACY_PROGRESS_KEY = 'codelab_bls_progress'

export default function CodeLabHub({ isPro, onUpgrade, onBack }: CodeLabHubProps) {
  const [progress, setProgress] = useState<CodeLabProgress>(EMPTY_CODELAB_PROGRESS)
  const [activeTrack, setActiveTrack] = useState<TrainingTrack>('bls')
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(parseCodeLabProgress(localStorage.getItem(PROGRESS_KEY), localStorage.getItem(LEGACY_PROGRESS_KEY)))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const track = TRAINING_TRACKS[activeTrack]
  const activeLesson = useMemo(
    () => track.lessons.find(lesson => lesson.id === activeLessonId) ?? null,
    [activeLessonId, track.lessons],
  )
  const completedIds = progress.completedByTrack[activeTrack]
  const progressPercent = Math.round((completedIds.length / Math.max(track.lessons.length, 1)) * 100)

  function completeLesson(lessonId: string) {
    const next: CodeLabProgress = {
      schemaVersion: 1,
      completedByTrack: {
        ...progress.completedByTrack,
        [activeTrack]: [...new Set([...completedIds, lessonId])],
      },
    }
    setProgress(next)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
    setActiveLessonId(null)
  }

  if (activeLesson) {
    return (
      <TrainingLessonPlayer
        lesson={activeLesson}
        totalLessons={track.lessons.length}
        onBack={() => setActiveLessonId(null)}
        onComplete={() => completeLesson(activeLesson.id)}
      />
    )
  }

  return (
    <main className={styles.shell}>
      <div className={styles.content}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={onBack} type="button">
            <ArrowLeft aria-hidden="true" size={18} /> Ward
          </button>
          <span className={styles.badge}>{isPro ? 'PRO' : 'FREE'}</span>
        </header>

        <p className={styles.eyebrow}>CLINIVERSE TRAINING STUDIO</p>
        <h1 className={styles.title}>Code Lab</h1>
        <p className={styles.subtitle}>
          One governed training player for BLS and ACLS. Educational practice only;
          certification and real-patient decisions remain outside this experience.
        </p>

        <div className={styles.trackTabs} aria-label="Training track">
          {(Object.keys(TRAINING_TRACKS) as TrainingTrack[]).map(trackId => {
            const item = TRAINING_TRACKS[trackId]
            return (
              <button
                aria-pressed={activeTrack === trackId}
                className={`${styles.trackButton} ${activeTrack === trackId ? styles.trackActive : ''}`}
                key={trackId}
                onClick={() => { setActiveTrack(trackId); setActiveLessonId(null) }}
                type="button"
              >
                <strong>{item.shortLabel} · {item.label}</strong>
                <span>{item.description}</span>
              </button>
            )
          })}
        </div>

        <section className={styles.progressCard} aria-label={`${track.shortLabel} progress`}>
          <div className={styles.progressHeader}>
            <strong>{track.shortLabel} progress</strong>
            <span>{completedIds.length} of {track.lessons.length} · {progressPercent}%</span>
          </div>
          <div aria-label={`${progressPercent}% complete`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={progressPercent} className={styles.progressTrack} role="progressbar">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </section>

        <p className={styles.sectionLabel}>{track.shortLabel} · {track.lessons.length} LESSONS</p>
        <div className={styles.lessonList}>
          {track.lessons.map(lesson => {
            const done = completedIds.includes(lesson.id)
            const locked = !isPro && lesson.order > 2
            return (
              <button
                className={`${styles.lessonButton} ${done ? styles.lessonDone : ''} ${locked ? styles.lessonLocked : ''}`}
                key={lesson.id}
                onClick={() => locked ? onUpgrade() : setActiveLessonId(lesson.id)}
                type="button"
              >
                <span className={styles.lessonRow}>
                  <span className={styles.lessonIdentity}>
                    <span className={styles.lessonIndex} aria-hidden="true">
                      {done ? <Check size={18} /> : locked ? <LockKeyhole size={16} /> : lesson.order}
                    </span>
                    <span className={styles.lessonCopy}>
                      <strong>{lesson.title}</strong>
                      <span>About {lesson.durationMin} min</span>
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" size={18} />
                </span>
              </button>
            )
          })}
        </div>

        {!isPro && (
          <aside className={styles.upgrade}>
            <p>Lessons 1–2 are open. PRO unlocks the complete BLS and ACLS training library.</p>
            <button className={styles.primaryButton} onClick={onUpgrade} type="button">View PRO access</button>
          </aside>
        )}

        <footer className={styles.disclaimer}>{track.lessons[0]?.disclaimer}</footer>
      </div>
    </main>
  )
}
