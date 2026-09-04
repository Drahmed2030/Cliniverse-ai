'use client'

import { Player } from '@remotion/player'
import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  CLINICAL_MEDIA_FORMATS,
  compileClinicalMediaPreview,
  type ClinicalMediaFormat,
  type ClinicalMediaProgram,
} from '../../lib/clinicalMedia/clinicalMediaCompiler'
import DoorToEcgMediaComposition from './DoorToEcgMediaComposition'
import EchoA4cLesson from './EchoA4cLesson'
import EchoA4cMediaComposition from './EchoA4cMediaComposition'
import styles from './clinical-media.module.css'

const FORMAT_ORDER: ClinicalMediaFormat[] = ['landscape', 'portrait', 'square']
const PROGRAM_ORDER = ['echo-a4c-normal', 'door-to-ecg'] as const satisfies readonly ClinicalMediaProgram[]

const PROGRAM_COPY = {
  'echo-a4c-normal': {
    label: 'ECHO · Real A4C',
    title: 'Clinical Studio · licensed real ECHO cine',
    body: 'A source-labelled normal A4C loop now drives the Preview lesson, Remotion composition, assessment and session-only receipt. The synthetic ECHO phantom remains internal.',
    status: 'Licensed real cine · Preview-only clinical copy review.',
  },
  'door-to-ecg': {
    label: 'ECG · Current prototype',
    title: 'Clinical Studio · ECG learning engine',
    body: 'The current ECG program still uses a governed synthetic signal. Real calibrated PhysioNet cases are now defined as the next independent ingestion tranche.',
    status: 'Synthetic ECG · human-review draft.',
  },
} as const satisfies Record<typeof PROGRAM_ORDER[number], {
  label: string
  title: string
  body: string
  status: string
}>

const CONTROL_COPY = {
  program: 'Clinical program',
  ratio: 'Preview aspect ratio',
  reduced: 'Reduced Motion active',
} as const

function subscribeToReducedMotion(onStoreChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onStoreChange)
  return () => query.removeEventListener('change', onStoreChange)
}

function readReducedMotionPreference() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function readServerReducedMotionPreference() {
  return false
}

export default function ClinicalMediaPreview() {
  const [program, setProgram] = useState<typeof PROGRAM_ORDER[number]>('echo-a4c-normal')
  const [format, setFormat] = useState<ClinicalMediaFormat>('landscape')
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    readReducedMotionPreference,
    readServerReducedMotionPreference,
  )
  const media = useMemo(() => compileClinicalMediaPreview('en', format, program), [format, program])
  const copy = PROGRAM_COPY[program]
  const Composition = program === 'echo-a4c-normal' ? EchoA4cMediaComposition : DoorToEcgMediaComposition

  const playerClass = [
    styles.player,
    format === 'portrait' ? styles.portraitPlayer : '',
    format === 'square' ? styles.squarePlayer : '',
  ].filter(Boolean).join(' ')

  return (
    <section className={styles.previewShell} aria-labelledby="clinical-media-preview-title" dir="ltr">
      <div className={styles.previewHeader}>
        <div>
          <h2 id="clinical-media-preview-title">{copy.title}</h2>
          <p>{copy.body}</p>
        </div>
        <div className={styles.previewControls}>
          <div aria-label={CONTROL_COPY.program} className={`${styles.controlGroup} ${styles.programControl}`} role="group">
            {PROGRAM_ORDER.map(option => (
              <button
                aria-pressed={program === option}
                className={`${styles.controlButton} ${program === option ? styles.activeControl : ''}`}
                key={option}
                onClick={() => setProgram(option)}
                type="button"
              >
                {PROGRAM_COPY[option].label}
              </button>
            ))}
          </div>
          <div aria-label={CONTROL_COPY.ratio} className={styles.controlGroup} role="group">
            {FORMAT_ORDER.map(option => (
              <button
                aria-pressed={format === option}
                className={`${styles.controlButton} ${format === option ? styles.activeControl : ''}`}
                key={option}
                onClick={() => setFormat(option)}
                type="button"
              >
                {CLINICAL_MEDIA_FORMATS[option].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.playerStage}>
        <Player
          autoPlay={false}
          className={playerClass}
          clickToPlay
          component={Composition}
          compositionHeight={media.height}
          compositionWidth={media.width}
          controls
          durationInFrames={media.durationInFrames}
          fps={media.fps}
          inputProps={{ locale: 'en' as const, format, reducedMotion }}
          key={media.compilationId}
          loop={false}
          showVolumeControls={false}
          spaceKeyToPlayOrPause
        />
      </div>

      <div className={styles.previewFooter}>
        <span><strong>{copy.status}</strong>{reducedMotion ? ` · ${CONTROL_COPY.reduced}` : ''}</span>
        <span>{media.durationInFrames / media.fps}s · {media.width}×{media.height} · {media.compilationId}</span>
      </div>

      {program === 'echo-a4c-normal' ? <EchoA4cLesson reducedMotion={reducedMotion} /> : null}
    </section>
  )
}
