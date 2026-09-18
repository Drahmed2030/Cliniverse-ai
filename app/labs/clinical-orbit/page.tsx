import Link from 'next/link'
import ClinicalOrbit from '../../components/release/ClinicalOrbit'

export const metadata = { title: 'Clinical Orbit · Cliniverse AI' }

// Learner-scope entry point — queries always run without reviewerScope, so
// hidden/review_required/media_pending/labs content is never returned here.
// See app/lib/clinicalOrbit.ts.
export default function ClinicalOrbitPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <nav aria-label="Clinical Orbit navigation" style={{ marginBottom: 16 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>← Back to Cliniverse</Link>
      </nav>
      <h1>Clinical Orbit</h1>
      <p>An early prototype for exploring how conditions, findings, and Cliniverse content connect. Educational relationships only — every connection shows its source, and nothing here is clinical authority.</p>
      <ClinicalOrbit />
    </main>
  )
}
