export const ECHO_CINE_ENGINE_ID = 'echo-cine-frame-engine-v0' as const
export const ECHO_CINE_SOURCE_ID = 'SYNTHETIC-ECHO-MOTION-PHANTOM-V0' as const
export const ECHO_CINE_FPS = 30 as const
export const ECHO_CINE_CYCLE_FRAMES = 90 as const
export const ECHO_CINE_REDUCED_MOTION_FRAME = 22 as const

export type EchoCineMotionPhase = 'inward-motion' | 'turning-point' | 'outward-motion'
export type EchoCineLocale = 'en' | 'ar'

export interface EchoCinePoint {
  x: number
  y: number
  radius: number
  opacity: number
}

export interface EchoCineContour {
  cx: number
  cy: number
  rx: number
  ry: number
  rotation: number
}

export interface EchoCineFrame {
  frameIndex: number
  cyclePosition: number
  motionAmount: number
  phase: EchoCineMotionPhase
  outerContour: EchoCineContour
  innerContour: EchoCineContour
  speckles: readonly EchoCinePoint[]
}

export const ECHO_CINE_PHANTOM_SPEC = {
  schemaVersion: 1,
  engineId: ECHO_CINE_ENGINE_ID,
  sourceId: ECHO_CINE_SOURCE_ID,
  scientificModel: 'cine-frame-sequence',
  dataMode: 'synthetic-non-clinical',
  intendedUse: 'education-only',
  reviewStatus: 'draft-human-review-required',
  cycleFrames: ECHO_CINE_CYCLE_FRAMES,
  fps: ECHO_CINE_FPS,
  renderTargets: ['web-canvas', 'remotion-video'],
  prohibitedOutputs: ['ejection-fraction', 'chamber-measurement', 'doppler-value', 'pathology', 'diagnosis'],
} as const

const BASE_SPECKLES: readonly EchoCinePoint[] = Array.from({ length: 54 }, (_, index) => {
  const angle = (index * 2.399963229728653) % (Math.PI * 2)
  const radialBand = 0.08 + ((index * 37) % 91) / 250
  const verticalBias = 0.92 + ((index * 17) % 13) / 100

  return {
    x: 0.5 + Math.cos(angle) * radialBand,
    y: 0.54 + Math.sin(angle) * radialBand * verticalBias,
    radius: 0.0018 + ((index * 11) % 7) / 2_500,
    opacity: 0.16 + ((index * 29) % 59) / 100,
  }
})

export function createEchoCineFrame(frameIndex: number): EchoCineFrame {
  if (!Number.isInteger(frameIndex) || frameIndex < 0 || frameIndex >= ECHO_CINE_CYCLE_FRAMES) {
    throw new Error(`Echo cine frame must be an integer from 0 to ${ECHO_CINE_CYCLE_FRAMES - 1}.`)
  }

  const cyclePosition = frameIndex / ECHO_CINE_CYCLE_FRAMES
  const motionAmount = (1 - Math.cos(cyclePosition * Math.PI * 2)) / 2
  const lateralShift = Math.sin(cyclePosition * Math.PI * 2) * 0.006
  const phase: EchoCineMotionPhase = cyclePosition < 0.46
    ? 'inward-motion'
    : cyclePosition <= 0.54
      ? 'turning-point'
      : 'outward-motion'

  const outerContour: EchoCineContour = {
    cx: 0.5 + lateralShift * 0.35,
    cy: 0.56,
    rx: 0.3 - motionAmount * 0.014,
    ry: 0.35 - motionAmount * 0.018,
    rotation: -0.08 + lateralShift,
  }
  const innerContour: EchoCineContour = {
    cx: 0.5 + lateralShift,
    cy: 0.56 + motionAmount * 0.004,
    rx: 0.19 - motionAmount * 0.045,
    ry: 0.255 - motionAmount * 0.06,
    rotation: -0.08 + lateralShift * 1.8,
  }
  const speckleScale = 1 - motionAmount * 0.035
  const speckles = BASE_SPECKLES.map(point => ({
    ...point,
    x: outerContour.cx + (point.x - 0.5) * speckleScale,
    y: outerContour.cy + (point.y - 0.54) * speckleScale,
  }))

  return {
    frameIndex,
    cyclePosition,
    motionAmount,
    phase,
    outerContour,
    innerContour,
    speckles,
  }
}

