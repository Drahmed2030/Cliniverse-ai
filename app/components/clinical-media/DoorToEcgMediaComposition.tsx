'use client'

import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { Check } from 'lucide-react'
import {
  compileClinicalMedia,
  type ClinicalMediaFormat,
  type ClinicalMediaLocale,
  type CompiledClinicalMediaScene,
} from '../../lib/clinicalMedia/clinicalMediaCompiler'
import { DOOR_TO_ECG_SYNTHETIC_LEADS } from '../../lib/cardiology/ecgWaveform'
import styles from './clinical-media.module.css'

export interface DoorToEcgMediaCompositionProps {
  locale: ClinicalMediaLocale
  format: ClinicalMediaFormat
  reducedMotion?: boolean
}

export default function DoorToEcgMediaComposition({
  locale,
  format,
  reducedMotion = false,
}: DoorToEcgMediaCompositionProps) {
  const frame = useCurrentFrame()
  const media = compileClinicalMedia(locale, format)
  const scene = media.scenes.find(item => frame >= item.startFrame && frame < item.endFrame)
    ?? media.scenes[media.scenes.length - 1]
  const localFrame = Math.max(0, frame - scene.startFrame)
  const enter = reducedMotion
    ? 1
    : interpolate(localFrame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const progress = reducedMotion ? 100 : ((frame + 1) / media.durationInFrames) * 100
  const frameClass = [styles.frame, styles[format], media.direction === 'rtl' ? styles.rtl : ''].filter(Boolean).join(' ')

  return (
    <AbsoluteFill className={frameClass} dir={media.direction}>
      <header className={styles.brandRow}>
        <div className={styles.brandLockup}>
          <span aria-hidden="true" className={styles.brandMark}>C</span>
          <span>CLINIVERSE AI · BY NEURAOPS</span>
        </div>
        <span className={styles.reviewBadge}>{locale === 'ar' ? 'مسودة للمراجعة البشرية' : 'Human review draft'}</span>
      </header>

      <section
        className={styles.scene}
        style={{ opacity: enter, transform: `translateY(${reducedMotion ? 0 : (1 - enter) * 18}px)` }}
      >
        <div className={styles.copy}>
          <p className={styles.kicker}>{scene.kicker}</p>
          <h2>{scene.title}</h2>
          <p>{scene.body}</p>
        </div>
        <SceneVisual locale={locale} localFrame={localFrame} reducedMotion={reducedMotion} scene={scene} />
      </section>

      <footer className={styles.footerRow}>
        <span>{locale === 'ar' ? 'بيانات اصطناعية · للتعليم فقط' : 'Synthetic data · Education only'}</span>
        <div aria-hidden="true" className={styles.progress}><span style={{ width: `${progress}%` }} /></div>
        <span>{media.assetVersion}</span>
      </footer>
    </AbsoluteFill>
  )
}

function SceneVisual({
  scene,
  locale,
  localFrame,
  reducedMotion,
}: {
  scene: CompiledClinicalMediaScene
  locale: ClinicalMediaLocale
  localFrame: number
  reducedMotion: boolean
}) {
  if (scene.id === 'waveform-inspection') {
    const traceProgress = reducedMotion
      ? 1
      : interpolate(localFrame, [8, 105], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

    return (
      <div className={`${styles.visual} ${styles.waveformStack}`}>
        {DOOR_TO_ECG_SYNTHETIC_LEADS.map(lead => (
          <div className={styles.waveformLead} key={lead.id}>
            <strong>{lead.id}</strong>
            <svg aria-label={lead.accessibleSummary} preserveAspectRatio="none" role="img" viewBox="0 0 640 108">
              <path
                className={styles.waveformTrace}
                d={lead.path}
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: 1 - traceProgress }}
              />
            </svg>
          </div>
        ))}
      </div>
    )
  }

  if (scene.id === 'evidence-check') {
    const evidence = locale === 'ar'
      ? [
          ['08:12', 'وقت المصدر محفوظ'],
          ['SIM-ECG', 'مصدر اصطناعي موثّق'],
          ['SVG', 'الموجة واضحة للمراجعة'],
        ]
      : [
          ['08:12', 'Source timestamp captured'],
          ['SIM-ECG', 'Synthetic provenance recorded'],
          ['SVG', 'Waveform readable at review scale'],
        ]

    return (
      <div className={`${styles.visual} ${styles.evidenceList}`}>
        {evidence.map(([value, label]) => (
          <div className={styles.evidenceItem} key={value}>
            <span aria-hidden="true" className={styles.evidenceIcon}><Check size={24} strokeWidth={3} /></span>
            <div><strong>{value}</strong><span>{label}</span></div>
          </div>
        ))}
      </div>
    )
  }

  if (scene.id === 'reassessment') {
    return (
      <div className={styles.visual}>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparison}>
            <span>{locale === 'ar' ? 'المحاكاة الأساسية' : 'Baseline replay'}</span>
            <strong>12 min</strong>
          </div>
          <div className={styles.comparison}>
            <span>{locale === 'ar' ? 'بعد التدريب' : 'Post-training'}</span>
            <strong>8 min</strong>
          </div>
        </div>
        <div className={styles.humanGate}>
          {locale === 'ar' ? 'تبقى بوابة السلامة تحت المراجعة البشرية' : 'Safety gate remains under human review'}
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.visual} ${styles.metricVisual}`}>
      <span className={styles.metricLabel}>{locale === 'ar' ? 'الفاصل الاصطناعي المسجّل' : 'Recorded synthetic interval'}</span>
      <div className={styles.metricValue}><strong>12</strong><span>{locale === 'ar' ? 'دقيقة' : 'minutes'}</span></div>
      <div aria-hidden="true" className={styles.metricTrack}><span /></div>
      <div className={styles.threshold}>
        <span>{locale === 'ar' ? 'الهدف التدريبي' : 'Training target'}</span>
        <strong>≤ 10 min</strong>
      </div>
    </div>
  )
}
