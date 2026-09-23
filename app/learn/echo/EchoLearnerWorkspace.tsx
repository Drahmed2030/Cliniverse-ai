'use client'

import Link from 'next/link'
import './echo-workspace.css'
import AuthGate from '../../components/auth/AuthGate'
import ClinicalMediaPreview from '../../components/clinical-media/ClinicalMediaPreview'
import { useAppearance } from '../../components/release/AppearanceSettings'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET as ASSET } from '../../lib/clinicalMedia/licensedEchoAsset'
import { NATIVE_SAFE_AREA_BOTTOM, NATIVE_SAFE_AREA_TOP } from '../../lib/nativeSafeArea'

// Echo v2 learner workspace. This shell reuses the existing learner media engine and keeps
// technical governance metadata out of the learner presentation. Required source/licence
// attribution remains visible next to the educational experience.

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
          <span className="echo-chip">Real cine · {cine.view}</span>
        </nav>
        <header>
          <p className="echo-eyebrow">ECHO · {cine.view}</p>
          <h1 id="echo-title" className="echo-title">Observe an echo cine</h1>
          <p className="echo-lead">One licensed real apical four-chamber cine, source-labelled {cine.sourceLabel}, for view-recognition practice.</p>
        </header>

        <ClinicalMediaPreview echoOnly variant="learner" />

        <section className="echo-attribution" aria-label="Source and licence">
          <p className="echo-note">
            Source: {rights.creator} · {rights.licenseId} · modified for playback and privacy.{' '}
            <a href={rights.sourcePageUrl} rel="noreferrer" target="_blank">Source</a>{' · '}
            <a href={rights.licenseUrl} rel="noreferrer" target="_blank">Licence</a>
          </p>
          <p className="echo-note">{ASSET.disclaimer}</p>
        </section>
      </div>
    </main>
  )
}
