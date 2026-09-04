'use client'

import { Player } from '@remotion/player'
import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  CLINICAL_MEDIA_FORMATS,
  compileLearnerClinicalMedia,
  type ClinicalMediaFormat,
  type ClinicalMediaLocale,
} from '../../lib/clinicalMedia/clinicalMediaCompiler'
import DoorToEcgMediaComposition from './DoorToEcgMediaComposition'
import styles from './clinical-media.module.css'

const FORMAT_ORDER: ClinicalMediaFormat[] = ['landscape', 'portrait', 'square']

const HEADER_COPY = {
  en: {
    title: 'Clinical Studio · ECG learning engine',
    body: 'The learner surface compiles one governed synthetic ECG source into an export-ready composition. ECHO remains internal until real media clears rights and clinical review.',
    language: 'Preview language',
    ratio: 'Preview aspect ratio',
    draft: 'Draft: synthetic, non-clinical and human-review gated.',
    reduced: 'Reduced motion active',
  },
  ar: {
    title: 'الاستوديو السريري · محرك تعلّم تخطيط القلب',
    body: 'تعرض واجهة المتعلّم حاليًا مصدر تخطيط قلب اصطناعيًا محكومًا واحدًا. يبقى ECHO داخليًا حتى تجتاز الوسائط الحقيقية مراجعة الحقوق والمراجعة السريرية.',
    language: 'لغة المعاينة',
    ratio: 'نسبة أبعاد المعاينة',
    draft: 'مسودة: بيانات اصطناعية غير سريرية وتتطلب مراجعة بشرية.',
    reduced: 'وضع تقليل الحركة مفعّل',
  },
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
  const [locale, setLocale] = useState<ClinicalMediaLocale>('en')
  const [format, setFormat] = useState<ClinicalMediaFormat>('landscape')
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    readReducedMotionPreference,
    readServerReducedMotionPreference,
  )
  const media = useMemo(() => compileLearnerClinicalMedia(locale, format), [format, locale])
  const copy = HEADER_COPY[locale]

  const playerClass = [
    styles.player,
    format === 'portrait' ? styles.portraitPlayer : '',
    format === 'square' ? styles.squarePlayer : '',
  ].filter(Boolean).join(' ')

  return (
    <section className={styles.previewShell} aria-labelledby="clinical-media-preview-title" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.previewHeader}>
        <div>
          <h2 id="clinical-media-preview-title">{copy.title}</h2>
          <p>{copy.body}</p>
        </div>
        <div className={styles.previewControls}>
          <div aria-label={copy.language} className={styles.controlGroup} role="group">
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
          <div aria-label={copy.ratio} className={styles.controlGroup} role="group">
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
          key={media.compilationId}
          loop={false}
          showVolumeControls={false}
          spaceKeyToPlayOrPause
        />
      </div>

      <div className={styles.previewFooter}>
        <span><strong>{copy.draft}</strong>{reducedMotion ? ` · ${copy.reduced}` : ''}</span>
        <span>{media.durationInFrames / media.fps}s · {media.width}×{media.height} · {media.compilationId}</span>
      </div>
    </section>
  )
}
