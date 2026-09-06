import type { EchoStudy } from './echoStudyContract.ts'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from './licensedEchoAsset.ts'

export const ECHO_A4C_PREVIEW_STUDY: EchoStudy = {
  schemaVersion: '1.0',
  studyId: 'echo-a4c-governed-preview-v1',
  title: 'A4C Normal · Governed Preview Study',
  studyType: 'single-view-learning',
  modality: 'echo',
  intendedUse: 'education-only',
  clips: [
    {
      clipId: 'echo-a4c-normal-clip-v1',
      assetId: A4C_NORMAL_CLINICAL_STUDIO_ASSET.assetId,
      order: 1,
      view: 'A4C',
      label: 'A4C · Normal source-labelled cine',
      kind: 'cine',
      mediaPath: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.mediaPath,
      qaState: 'clinical-review-required',
      skillIds: ['echo.view.a4c-recognition', 'echo.anatomy.a4c-landmarks'],
      assessmentTaskIds: ['echo-a4c-view-identity-v1', 'echo-a4c-landmarks-v1'],
      durationMs: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.durationMs,
    },
  ],
}
