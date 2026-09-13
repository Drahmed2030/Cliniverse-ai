'use client'

import { useEffect, useState, type RefObject } from 'react'
import type { PlayerRef } from '@remotion/player'
import { ChevronLeft, ChevronRight, Expand, Repeat2, RotateCcw } from 'lucide-react'
import { stepStudioFrame } from '../../lib/clinicalMedia/studioPlayerCapabilities'
import styles from './clinical-media.module.css'

interface Props {
  playerRef: RefObject<PlayerRef | null>
  frameCount: number
  cineReview: boolean
  loop: boolean
  onLoopChange: (loop: boolean) => void
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

/** Controls for the existing Remotion Player; no separate media renderer. */
export default function EchoPlaybackControls({ playerRef, frameCount, cineReview, loop, onLoopChange, expanded, onExpandedChange }: Props) {
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    const update = () => setFrame(player.getCurrentFrame())
    const play = () => setPlaying(true)
    const pause = () => { setPlaying(false); update() }
    player.addEventListener('frameupdate', update)
    player.addEventListener('play', play)
    player.addEventListener('pause', pause)
    player.addEventListener('ended', pause)
    return () => {
      player.removeEventListener('frameupdate', update)
      player.removeEventListener('play', play)
      player.removeEventListener('pause', pause)
      player.removeEventListener('ended', pause)
    }
  }, [playerRef])

  function step(delta: -1 | 1) {
    const player = playerRef.current
    if (!player) return
    player.pause()
    player.seekTo(stepStudioFrame(player.getCurrentFrame(), delta, frameCount))
  }

  return <div className={styles.cineControlShelf} role="group" aria-label="Echo playback tools">
    <div className={styles.cineFrameTools}>
      <button className={styles.cineToolButton} type="button" disabled={!playing && frame === 0} onClick={() => step(-1)} aria-label="Previous frame"><ChevronLeft aria-hidden="true" size={20}/></button>
      <span className={styles.cineFrameReadout} aria-live="off">{cineReview ? 'Cine frame' : 'Timeline frame'} <strong>{frame + 1} / {frameCount}</strong></span>
      <button className={styles.cineToolButton} type="button" disabled={!playing && frame === frameCount - 1} onClick={() => step(1)} aria-label="Next frame"><ChevronRight aria-hidden="true" size={20}/></button>
    </div>
    <div className={styles.cineActionTools}>
      <button className={styles.cineToolButton} type="button" onClick={() => { playerRef.current?.pause(); playerRef.current?.seekTo(0) }}><RotateCcw aria-hidden="true" size={18}/>Reset</button>
      <button className={styles.cineToolButton} type="button" aria-pressed={loop} onClick={() => onLoopChange(!loop)}><Repeat2 aria-hidden="true" size={18}/>Loop</button>
      <button className={styles.cineToolButton} type="button" aria-pressed={expanded} onClick={() => onExpandedChange(!expanded)}><Expand aria-hidden="true" size={18}/>{expanded ? 'Show context' : 'Expand cine'}</button>
    </div>
    <p className={styles.cineControlHint}>{playing ? 'Playing · frame stepping pauses playback' : 'Paused · use Play above to begin'} · Original speed</p>
  </div>
}
