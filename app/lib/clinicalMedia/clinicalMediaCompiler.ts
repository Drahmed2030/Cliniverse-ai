import {
  CLINICAL_STUDIO_ASSETS,
  ECHO_CLINICAL_STUDIO_ASSETS,
  type ClinicalStudioAsset,
} from './clinicalStudioManifest.ts'

export type ClinicalMediaLocale = ClinicalStudioAsset['locale']
export type ClinicalMediaFormat = 'landscape' | 'portrait' | 'square'
export type ClinicalMediaProgram = 'door-to-ecg' | 'echo-motion-orientation'

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
  program: ClinicalMediaProgram
  modality: ClinicalStudioAsset['modality']
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
  governance: Pick<ClinicalStudioAsset, 'intendedUse' | 'dataMode' | 'reviewStatus' | 'disclaimer' | 'evidence' | 'renderTargets'>
}

export const CLINICAL_MEDIA_FORMATS: Record<ClinicalMediaFormat, { label: string; width: number; height: number }> = {
  landscape: { label: '16:9', width: 1280, height: 720 },
  portrait: { label: '9:16', width: 720, height: 1280 },
  square: { label: '1:1', width: 1080, height: 1080 },
}

const ECG_COPY: Record<ClinicalMediaLocale, Record<string, ClinicalMediaSceneCopy>> = {
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

const ECHO_COPY: Record<ClinicalMediaLocale, Record<string, ClinicalMediaSceneCopy>> = {
  en: {
    'echo-boundary': {
      kicker: 'MODALITY BOUNDARY',
      title: 'ECHO is ordered cine frames',
      body: 'This abstract phantom demonstrates the frame-sequence model. It is not an echocardiogram or a representation of anatomy.',
    },
    'ordered-frames': {
      kicker: 'FRAME ORDER',
      title: 'Observe one deterministic cycle',
      body: 'Each frame advances the same synthetic contour through inward motion, a turning point and outward motion.',
    },
    'motion-cycle': {
      kicker: 'SAFE DESCRIPTION',
      title: 'Describe motion, not a finding',
      body: 'The approved task is to recognize cyclical motion in this phantom without estimating function or naming pathology.',
    },
    'echo-review-gate': {
      kicker: 'HUMAN REVIEW',
      title: 'Draft remains gated',
      body: 'A cardiology reviewer must approve the learning labels and answer key before this asset can leave draft status.',
    },
  },
  ar: {
    'echo-boundary': {
      kicker: 'حدود الوسيلة',
      title: 'الإيكو سلسلة مرتبة من إطارات الحركة',
      body: 'يوضح هذا النموذج التجريدي بنية تسلسل الإطارات، وليس فحص إيكو أو تمثيلًا للتشريح.',
    },
    'ordered-frames': {
      kicker: 'ترتيب الإطارات',
      title: 'راقب دورة حتمية واحدة',
      body: 'ينقل كل إطار المحيط الاصطناعي نفسه عبر حركة للداخل ونقطة تحوّل ثم حركة للخارج.',
    },
    'motion-cycle': {
      kicker: 'وصف آمن',
      title: 'صِف الحركة ولا تستنتج نتيجة',
      body: 'المهمة المعتمدة هي تمييز الحركة الدورية في النموذج دون تقدير الوظيفة أو تسمية مرض.',
    },
    'echo-review-gate': {
      kicker: 'مراجعة بشرية',
      title: 'تبقى المسودة محكومة',
      body: 'يجب أن يعتمد مراجع قلب تسميات الدرس ومفتاح الإجابة قبل خروج الأصل من حالة المسودة.',
    },
  },
}

const ASSETS_BY_PROGRAM: Record<ClinicalMediaProgram, readonly ClinicalStudioAsset[]> = {
  'door-to-ecg': CLINICAL_STUDIO_ASSETS,
  'echo-motion-orientation': ECHO_CLINICAL_STUDIO_ASSETS,
}

const COPY_BY_PROGRAM: Record<ClinicalMediaProgram, Record<ClinicalMediaLocale, Record<string, ClinicalMediaSceneCopy>>> = {
  'door-to-ecg': ECG_COPY,
  'echo-motion-orientation': ECHO_COPY,
}

export function compileClinicalMedia(
  locale: ClinicalMediaLocale = 'en',
  format: ClinicalMediaFormat = 'landscape',
  program: ClinicalMediaProgram = 'door-to-ecg',
): CompiledClinicalMedia {
  const asset = ASSETS_BY_PROGRAM[program].find(candidate => candidate.locale === locale)
  if (!asset) throw new Error(`No ${program} Clinical Studio asset exists for locale: ${locale}`)

  const profile = CLINICAL_MEDIA_FORMATS[format]
  let cursor = 0
  const scenes = asset.scenes.map(scene => {
    const startFrame = cursor
    cursor += scene.durationFrames
    const sceneCopy = COPY_BY_PROGRAM[program][locale][scene.id]
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
    program,
    modality: asset.modality,
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
      renderTargets: asset.renderTargets,
    },
  }
}
