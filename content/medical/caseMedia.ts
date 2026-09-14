import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../../app/lib/clinicalMedia/licensedEchoAsset.ts'

/** Links reuse the governed viewer. They do not bypass its account/review checks. */
export interface CaseMediaLink {
  caseId: string
  assetId: string
  sourceId: string
  href: string
  title: string
  purpose: string
  prerequisite: string
  creator: string
  licenseId: string
  sourceUrl: string
  licenseUrl: string
  sha256: string
}

const a4c = A4C_NORMAL_CLINICAL_STUDIO_ASSET
export const caseMediaLinks: readonly CaseMediaLink[] = [{
  caseId: 'a4c-orientation', assetId: a4c.assetId, sourceId: a4c.cine.sourceId,
  href: '/labs/echo-account-review?from=a4c-orientation', title: 'Open the existing A4C cine viewer',
  purpose: 'Supplementary view-orientation example. This source-labelled normal cine is not evidence for pathology or measurements in another case.',
  prerequisite: 'The existing viewer requires sign-in and an authorised review account. Opens in a new tab to preserve this exercise.',
  creator: a4c.rights.creator, licenseId: a4c.rights.licenseId,
  sourceUrl: a4c.rights.sourcePageUrl, licenseUrl: a4c.rights.licenseUrl,
  sha256: a4c.rights.derivativeSha256,
}]

export function mediaForCase(caseId: string): CaseMediaLink | undefined {
  return caseMediaLinks.find(link => link.caseId === caseId)
}

// Existing work is referenced, never regenerated or promoted from text approval.
export const deferredCaseMedia = [
  { caseId: 'dilated-lv', candidateId: 'echo-a4c-dcm-e00476', sha256: '7aa9c9b446c84f6de3af0eaf3cbcfd0821b5f70f8b12d031fa027b083079397f', reason: 'DCM candidate identified. The binary, route integration and artifact-specific review must be reconciled before playback here.' },
  { caseId: 'hypertrophic-phenotype', candidateId: 'echo-a4c-severe-hcm-mm0002', sha256: '39f7d2930a1383c688723871887c02e75ddd932819a01b176bbc6e03cb6cf913', reason: 'HCM derivative identified. Final privacy, playback and case-to-media review are still recorded as pending.' },
  { caseId: 'aortic-stenosis', candidateId: 'echo-psax-severe-as-e00261', sha256: '1f2e57f80802dc0f13c1c8732d8b48f05b228e39cdcd408a91956a76877fb715', reason: 'Aortic-valve candidate identified. It is a PSAX example, not a complete Doppler severity assessment; final review and playback checks remain pending.' },
  { caseId: 'mitral-regurgitation', candidateId: 'echo-a4c-flail-mv-e00466', sha256: null, reason: 'A mitral-valve candidate is on hold because anatomy and mechanism visibility need review. No verified derivative is available to link.' },
  { caseId: 'pericardial-effusion', candidateId: 'echo-a4c-pericardial-effusion-e00674', sha256: 'ac4ae1abd4ba3a14f050a5e2222af0a8a46f910669934892eac2b6e1f89e7d1a', reason: 'An effusion derivative is identified. It is not by itself evidence of tamponade; final privacy, playback and case-to-media review remain pending.' },
] as const
export const deferredMediaSourceCommit = 'fa820b345e85bb8e541d5400e36c48516abba62e'

export function mediaGap(caseId: string): string {
  const candidate = deferredCaseMedia.find(item => item.caseId === caseId)
  if (candidate) return candidate.reason
  return 'No matching governed media has been verified for this case. The normal A4C clip and the existing ECG record are not substitutes for this finding.'
}
