import {
  A4C_NORMAL_CLINICAL_STUDIO_ASSET,
  type LicensedEchoClinicalStudioAsset,
} from './licensedEchoAsset.ts'

export type ClinicalStudioAsset = LicensedEchoClinicalStudioAsset

export const ALL_CLINICAL_STUDIO_ASSETS: readonly ClinicalStudioAsset[] = [
  A4C_NORMAL_CLINICAL_STUDIO_ASSET,
]
