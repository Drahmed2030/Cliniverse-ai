import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { batch20 } from '../content/medical/batch20.ts'
import { caseMediaLinks, deferredCaseMedia, deferredMediaSourceCommit } from '../content/medical/caseMedia.ts'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../app/lib/clinicalMedia/licensedEchoAsset.ts'

const snapshot = JSON.parse(readFileSync(new URL('../docs/case-media-resume/echo-readiness-snapshot.json', import.meta.url)))

/** Offline inventory, not a clinical approval or runtime promotion gate. */
export function buildCaseMediaReport(cases = batch20, links = caseMediaLinks, candidates = deferredCaseMedia, evidence = snapshot) {
  if (evidence.sourceCommit !== deferredMediaSourceCommit) throw new Error('Echo evidence source commit mismatch')
  const caseIds = new Set(cases.map(item => item.id))
  if (caseIds.size !== cases.length) throw new Error('Duplicate case ID')
  const mediaIds = [...links, ...candidates].map(item => item.caseId)
  if (new Set(mediaIds).size !== mediaIds.length) throw new Error('Conflicting media bindings')
  if (mediaIds.some(id => !caseIds.has(id))) throw new Error('Media references an unknown case')
  const rows = cases.map(item => {
    const link = links.find(media => media.caseId === item.id)
    if (link) return { caseId: item.id, track: item.track, status: 'supplementary-link', assetId: link.assetId, sha256: link.sha256, scope: link.purpose }
    const candidate = candidates.find(media => media.caseId === item.id)
    if (!candidate) return { caseId: item.id, track: item.track, status: 'missing', blockers: ['matching-media-not-selected'] }
    const matches = evidence.entries.filter(entry => entry.document.candidateId === candidate.candidateId)
    if (matches.length !== 1) throw new Error(`Missing or duplicate source evidence: ${candidate.candidateId}`)
    const entry = matches[0]
    const doc = entry.document
    const recordedHash = doc.gateInput?.derivativeSha256
    if (recordedHash && recordedHash !== candidate.sha256) throw new Error(`Derivative identity mismatch: ${candidate.candidateId}`)
    return {
      caseId: item.id, track: item.track, status: 'deferred', candidateId: candidate.candidateId,
      sha256: candidate.sha256,
      evidenceUrl: `https://github.com/Drahmed2030/Cliniverse-ai/blob/${evidence.sourceCommit}/${entry.sourcePath}`,
      sourceBlobSha: entry.sourceBlobSha,
      sourceLearnerReady: doc.result?.learnerReady ?? doc.learnerReady,
      blockers: [...new Set([
        ...(doc.result?.blockers ?? []), ...(doc.blockers ?? []), ...(doc.promotionBlockers ?? []),
        candidate.sha256 ? 'exact-derivative-not-installed-in-this-branch' : 'no-verified-derivative',
        'case-media-pairing-review-required',
      ])],
    }
  })
  return {
    scope: 'Media inventory only. Supplementary links do not establish complete case matching or release readiness.',
    sourceCommit: evidence.sourceCommit,
    counts: {
      cases: rows.length,
      supplementaryLinks: rows.filter(row => row.status === 'supplementary-link').length,
      deferred: rows.filter(row => row.status === 'deferred').length,
      missing: rows.filter(row => row.status === 'missing').length,
    },
    rows,
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = buildCaseMediaReport()
  const asset = A4C_NORMAL_CLINICAL_STUDIO_ASSET
  // Verify the one installed derivative using its existing manifest, not a second player or asset path.
  const bytes = readFileSync(new URL(`../public${asset.cine.mediaPath}`, import.meta.url))
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (digest !== caseMediaLinks[0].sha256) throw new Error('Installed A4C derivative checksum mismatch')
  console.log(JSON.stringify({ ...report, installedA4cChecksumVerified: true }, null, 2))
}
