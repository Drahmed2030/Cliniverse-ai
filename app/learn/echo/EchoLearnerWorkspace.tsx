'use client'

import Link from 'next/link'
import './echo-workspace.css'
import AuthGate from '../../components/auth/AuthGate'
import ClinicalMediaPreview from '../../components/clinical-media/ClinicalMediaPreview'
import { useAppearance } from '../../components/release/AppearanceSettings'
import { ECHO_A4C_CLINICAL_REVIEW_ATTESTATION as REVIEW } from '../../lib/clinicalMedia/echoClinicalReviewAttestation'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET as ASSET } from '../../lib/clinicalMedia/licensedEchoAsset'
import { NATIVE_SAFE_AREA_BOTTOM, NATIVE_SAFE_AREA_TOP } from '../../lib/nativeSafeArea'

// Echo v2 learner workspace. This is a shell around the EXISTING Echo engine: the same Remotion player, playback controls,
// A4C check, reasoning check and source and licence record, hosted by ClinicalMediaPreview in its learner layout. It adds the
// page frame, the heading and one evidence panel. Every fact shown here is read from the licensed asset record and the
// clinical review attestation; nothing is measured, inferred or newly claimed, and there is no persistence or backend.

const REVIEW_DECISION: Record<string, string> = { 'approved-for-learner-use': 'Approved for learner use' }

export default function EchoLearnerWorkspace() {
  return <AuthGate allowGuest={false}>{() => <Workspace />}</AuthGate>
}

function Workspace() {
  const appearance = useAppearance()
  const { cine, rights, privacy } = ASSET
  return (
    <main
      data-commercial-shell
      data-appearance={appearance}
      data-echo-workspace
      aria-labelledby="echo-title"
      style={{ paddingTop: `max(18px, ${NATIVE_SAFE_AREA_TOP})`, paddingBottom: `max(32px, ${NATIVE_SAFE_AREA_BOTTOM})` }}
    >
      <div className="echo-frame">
        <nav className="echo-top" aria-label="Echo navigation">
          <Link className="echo-back" href="/?view=learn">← Learn</Link>
          <span className="echo-chip">Licensed real cine · {rights.licenseId}</span>
        </nav>
        <header>
          <p className="echo-eyebrow">ECHO · {cine.view}</p>
          <h1 id="echo-title" className="echo-title">Observe an echo cine</h1>
          <p className="echo-lead">One licensed real apical four-chamber cine, source-labelled {cine.sourceLabel}, for view-recognition practice.</p>
        </header>

        <ClinicalMediaPreview echoOnly variant="learner" />

        <details className="echo-evidence">
          <summary>Review, privacy and rights record</summary>
          <div className="echo-evidence-body">
            <section aria-label="Clinical review">
              <h2>Clinical review</h2>
              <dl>
                <div><dt>Decision</dt><dd>{REVIEW_DECISION[REVIEW.decision] ?? REVIEW.decision} · {REVIEW.date}</dd></div>
                <div><dt>Scope</dt><dd className="echo-mono">{REVIEW.scope}</dd></div>
                <div><dt>Note</dt><dd>{REVIEW.notes}</dd></div>
                <div><dt>Intended use</dt><dd>{ASSET.intendedUse} · {ASSET.dataMode}</dd></div>
              </dl>
            </section>
            <section aria-label="Privacy review">
              <h2>Privacy review</h2>
              <dl>
                <div><dt>Method</dt><dd>{privacy.reviewMethod}</dd></div>
                <div><dt>Status</dt><dd>{privacy.status}</dd></div>
                <div><dt>Direct patient identifiers visible</dt><dd>{privacy.directPatientIdentifiersVisible ? 'Yes' : 'No'}</dd></div>
                <div><dt>Masked</dt><dd>{privacy.maskedElements.join(', ')}</dd></div>
              </dl>
            </section>
            <section aria-label="Rights and file identity">
              <h2>Rights and file identity</h2>
              <dl>
                <div><dt>Creator</dt><dd>{rights.creator}</dd></div>
                <div><dt>Licence</dt><dd>{rights.licenseId}{rights.shareAlikeRequired ? ' · share-alike required' : ''} · <a href={rights.licenseUrl} rel="noreferrer" target="_blank">terms</a> · <a href={rights.sourcePageUrl} rel="noreferrer" target="_blank">source file page</a></dd></div>
                <div><dt>Permission ticket</dt><dd className="echo-mono">{rights.vrtTicket}</dd></div>
                <div><dt>Source file</dt><dd>SHA-1 <span className="echo-mono">{rights.originalSha1}</span> · {rights.originalBytes.toLocaleString('en-US')} bytes</dd></div>
                <div><dt>Derivative</dt><dd>SHA-256 <span className="echo-mono">{rights.derivativeSha256}</span> · {rights.derivativeBytes.toLocaleString('en-US')} bytes</dd></div>
              </dl>
              <ul aria-label="Changes made to the source">{rights.changes.map(change => <li key={change}>{change}</li>)}</ul>
            </section>
            <p className="echo-note">{ASSET.disclaimer}</p>
          </div>
        </details>
      </div>
    </main>
  )
}