export function wrapEchoCineFrame(frameIndex: number): number {
  if (!Number.isFinite(frameIndex)) throw new Error('Echo cine frame progression must be finite.')
  return ((Math.trunc(frameIndex) % ECHO_CINE_CYCLE_FRAMES) + ECHO_CINE_CYCLE_FRAMES) % ECHO_CINE_CYCLE_FRAMES
}

const PHASE_COPY: Record<EchoCineLocale, Record<EchoCineMotionPhase, string>> = {
  en: {
    'inward-motion': 'the inner contour is moving inward',
    'turning-point': 'the inner contour is at the cycle turning point',
    'outward-motion': 'the inner contour is moving outward',
  },
  ar: {
    'inward-motion': 'يتحرك المحيط الداخلي نحو الداخل',
    'turning-point': 'يقف المحيط الداخلي عند نقطة تحوّل الدورة',
    'outward-motion': 'يتحرك المحيط الداخلي نحو الخارج',
  },
}

export function describeEchoCineFrame(frame: EchoCineFrame, locale: EchoCineLocale): string {
  if (locale === 'ar') {
    return `الإطار الاصطناعي ${frame.frameIndex + 1} من ${ECHO_CINE_CYCLE_FRAMES}: ${PHASE_COPY.ar[frame.phase]}. لا يمثل هذا الرسم تشريحًا أو قياسًا أو تشخيصًا.`
  }
  return `Synthetic frame ${frame.frameIndex + 1} of ${ECHO_CINE_CYCLE_FRAMES}: ${PHASE_COPY.en[frame.phase]}. This graphic represents no anatomy, measurement, or diagnosis.`
}

export function drawEchoCineFrame(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: EchoCineFrame,
): void {
  context.clearRect(0, 0, width, height)
  context.fillStyle = '#030712'
  context.fillRect(0, 0, width, height)

  context.save()
  context.beginPath()
  context.moveTo(width * 0.5, height * 0.035)
  context.lineTo(width * 0.08, height * 0.94)
  context.quadraticCurveTo(width * 0.5, height * 1.02, width * 0.92, height * 0.94)
  context.closePath()
  context.clip()

  const field = context.createRadialGradient(
    width * 0.5,
    height * 0.36,
    width * 0.04,
    width * 0.5,
    height * 0.55,
    width * 0.55,
  )
  field.addColorStop(0, '#28374b')
  field.addColorStop(0.58, '#111c2d')
  field.addColorStop(1, '#060b14')
  context.fillStyle = field
  context.fillRect(0, 0, width, height)

  context.strokeStyle = 'rgba(148, 163, 184, 0.11)'
  context.lineWidth = Math.max(1, width / 720)
  for (let ring = 1; ring <= 5; ring += 1) {
    context.beginPath()
    context.arc(width * 0.5, height * 0.035, height * ring * 0.17, 1.13, 2.01)
    context.stroke()
  }

  for (const speckle of frame.speckles) {
    context.beginPath()
    context.fillStyle = `rgba(224, 242, 254, ${speckle.opacity})`
    context.arc(speckle.x * width, speckle.y * height, Math.max(1, speckle.radius * width), 0, Math.PI * 2)
    context.fill()
  }

  drawContour(context, width, height, frame.outerContour, 'rgba(186, 230, 253, 0.82)', 3)
  drawContour(context, width, height, frame.innerContour, 'rgba(103, 232, 249, 0.96)', 4)

  context.restore()
  context.beginPath()
  context.moveTo(width * 0.5, height * 0.035)
  context.lineTo(width * 0.08, height * 0.94)
  context.quadraticCurveTo(width * 0.5, height * 1.02, width * 0.92, height * 0.94)
  context.closePath()
  context.strokeStyle = 'rgba(103, 232, 249, 0.34)'
  context.lineWidth = Math.max(1, width / 720)
  context.stroke()
}

function drawContour(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  contour: EchoCineContour,
  strokeStyle: string,
  lineWidth: number,
): void {
  context.beginPath()
  context.ellipse(
    contour.cx * width,
    contour.cy * height,
    contour.rx * width,
    contour.ry * height,
    contour.rotation,
    0,
    Math.PI * 2,
  )
  context.strokeStyle = strokeStyle
  context.lineWidth = Math.max(1.5, lineWidth * width / 720)
  context.stroke()
}
