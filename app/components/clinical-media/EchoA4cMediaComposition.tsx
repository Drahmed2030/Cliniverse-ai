'use client'

import { AbsoluteFill, interpolate, Loop, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion'
import {
  compileClinicalMedia,
  type ClinicalMediaFormat,
  type ClinicalMediaLocale,
} from '../../lib/clinicalMedia/clinicalMediaCompiler'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../../lib/clinicalMedia/licensedEchoAsset'
import styles from './clinical-media.module.css'

export interface EchoA4cMediaCompositionProps {
  locale: ClinicalMediaLocale
  format: ClinicalMediaFormat
  reducedMotion?: boolean
}

const SCENE_FACTS: Record<string, string[]> = {
  'source-and-view': ['Real cine frames', 'Apical four-chamber view', 'Source label: normal'],
  'view-landmarks': ['Both atria', 'Both ventricles', 'AV valve planes and septa'],
  'motion-boundary': ['User-controlled playback', 'No EF calculation', 'No pathology exclusion'],
  'rights-and-review': ['CC BY-SA 3.0', 'Acquisition timestamp masked', 'Checksums frozen'],
}

export default function EchoA4cMediaComposition({
  locale,
  format,
  reducedMotion = false,
}: EchoA4cMediaCompositionProps) {
  const frame = useCurrentFrame()
  const media = compileClinicalMedia(locale, format, 'echo-a4c-normal')
  const scene = media.scenes.find(item => frame >= item.startFrame && frame < item.endFrame)
    ?? media.scenes[media.scenes.length - 1]
  const localFrame = Math.max(0, frame - scene.startFrame)
  const enter = reducedMotion
    ? 1
    : interpolate(localFrame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const progress = reducedMotion ? 100 : ((frame + 1) / media.durationInFrames) * 100
  const frameClass = [styles.frame, styles[format]].filter(Boolean).join(' ')
  const mediaPath = A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.mediaPath.replace(/^\//, '')

  return (
    <AbsoluteFill className={frameClass} dir="ltr">
      <header className={styles.brandRow}>
        <div className={styles.brandLockup}>
          <span aria-hidden="true" className={styles.brandMark}>C</span>
          <span>CLINIVERSE AI · REAL ECHO CINE</span>
        </div>
        <span className={styles.realMediaBadge}>Licensed source · Preview review</span>
      </header>

      <section
        className={styles.scene}
        style={{ opacity: enter, transform: `translateY(${reducedMotion ? 0 : (1 - enter) * 18}px)` }}
      >
        <div className={styles.copy}>
          <p className={styles.kicker}>{scene.kicker}</p>
          <h2>{scene.title}</h2>
          <p>{scene.body}</p>
          <ul className={styles.realEchoFacts}>
            {(SCENE_FACTS[scene.id] ?? []).map(fact => <li key={fact}>{fact}</li>)}
          </ul>
        </div>

        <div className={`${styles.visual} ${styles.realEchoCompositionVisual}`}>
          <div className={styles.realEchoVideoFrame}>
            <Loop durationInFrames={A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.remotionLoopFrames} layout="none">
              <OffthreadVideo
                aria-label="Licensed real apical four-chamber echocardiography cine"
                muted
                pauseWhenBuffering
                src={staticFile(mediaPath)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Loop>
          </div>
          <div className={styles.realEchoMediaMeta}>
            <span>A4C · 624×480 · 51 fps</span>
            <strong>REAL CLINICAL MEDIA</strong>
          </div>
        </div>
      </section>

      <footer className={styles.footerRow}>
        <span>CardioNetworks / Vdbilt · CC BY-SA 3.0 derivative</span>
        <div aria-hidden="true" className={styles.progress}><span style={{ width: `${progress}%` }} /></div>
        <span>{media.assetVersion}</span>
      </footer>
    </AbsoluteFill>
  )
}
