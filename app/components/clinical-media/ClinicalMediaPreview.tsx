'use client'

import { Player } from '@remotion/player'
import { useEffect, useMemo, useState } from 'react'
import {
  CLINICAL_MEDIA_FORMATS,
  compileClinicalMedia,
  type ClinicalMediaFormat,
  type ClinicalMediaLocale,
} from '../../lib/clinicalMedia/clinicalMediaCompiler'
import DoorToEcgMediaComposition from './DoorToEcgMediaComposition'
import styles from './clinical-media.module.css'

const FORMAT_ORDER: ClinicalMediaFormat[] = ['landscape', 'portrait', 'square']

export default function ClinicalMediaPreview() {
  const [locale, setLocale] = useState<ClinicalMediaLocale>('en')
  const [format, setFormat] = useState<ClinicalMediaFormat>('landscape')
  const [reducedMotion, setReducedMotion] = useState(false)
  const media = useMemo(() => compileClinicalMedia(locale, format), [format, locale])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(query.matches)
    syncPreference()
    query.addEventListener('change', syncPreference)
    return () => query.removeEventListener('change', syncPreference)
  }, [])

  const playerClass = [
    styles.player,
    format === 'portrait' ? styles.portraitPlayer : '',
    format === 'square' ? styles.squarePlayer : '',
  ].filter(Boolean).join(' ')

  return (
    <section className={styles.previewShell} aria-labelledby="clinical-media-preview-title">
      <div className={styles.previewHeader}>
        <div>
          <h2 id="clinical-media-preview-title">One source · four governed scenes</h2>
          <p>Interactive lesson preview and export-ready React composition.</p>
        </div>
        <div className={styles.previewControls}>
          <div aria-label="Preview language" className={styles.controlGroup} role="group">
            {(['en', 'ar'] as const).map(option => (
              <button
                aria-pressed={locale === option}
                className={`${styles.controlButton} ${locale === option ? styles.activeControl : ''}`}
                key={option}
                onClick={() => setLocale(option)}
                type="button"
              >
                {option === 'en' ? 'EN' : 'عربي'}
              </button>
            ))}
          </div>
          <div aria-label="Preview aspect ratio" className={styles.controlGroup} role="group">
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
          component={DoorToEcgMediaComposition}
          compositionHeight={media.height}
          compositionWidth={media.width}
          controls
          durationInFrames={media.durationInFrames}
          fps={media.fps}
          inputProps={{ locale, format, reducedMotion }}
          loop={false}
          showVolumeControls={false}
          spaceKeyToPlayOrPause
        />
      </div>

      <div className={styles.previewFooter}>
        <span><strong>Draft:</strong> synthetic, non-clinical and human-review gated.</span>
        <span>{media.durationInFrames / media.fps}s · {media.width}×{media.height} · {media.compilationId}</span>
      </div>
    </section>
  )
}
