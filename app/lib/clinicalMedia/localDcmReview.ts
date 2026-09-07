export const LOCAL_DCM_REVIEW = {
  candidateId: 'echo-a4c-dcm-e00476',
  sha256: '7aa9c9b446c84f6de3af0eaf3cbcfd0821b5f70f8b12d031fa027b083079397f',
  mediaUrl: '/api/local-echo-review',
  learnerReady: false,
  assessmentsEnabled: false,
  persistenceEnabled: false,
} as const

export function localDcmReviewAllowed(environment: string | undefined, checksum: string) {
  return environment === 'development' && checksum === LOCAL_DCM_REVIEW.sha256
}
