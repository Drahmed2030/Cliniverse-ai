export const RECORD10_REVIEW_PDF = {
  sha256: '237865bfb5092573904802afabf10d4b51f2c21af85ef27a49d5c8a839962fc5',
  bytes: 557798,
  filename: 'cliniverse-record10-regenerated-review.pdf',
} as const

export async function matchesReviewedEcgPdf(bytes: ArrayBuffer): Promise<boolean> {
  if (bytes.byteLength !== RECORD10_REVIEW_PDF.bytes) return false
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('') === RECORD10_REVIEW_PDF.sha256
}
