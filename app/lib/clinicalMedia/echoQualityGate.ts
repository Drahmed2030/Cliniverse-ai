import type { LicensedEchoClinicalStudioAsset } from './licensedEchoAsset.ts'

export type EchoQualityDimension =
  | 'provenance'
  | 'rights'
  | 'privacy'
  | 'media'
  | 'clinicalReview'
  | 'learnerSafety'
  | 'commercialTrust'

export interface EchoQualityCheck {
  dimension: EchoQualityDimension
  passed: boolean
  blocking: boolean
  evidence: string
}

export interface EchoQualityReport {
  assetId: string
  assetVersion: string
  score: number
  passedChecks: number
  totalChecks: number
  blockingIssues: string[]
  releaseState: 'blocked' | 'preview-ready' | 'learner-ready'
  trustSignals: string[]
  checks: EchoQualityCheck[]
}

const hasSafeEducationalDisclaimer = (value: string) =>
  /education|educational/i.test(value) &&
  /diagnos|treatment|patient decisions/i.test(value)

export function evaluateEchoQuality(asset: LicensedEchoClinicalStudioAsset): EchoQualityReport {
  const checks: EchoQualityCheck[] = [
    {
      dimension: 'provenance',
      passed: asset.evidence.length > 0 && asset.rights.sourcePageUrl.startsWith('https://'),
      blocking: true,
      evidence: 'Source evidence and canonical source page are required.',
    },
    {
      dimension: 'rights',
      passed: Boolean(asset.rights.licenseId && asset.rights.licenseUrl && asset.rights.creator),
      blocking: true,
      evidence: 'Creator, license identifier and license URL must travel with the derivative.',
    },
    {
      dimension: 'rights',
      passed: /^[a-f0-9]{40}$/.test(asset.rights.originalSha1) && /^[a-f0-9]{64}$/.test(asset.rights.derivativeSha256),
      blocking: true,
      evidence: 'Frozen source and derivative checksums protect provenance integrity.',
    },
    {
      dimension: 'privacy',
      passed: !asset.privacy.directPatientIdentifiersVisible && !asset.privacy.unexpectedAudio,
      blocking: true,
      evidence: 'No direct identifiers or unexpected audio may reach an educational surface.',
    },
    {
      dimension: 'privacy',
      passed: asset.privacy.status === 'passed-local-technical-review',
      blocking: true,
      evidence: 'A documented technical privacy review is mandatory.',
    },
    {
      dimension: 'media',
      passed: asset.cine.mediaPath.startsWith('/clinical-media/echo/') && asset.cine.audio === 'none',
      blocking: true,
      evidence: 'Governed local media path and silent playback are required.',
    },
    {
      dimension: 'media',
      passed: asset.cine.width > 0 && asset.cine.height > 0 && asset.cine.framesPerSecond > 0 && asset.cine.frameCount > 0,
      blocking: true,
      evidence: 'Playable cine metadata must be complete and non-zero.',
    },
    {
      dimension: 'clinicalReview',
      passed: !/clinical-copy-review-required/.test(asset.reviewStatus),
      blocking: true,
      evidence: 'Clinical copy approval is required before learner release.',
    },
    {
      dimension: 'learnerSafety',
      passed: asset.intendedUse === 'education-only' && hasSafeEducationalDisclaimer(asset.disclaimer),
      blocking: true,
      evidence: 'Educational scope and non-diagnostic boundary must be explicit.',
    },
    {
      dimension: 'commercialTrust',
      passed: asset.rights.creator.length > 0 && asset.rights.licenseId.length > 0 && asset.privacy.status === 'passed-local-technical-review',
      blocking: false,
      evidence: 'Visible provenance, licensing and privacy review create defensible product trust signals.',
    },
  ]

  const passedChecks = checks.filter(check => check.passed).length
  const blockingIssues = checks
    .filter(check => check.blocking && !check.passed)
    .map(check => `${check.dimension}: ${check.evidence}`)

  const previewSafe = blockingIssues.every(issue => issue.startsWith('clinicalReview:'))
  const releaseState: EchoQualityReport['releaseState'] =
    blockingIssues.length === 0
      ? 'learner-ready'
      : previewSafe && asset.surfaceAccess === 'preview-only'
        ? 'preview-ready'
        : 'blocked'

  return {
    assetId: asset.assetId,
    assetVersion: asset.version,
    score: Math.round((passedChecks / checks.length) * 100),
    passedChecks,
    totalChecks: checks.length,
    blockingIssues,
    releaseState,
    trustSignals: [
      `Source: ${asset.rights.creator}`,
      `License: ${asset.rights.licenseId}`,
      'Privacy: technical review passed',
      'Integrity: frozen source and derivative checksums',
      'Use: education-only with explicit diagnostic boundary',
    ],
    checks,
  }
}

export function assertEchoLearnerReady(asset: LicensedEchoClinicalStudioAsset): void {
  const report = evaluateEchoQuality(asset)
  if (report.releaseState !== 'learner-ready') {
    throw new Error(`Echo asset ${asset.assetId} is not learner-ready: ${report.blockingIssues.join(' | ')}`)
  }
}
