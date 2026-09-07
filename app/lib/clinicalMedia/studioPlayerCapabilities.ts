export type StudioPreviewMode = 'echo-preview' | 'echo-review' | 'ecg-preview'

/** Capabilities of currently implemented previews, not clinical/release approval. */
export function studioPlayerCapabilities(mode: StudioPreviewMode) {
  const echo = mode === 'echo-preview' || mode === 'echo-review'
  return {
    playback: echo || mode === 'ecg-preview',
    cine: echo,
    frameNavigation: echo,
    studyNavigation: mode === 'echo-preview',
    review: mode === 'echo-review',
    assessment: mode === 'echo-preview',
    learnerReady: false,
  } as const
}

/** Frame controls pause before seeking; never wrap or synthesize source frames. */
export function stepStudioFrame(current: number, delta: -1 | 1, count: number) {
  if (!Number.isInteger(current) || !Number.isInteger(count) || count < 1) return 0
  return Math.max(0, Math.min(count - 1, current + delta))
}
