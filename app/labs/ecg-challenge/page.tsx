'use client'

import Link from 'next/link'
import EcgChallenge from '../../components/EcgChallenge'

export default function EcgChallengePage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <nav aria-label="ECG challenge navigation" style={{ marginBottom: 16 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>← Back to Cliniverse</Link>
      </nav>
      <EcgChallenge onXP={() => {}} />
    </main>
  )
}
