import Link from 'next/link'
import ClinicalMediaPreview from '../../components/clinical-media/ClinicalMediaPreview'

export default function EchoPreviewPage() {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
      <nav aria-label="Echo preview navigation" style={{ marginBottom: 16 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>← Back to Cliniverse</Link>
      </nav>
      <h1>Echo Preview</h1>
      <p>Governed A4C normal study with real licensed cine video and a short assessment. Educational preview only — not diagnostic, not certification.</p>
      <ClinicalMediaPreview echoOnly />
    </main>
  )
}
