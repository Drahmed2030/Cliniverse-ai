import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react'
import { notFound } from 'next/navigation'
import DiagnosticConsole from './DiagnosticConsole'
import styles from './gemini-diagnostic.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gemini Diagnostic Console · NeuraOps',
  description: 'Preview-only verification console for the governed NeuraOps Gemini gateway.',
  robots: { index: false, follow: false },
}

export default function GeminiDiagnosticPage() {
  if (process.env.VERCEL_ENV === 'production') notFound()

  return (
    <main className={styles.shell}>
      <div className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/neuraops" aria-label="Back to NeuraOps">
            <span className={styles.mark} aria-hidden="true">N</span>
            <span><strong>NeuraOps</strong><small>TRUST OPERATIONS</small></span>
          </Link>
          <Link className={styles.backLink} href="/neuraops">
            <ArrowLeft aria-hidden="true" size={17} /> Back to company
          </Link>
        </header>

        <section className={styles.hero} aria-labelledby="diagnostic-title">
          <div>
            <p className={styles.eyebrow}>PREVIEW-ONLY CONTROL SURFACE</p>
            <h1 id="diagnostic-title">Trust, verified at the boundary.</h1>
            <p className={styles.lede}>
              Verify the governed Gemini connection with one fixed, non-clinical probe. No patient data,
              free-text prompt, or autonomous clinical action can enter this lane.
            </p>
          </div>
          <div className={styles.heroSeal} aria-label="Human review required">
            <ShieldCheck aria-hidden="true" size={28} />
            <span><strong>Human review</strong><small>Required on every receipt</small></span>
          </div>
        </section>

        <DiagnosticConsole />

        <footer className={styles.footer}>
          <LockKeyhole aria-hidden="true" size={15} />
          <span>Internal diagnostic · Synthetic and non-clinical · Production blocked</span>
        </footer>
      </div>
    </main>
  )
}
