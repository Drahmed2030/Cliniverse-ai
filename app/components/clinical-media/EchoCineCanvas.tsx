'use client'

import { Pause, Play, StepBack, StepForward } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createEchoCineFrame,
  describeEchoCineFrame,
  drawEchoCineFrame,
  ECHO_CINE_CYCLE_FRAMES,
  ECHO_CINE_FPS,
  ECHO_CINE_REDUCED_MOTION_FRAME,
  wrapEchoCineFrame,
  type EchoCineLocale,
} from '../../lib/clinicalMedia/echoCinePhantom'
import styles from './clinical-media.module.css'

export interface EchoCineCanvasProps {
  locale: EchoCineLocale
  reducedMotion: boolean
}

const COPY = {
  en: {
    title: 'Interactive synthetic cine phantom',
    play: 'Play synthetic cine loop',
    pause: 'Pause synthetic cine loop',
    previous: 'Previous frame',
    next: 'Next frame',
    scrubber: 'Synthetic cine frame',
    reduced: 'Reduced motion is on. Automatic playback is disabled; frame stepping remains available.',
    phase: 'Motion phase',
    frame: 'Frame',
  },
  ar: {
    title: 'نموذج حركة اصطناعي تفاعلي',
    play: 'تشغيل دورة الحركة الاصطناعية',
    pause: 'إيقاف دورة الحركة الاصطناعية',
    previous: 'الإطار السابق',
    next: 'الإطار التالي',
    scrubber: 'إطار الحركة الاصطناعية',
    reduced: 'وضع تقليل الحركة مفعّل. التشغيل التلقائي معطّل، ويمكن التنقل بين الإطارات يدويًا.',
    phase: 'مرحلة الحركة',
    frame: 'الإطار',
  },
} as const

const PHASE_LABELS = {
  en: {
    'inward-motion': 'Inward motion',
    'turning-point': 'Turning point',
    'outward-motion': 'Outward motion',
  },
  ar: {
    'inward-motion': 'حركة للداخل',
    'turning-point': 'نقطة التحوّل',
    'outward-motion': 'حركة للخارج',
  },
} as const

export default function EchoCineCanvas({ locale, reducedMotion }: EchoCineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [frameIndex, setFrameIndex] = useState<number>(ECHO_CINE_REDUCED_MOTION_FRAME)
  const [playing, setPlaying] = useState(false)
  const frame = useMemo(() => createEchoCineFrame(frameIndex), [frameIndex])
  const description = describeEchoCineFrame(frame, locale)
  const copy = COPY[locale]
  const isPlaying = playing && !reducedMotion

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    drawEchoCineFrame(context, canvas.width, canvas.height, frame)
  }, [frame])

  useEffect(() => {
    if (!isPlaying) return
    const frameDuration = 1_000 / ECHO_CINE_FPS
    let previousTimestamp: number | null = null
    let remainder = 0

    const advance = (timestamp: number) => {
      if (previousTimestamp !== null) {
        remainder += timestamp - previousTimestamp
        const elapsedFrames = Math.floor(remainder / frameDuration)
        if (elapsedFrames > 0) {
          remainder -= elapsedFrames * frameDuration
          setFrameIndex(current => wrapEchoCineFrame(current + elapsedFrames))
        }
      }
      previousTimestamp = timestamp
      animationFrameRef.current = window.requestAnimationFrame(advance)
    }

    animationFrameRef.current = window.requestAnimationFrame(advance)
    return () => {
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [isPlaying])

  function selectFrame(nextFrame: number) {
    setPlaying(false)
    setFrameIndex(wrapEchoCineFrame(nextFrame))
  }

  return (
    <section className={styles.cineWorkspace} aria-labelledby="echo-cine-canvas-title" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.cineCanvasHeader}>
        <h3 id="echo-cine-canvas-title">{copy.title}</h3>
        <span>{copy.frame} {frameIndex + 1}/{ECHO_CINE_CYCLE_FRAMES}</span>
      </div>

      <div className={styles.cineCanvasFrame}>
        <canvas
          aria-label={description}
          height={540}
          ref={canvasRef}
          role="img"
          width={720}
        >
          {description}
        </canvas>
        <div className={styles.cinePhaseBadge}>
          <span>{copy.phase}</span>
          <strong>{PHASE_LABELS[locale][frame.phase]}</strong>
        </div>
      </div>

      <div className={styles.cineTransport}>
        <button aria-label={copy.previous} onClick={() => selectFrame(frameIndex - 1)} type="button">
          <StepBack aria-hidden="true" size={19} />
        </button>
        <button
          aria-label={isPlaying ? copy.pause : copy.play}
          aria-pressed={isPlaying}
          className={styles.cinePlayButton}
          disabled={reducedMotion}
          onClick={() => setPlaying(current => !current)}
          type="button"
        >
          {isPlaying ? <Pause aria-hidden="true" size={20} /> : <Play aria-hidden="true" size={20} />}
          <span>{isPlaying ? copy.pause : copy.play}</span>
        </button>
        <button aria-label={copy.next} onClick={() => selectFrame(frameIndex + 1)} type="button">
          <StepForward aria-hidden="true" size={19} />
        </button>
        <input
          aria-label={copy.scrubber}
          max={ECHO_CINE_CYCLE_FRAMES - 1}
          min={0}
          onChange={event => selectFrame(Number(event.currentTarget.value))}
          type="range"
          value={frameIndex}
        />
      </div>

      <p aria-live={isPlaying ? 'off' : 'polite'} className={styles.cineDescription}>{description}</p>
      {reducedMotion ? <p className={styles.reducedMotionNote} role="note">{copy.reduced}</p> : null}
    </section>
  )
}
