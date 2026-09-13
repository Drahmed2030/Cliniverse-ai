export const A4C_NORMAL_ASSET_ID = 'echo-a4c-normal-cardionetworks-v1-en' as const
export const A4C_NORMAL_ACTIVITY_ID = 'echo-a4c-normal-view-v1' as const
export const A4C_NORMAL_ENGINE_ID = 'echo-cine-file-v1' as const
export const A4C_NORMAL_SOURCE_ID = 'wikimedia-commons:a4c-normal-cardionetworks:sha1-1ae4551b' as const
export const A4C_NORMAL_MEDIA_PATH = '/clinical-media/echo/a4c-normal-cardionetworks-v1.mp4' as const

export interface LicensedEchoClinicalStudioAsset {
  schemaVersion: '0.2'
  assetId: typeof A4C_NORMAL_ASSET_ID
  version: '1.0.0-preview'
  locale: 'en'
  modality: 'echo'
  intendedUse: 'education-only'
  dataMode: 'licensed-real-clinical-media'
  reviewStatus: 'source-rights-reviewed-clinical-copy-review-required'
  surfaceAccess: 'preview-only'
  linkedActivityId: typeof A4C_NORMAL_ACTIVITY_ID
  renderTargets: ('web-video' | 'remotion-video')[]
  scenes: { id: string; durationFrames: number; narrationKey: string }[]
  cine: {
    engine: typeof A4C_NORMAL_ENGINE_ID
    sourceId: typeof A4C_NORMAL_SOURCE_ID
    mediaPath: typeof A4C_NORMAL_MEDIA_PATH
    view: 'A4C'
    sourceLabel: 'normal'
    width: 624
    height: 480
    framesPerSecond: 51
    frameCount: 50
    durationMs: 980
    remotionLoopFrames: 29
    audio: 'none'
  }
  evidence: {
    sourceId: typeof A4C_NORMAL_SOURCE_ID
    sourceType: 'wikimedia-commons-file-page'
  }[]
  rights: {
    sourcePageUrl: string
    originalFileUrl: string
    creator: 'CardioNetworks / Vdbilt'
    licenseId: 'CC-BY-SA-3.0'
    licenseUrl: string
    vrtTicket: '2011102310008874'
    originalSha1: '1ae4551bf89fc5f41d4f2632584999230c2dcbab'
    originalBytes: 288005
    derivativeSha256: '89e311b8a841a2a6813d4c5ba470aede46ba85780d42b2124330fc01846c783c'
    derivativeBytes: 168220
    changes: string[]
    shareAlikeRequired: true
  }
  privacy: {
    reviewMethod: 'all-frames-contact-sheet-and-full-resolution-spot-check'
    directPatientIdentifiersVisible: false
    maskedElements: ['burned-in acquisition date and time']
    unexpectedAudio: false
    status: 'passed-local-technical-review'
  }
  disclaimer: string
}

export const A4C_NORMAL_CLINICAL_STUDIO_ASSET = {
  schemaVersion: '0.2',
  assetId: A4C_NORMAL_ASSET_ID,
  version: '1.0.0-preview',
  locale: 'en',
  modality: 'echo',
  intendedUse: 'education-only',
  dataMode: 'licensed-real-clinical-media',
  reviewStatus: 'source-rights-reviewed-clinical-copy-review-required',
  surfaceAccess: 'preview-only',
  linkedActivityId: A4C_NORMAL_ACTIVITY_ID,
  renderTargets: ['web-video', 'remotion-video'],
  scenes: [
    { id: 'source-and-view', durationFrames: 150, narrationKey: 'echoA4c.sourceAndView' },
    { id: 'view-landmarks', durationFrames: 180, narrationKey: 'echoA4c.landmarks' },
    { id: 'motion-boundary', durationFrames: 150, narrationKey: 'echoA4c.motionBoundary' },
    { id: 'rights-and-review', durationFrames: 120, narrationKey: 'echoA4c.rightsAndReview' },
  ],
  cine: {
    engine: A4C_NORMAL_ENGINE_ID,
    sourceId: A4C_NORMAL_SOURCE_ID,
    mediaPath: A4C_NORMAL_MEDIA_PATH,
    view: 'A4C',
    sourceLabel: 'normal',
    width: 624,
    height: 480,
    framesPerSecond: 51,
    frameCount: 50,
    durationMs: 980,
    remotionLoopFrames: 29,
    audio: 'none',
  },
  evidence: [{ sourceId: A4C_NORMAL_SOURCE_ID, sourceType: 'wikimedia-commons-file-page' }],
  rights: {
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:A4C_normal_(CardioNetworks_ECHOpedia).webm',
    originalFileUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/A4C_normal_%28CardioNetworks_ECHOpedia%29.webm',
    creator: 'CardioNetworks / Vdbilt',
    licenseId: 'CC-BY-SA-3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/deed.en',
    vrtTicket: '2011102310008874',
    originalSha1: '1ae4551bf89fc5f41d4f2632584999230c2dcbab',
    originalBytes: 288005,
    derivativeSha256: '89e311b8a841a2a6813d4c5ba470aede46ba85780d42b2124330fc01846c783c',
    derivativeBytes: 168220,
    changes: [
      'Masked the burned-in acquisition date and time in the top-left corner.',
      'Re-encoded VP8 WebM video to H.264 MP4 for browser and iOS compatibility.',
      'Removed container metadata and omitted audio tracks; the source contains no audio stream.',
    ],
    shareAlikeRequired: true,
  },
  privacy: {
    reviewMethod: 'all-frames-contact-sheet-and-full-resolution-spot-check',
    directPatientIdentifiersVisible: false,
    maskedElements: ['burned-in acquisition date and time'],
    unexpectedAudio: false,
    status: 'passed-local-technical-review',
  },
  disclaimer: 'Licensed real echocardiography cine for view-recognition education only. The source labels the clip normal; this preview does not support measurement, pathology exclusion, diagnosis, treatment, or patient decisions.',
} as const satisfies LicensedEchoClinicalStudioAsset

export function validateLicensedEchoAsset(asset: LicensedEchoClinicalStudioAsset): void {
  if (asset.locale !== 'en' || asset.modality !== 'echo' || asset.cine.view !== 'A4C') {
    throw new Error('The first licensed ECHO slice must be the English A4C asset.')
  }
  if (asset.dataMode !== 'licensed-real-clinical-media' || asset.surfaceAccess !== 'preview-only') {
    throw new Error('Licensed ECHO media must remain real-media and Preview-only.')
  }
  if (!asset.cine.mediaPath.startsWith('/clinical-media/echo/') || asset.cine.audio !== 'none') {
    throw new Error('Licensed ECHO media must use the governed local, silent media path.')
  }
  if (asset.privacy.directPatientIdentifiersVisible || asset.privacy.unexpectedAudio) {
    throw new Error('Licensed ECHO media cannot pass with visible direct identifiers or unexpected audio.')
  }
  if (asset.rights.licenseId !== 'CC-BY-SA-3.0' || !asset.rights.shareAlikeRequired) {
    throw new Error('The A4C derivative must preserve its CC BY-SA 3.0 obligations.')
  }
  if (!/^[a-f0-9]{40}$/.test(asset.rights.originalSha1) || !/^[a-f0-9]{64}$/.test(asset.rights.derivativeSha256)) {
    throw new Error('The source and derivative checksums must be frozen.')
  }
}
