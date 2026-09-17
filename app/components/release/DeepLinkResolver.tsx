import LegalPageBack from './LegalPageBack'

// Minimal, honest resolver for the canonical deep-link path contract
// (app/lib/engagement/deepLinks.ts). This confirms the link is real and
// reachable (HTTP 200, not a 404) and points the visitor to where that
// content lives today. It intentionally does not look up or render the
// specific article/case content itself — no evidence-article or reference
// content model exists yet, and auto-selecting a specific case inside the
// existing Ward/ECG/Echo surfaces is out of scope for this foundation batch.
export default function DeepLinkResolver({
  kicker,
  title,
  id,
  destinationHref,
  destinationLabel,
}: {
  kicker: string
  title: string
  id: string
  destinationHref: string
  destinationLabel: string
}) {
  return (
    <main style={{ minHeight: '100vh', background: '#080c16', color: '#f8fafc', fontFamily: 'Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 22px 72px' }}>
        <LegalPageBack />
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#14b8a6' }}>{kicker}</div>
        <h1 style={{ fontSize: 'clamp(28px,6vw,42px)', lineHeight: 1.1, letterSpacing: '-.03em', margin: '14px 0 18px' }}>{title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#94a3b8', margin: '0 0 8px' }}>Reference: <code style={{ color: '#cbd5e1' }}>{id}</code></p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#cbd5e1', margin: '0 0 28px' }}>
          This link resolves inside Cliniverse AI. Open it in the app, or continue below to find it in Learn.
        </p>
        <a
          href={destinationHref}
          style={{ display: 'inline-block', background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '12px 18px', borderRadius: 12, fontWeight: 800 }}
        >
          {destinationLabel} →
        </a>
      </div>
    </main>
  )
}
