import { CLINICAL_STUDIO_ASSETS, type ClinicalStudioAsset } from './clinicalStudioManifest.ts'

export type ClinicalMediaLocale = ClinicalStudioAsset['locale']
export type ClinicalMediaFormat = 'landscape' | 'portrait' | 'square'

export interface ClinicalMediaSceneCopy {
  kicker: string
  title: string
  body: string
}

export interface CompiledClinicalMediaScene extends ClinicalMediaSceneCopy {
  id: string
  startFrame: number
  durationFrames: number
  endFrame: number
  narrationKey: string
}

export interface CompiledClinicalMedia {
  schemaVersion: '0.1'
  compilationId: string
  assetId: string
  assetVersion: string
  locale: ClinicalMediaLocale
  direction: 'ltr' | 'rtl'
  format: ClinicalMediaFormat
  width: number
  height: number
  fps: 30
  durationInFrames: number
  scenes: CompiledClinicalMediaScene[]
  governance: Pick<ClinicalStudioAsset, 'intendedUse' | 'dataMode' | 'reviewStatus' | 'disclaimer' | 'evidence'>
}

export const CLINICAL_MEDIA_FORMATS: Record<ClinicalMediaFormat, { label: string; width: number; height: number }> = {
  landscape: { label: '16:9', width: 1280, height: 720 },
  portrait: { label: '9:16', width: 720, height: 1280 },
  square: { label: '1:1', width: 1080, height: 1080 },
}

const COPY: Record<ClinicalMediaLocale, Record<string, ClinicalMediaSceneCopy>> = {
  en: {
    'gap-context': {
      kicker: 'PATHWAY GAP',
      title: 'Door-to-ECG: 12 minutes',
      body: 'A fictional pathway replay is above the configured 10-minute training threshold.',
    },
    'waveform-inspection': {
      kicker: 'INSPECT',
      title: 'Find the configured marker',
      body: 'Compare the deterministic synthetic strips. This exercise trains visual recognition, not diagnosis.',
    },
    'evidence-check': {
      kicker: 'VERIFY',
      title: 'Evidence before interpretation',
      body: 'Confirm timestamp, synthetic provenance and waveform readability before the event can be trusted.',
    },
    reassessment: {
      kicker: 'REASSESS',
      title: '8-minute illustrative rerun',
      body: 'The competency improves in simulation while the open safety gate remains under human review.',
    },
  },
  ar: {
    'gap-context': {
      kicker: 'فجوة المسار',
      title: 'من الوصول إلى التخطيط: 12 دقيقة',
      body: 'محاكاة افتراضية تجاوزت الحد التدريبي المحدد بعشر دقائق.',
    },
    'waveform-inspection': {
      kicker: 'افحص',
      title: 'حدّد العلامة المبرمجة',
      body: 'قارن المقاطع الاصطناعية الحتمية. هذا تدريب للتعرّف البصري وليس للتشخيص.',
    },
    'evidence-check': {
      kicker: 'تحقّق',
      title: 'الدليل قبل التفسير',
      body: 'تحقّق من الوقت والمصدر الاصطناعي ووضوح الموجة قبل اعتماد الحدث.',
    },
    reassessment: {
      kicker: 'أعد التقييم',
      title: 'إعادة تشغيل توضيحية: 8 دقائق',
      body: 'تحسّنت المهارة في المحاكاة، بينما تظل بوابة السلامة المفتوحة تحت المراجعة البشرية.',
    },
  },
}

export function compileClinicalMedia(
  locale: ClinicalMediaLocale = 'en',
  format: ClinicalMediaFormat = 'landscape',
): CompiledClinicalMedia {
  const asset = CLINICAL_STUDIO_ASSETS.find(candidate => candidate.locale === locale)
  if (!asset) throw new Error(`No Clinical Studio asset exists for locale: ${locale}`)

  const profile = CLINICAL_MEDIA_FORMATS[format]
  let cursor = 0
  const scenes = asset.scenes.map(scene => {
    const startFrame = cursor
    cursor += scene.durationFrames
    const sceneCopy = COPY[locale][scene.id]
    if (!sceneCopy) throw new Error(`No ${locale} copy exists for scene: ${scene.id}`)

    return {
      ...scene,
      ...sceneCopy,
      startFrame,
      endFrame: cursor,
    }
  })

  return {
    schemaVersion: asset.schemaVersion,
    compilationId: `${asset.assetId}:${asset.version}:${locale}:${profile.label}`,
    assetId: asset.assetId,
    assetVersion: asset.version,
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    format,
    width: profile.width,
    height: profile.height,
    fps: 30,
    durationInFrames: cursor,
    scenes,
    governance: {
      intendedUse: asset.intendedUse,
      dataMode: asset.dataMode,
      reviewStatus: asset.reviewStatus,
      disclaimer: asset.disclaimer,
      evidence: asset.evidence,
    },
  }
}
