import {
  A4C_NORMAL_CLINICAL_STUDIO_ASSET,
} from './licensedEchoAsset.ts'
import type { ClinicalStudioAsset } from './clinicalStudioManifest.ts'

export type ClinicalMediaLocale = 'en' | 'ar'
export type ClinicalMediaFormat = 'landscape' | 'portrait' | 'square'
export type ClinicalMediaProgram = 'echo-a4c-normal'

export const CLINICAL_MEDIA_PROGRAM_ACCESS = {
  'echo-a4c-normal': 'preview-only',
} as const satisfies Record<ClinicalMediaProgram, ClinicalStudioAsset['surfaceAccess']>

export const PREVIEW_CLINICAL_MEDIA_PROGRAMS = ['echo-a4c-normal'] as const satisfies readonly ClinicalMediaProgram[]

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
  schemaVersion: ClinicalStudioAsset['schemaVersion']
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
  governance: Pick<ClinicalStudioAsset, 'intendedUse' | 'dataMode' | 'reviewStatus' | 'surfaceAccess' | 'disclaimer' | 'evidence' | 'renderTargets'>
}

export const CLINICAL_MEDIA_FORMATS: Record<ClinicalMediaFormat, { label: string; width: number; height: number }> = {
  landscape: { label: '16:9', width: 1280, height: 720 },
  portrait: { label: '9:16', width: 720, height: 1280 },
  square: { label: '1:1', width: 1080, height: 1080 },
}

const A4C_ECHO_COPY: Partial<Record<ClinicalMediaLocale, Record<string, ClinicalMediaSceneCopy>>> = {
  en: {
    'source-and-view': {
      kicker: 'LICENSED REAL CINE',
      title: 'A4C normal · source-labelled',
      body: 'A real apical four-chamber loop from CardioNetworks ECHOpedia replaces the synthetic learner visual. The source page labels this clip normal.',
    },
    'view-landmarks': {
      kicker: 'VIEW SIGNATURE',
      title: 'Four chambers in one apical plane',
      body: 'Identify both atria, both ventricles, the atrioventricular valves and the septa. Display-side conventions can vary, so use the complete view signature.',
    },
    'motion-boundary': {
      kicker: 'SAFE READING',
      title: 'Observe the cine before measuring',
      body: 'Use this short loop for view recognition and cyclical motion. Do not derive ejection fraction, chamber measurements or pathology exclusion from this preview.',
    },
    'rights-and-review': {
      kicker: 'PROVENANCE',
      title: 'Rights and privacy remain visible',
      body: 'CC BY-SA 3.0 source, VRT-confirmed permission, frozen checksums and a disclosed timestamp mask travel with this derivative.',
    },
  },
}

const ASSETS_BY_PROGRAM: Record<ClinicalMediaProgram, readonly ClinicalStudioAsset[]> = {
  'echo-a4c-normal': [A4C_NORMAL_CLINICAL_STUDIO_ASSET],
}

const COPY_BY_PROGRAM: Record<ClinicalMediaProgram, Partial<Record<ClinicalMediaLocale, Record<string, ClinicalMediaSceneCopy>>>> = {
  'echo-a4c-normal': A4C_ECHO_COPY,
}

export function compileClinicalMedia(
  locale: ClinicalMediaLocale = 'en',
  format: ClinicalMediaFormat = 'landscape',
  program: ClinicalMediaProgram = 'echo-a4c-normal',
): CompiledClinicalMedia {
  const asset = ASSETS_BY_PROGRAM[program].find(candidate => candidate.locale === locale)
  if (!asset) throw new Error(`No ${program} Clinical Studio asset exists for locale: ${locale}`)
  const localizedCopy = COPY_BY_PROGRAM[program][locale]
  if (!localizedCopy) throw new Error(`No ${locale} copy exists for program: ${program}`)

  const profile = CLINICAL_MEDIA_FORMATS[format]
  let cursor = 0
  const scenes = asset.scenes.map(scene => {
    const startFrame = cursor
    cursor += scene.durationFrames
    const sceneCopy = localizedCopy[scene.id]
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
      surfaceAccess: asset.surfaceAccess,
      disclaimer: asset.disclaimer,
      evidence: asset.evidence,
      renderTargets: asset.renderTargets,
    },
  }
}

export function compileClinicalMediaPreview(
  locale: ClinicalMediaLocale = 'en',
  format: ClinicalMediaFormat = 'landscape',
  program: ClinicalMediaProgram = 'echo-a4c-normal',
): CompiledClinicalMedia {
  return compileClinicalMedia(locale, format, program)
}
