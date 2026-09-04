'use client'

import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import {
  createEchoCineFrame,
  describeEchoCineFrame,
  ECHO_CINE_REDUCED_MOTION_FRAME,
  wrapEchoCineFrame,
  type EchoCineFrame,
} from '../../lib/clinicalMedia/echoCinePhantom'
import {
  compileClinicalMedia,
  type ClinicalMediaFormat,
  type ClinicalMediaLocale,
} from '../../lib/clinicalMedia/clinicalMediaCompiler'
import styles from './clinical-media.module.css'

export interface EchoMotionMediaCompositionProps {
  locale: ClinicalMediaLocale
  format: ClinicalMediaFormat
  reducedMotion?: boolean
}

const PHASE_LABELS = {
  en: {
    'inward-motion': 'INWARD MOTION',
    'turning-point': 'TURNING POINT',
    'outward-motion': 'OUTWARD MOTION',
  },
  ar: {
    'inward-motion': 'حركة للداخل',
    'turning-point': 'نقطة التحوّل',
    'outward-motion': 'حركة للخارج',
  },
} as const

export default function EchoMotionMediaComposition({
  locale,
  format,
  reducedMotion = false,
}: EchoMotionMediaCompositionProps) {
  const frame = useCurrentFrame()
  const media = compileClinicalMedia(locale, format, 'echo-motion-orientation')
  const scene = media.scenes.find(item => frame >= item.startFrame && frame < item.endFrame)
    ?? media.scenes[media.scenes.length - 1]
  const localFrame = Math.max(0, frame - scene.startFrame)
  const enter = reducedMotion
    ? 1
    : interpolate(localFrame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const progress = reducedMotion ? 100 : ((frame + 1) / media.durationInFrames) * 100
  const cineFrame = createEchoCineFrame(
    reducedMotion ? ECHO_CINE_REDUCED_MOTION_FRAME : wrapEchoCineFrame(frame),
  )
  const frameClass = [styles.frame, styles[format], media.direction === 'rtl' ? styles.rtl : ''].filter(Boolean).join(' ')

  return (
    <AbsoluteFill className={frameClass} dir={media.direction}>
      <header className={styles.brandRow}>
        <div className={styles.brandLockup}>
          <span aria-hidden="true" className={styles.brandMark}>C</span>
          <span>CLINIVERSE AI · ECHO CINE LAB</span>
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
        <div className={`${styles.visual} ${styles.echoCompositionVisual}`}>
          <EchoPhantomSvg frame={cineFrame} locale={locale} />
          <div className={styles.echoCompositionMeta}>
            <span>{locale === 'ar' ? 'تسلسل إطارات اصطناعي' : 'Synthetic frame sequence'}</span>
            <strong>{PHASE_LABELS[locale][cineFrame.phase]}</strong>
          </div>
        </div>
      </section>

      <footer className={styles.footerRow}>
        <span>{locale === 'ar' ? 'ليس فحص إيكو · للتعليم فقط' : 'Not an echocardiogram · Education only'}</span>
        <div aria-hidden="true" className={styles.progress}><span style={{ width: `${progress}%` }} /></div>
        <span>{media.assetVersion}</span>
      </footer>
    </AbsoluteFill>
  )
}

function EchoPhantomSvg({ frame, locale }: { frame: EchoCineFrame; locale: ClinicalMediaLocale }) {
  const outer = ellipseProps(frame.outerContour)
  const inner = ellipseProps(frame.innerContour)

  return (
    <svg
      aria-label={describeEchoCineFrame(frame, locale)}
      className={styles.echoCompositionSvg}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      viewBox="0 0 720 540"
    >
      <defs>
        <radialGradient id="echo-cine-field" cx="50%" cy="42%" r="64%">
          <stop offset="0%" stopColor="#2c4057" />
          <stop offset="58%" stopColor="#111c2d" />
          <stop offset="100%" stopColor="#060b14" />
        </radialGradient>
        <clipPath id="echo-cine-sector">
          <path d="M360 18 L58 508 Q360 552 662 508 Z" />
        </clipPath>
      </defs>
      <rect fill="#030712" height="540" width="720" />
      <g clipPath="url(#echo-cine-sector)">
        <rect fill="url(#echo-cine-field)" height="540" width="720" />
        {[1, 2, 3, 4, 5].map(ring => (
          <circle
            cx="360"
            cy="18"
            fill="none"
            key={ring}
            opacity="0.12"
            r={ring * 92}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
        ))}
        {frame.speckles.map((speckle, index) => (
          <circle
            cx={speckle.x * 720}
            cy={speckle.y * 540}
            fill="#e0f2fe"
            key={`${index}-${speckle.radius}`}
            opacity={speckle.opacity}
            r={Math.max(1, speckle.radius * 720)}
          />
        ))}
        <ellipse {...outer} fill="none" stroke="#bae6fd" strokeOpacity="0.82" strokeWidth="3" />
        <ellipse {...inner} fill="rgba(6, 182, 212, 0.08)" stroke="#67e8f9" strokeWidth="4" />
      </g>
      <path d="M360 18 L58 508 Q360 552 662 508 Z" fill="none" stroke="#67e8f9" strokeOpacity="0.34" />
    </svg>
  )
}

function ellipseProps(contour: EchoCineFrame['innerContour']) {
  const cx = contour.cx * 720
  const cy = contour.cy * 540
  return {
    cx,
    cy,
    rx: contour.rx * 720,
    ry: contour.ry * 540,
    transform: `rotate(${contour.rotation * 180 / Math.PI} ${cx} ${cy})`,
  }
}
