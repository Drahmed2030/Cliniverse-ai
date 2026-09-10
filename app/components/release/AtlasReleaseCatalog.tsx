const C = {
  panel: 'var(--cv-surface)',
  elevated: 'var(--cv-surface-elevated)',
  border: 'var(--cv-border)',
  text: 'var(--cv-text)',
  sub: 'var(--cv-text-secondary)',
  blue: 'var(--cv-blue)',
  teal: 'var(--cv-teal)',
  violet: 'var(--cv-violet)',
  gold: 'var(--cv-gold)',
}

type ReleaseDestination = 'care' | 'me'
type ReleaseAccess = 'FREE' | 'PRO' | 'ACCOUNT'

export interface AtlasDestination {
  tab: ReleaseDestination
  workspace?: 'ward' | 'cardiology' | 'nexus'
}

interface Props {
  onNavigate: (destination: AtlasDestination) => void
  onOpenPlan: () => void
}

const releasePaths: Array<{
  title: string
  description: string
  access: ReleaseAccess
  destination: AtlasDestination
  action: string
  details: string[]
}> = [
  {
    title: 'Ward Simulation',
    description: 'Open the first fictional case and review the complete simulated care journey without purchasing PRO.',
    access: 'FREE',
    destination: { tab: 'care', workspace: 'ward' },
    action: 'Open Ward',
    details: ['Fictional records', 'Human review', 'Related evidence entry'],
  },
  {
    title: 'Cardiology Operations',
    description: 'A PRO learning workspace for QAPAS Direct, census, surgical readiness, tasks and structured handover.',
    access: 'PRO',
    destination: { tab: 'care', workspace: 'cardiology' },
    action: 'Open Cardiology',
    details: ['Six interactive modules', 'Local simulation state', 'No clinical order transmission'],
  },
  {
    title: 'Nexus Learning',
    description: 'A PRO cardiovascular reliability exercise that coordinates four professional perspectives and a gated debrief.',
    access: 'PRO',
    destination: { tab: 'care', workspace: 'nexus' },
    action: 'Open Nexus',
    details: ['Four learning roles', 'Fictional reflections', 'Human-confirmed debrief'],
  },
  {
    title: 'Account and subscription',
    description: 'Review the profile, localized App Store plan, purchase restoration, privacy, terms and session controls.',
    access: 'ACCOUNT',
    destination: { tab: 'me' },
    action: 'Open Me',
    details: ['StoreKit price', 'Restore purchases', 'Privacy and support'],
  },
]

const accessColor: Record<ReleaseAccess, string> = {
  FREE: C.teal,
  PRO: C.violet,
  ACCOUNT: C.blue,
}

export default function AtlasReleaseCatalog({ onNavigate, onOpenPlan }: Props) {
  return (
    <section aria-labelledby="atlas-title" data-commercial-explore-surface>
      <div style={introStyle}>
        <div style={{ color: C.blue, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>CURRENT RELEASE TOUR</div>
        <h1 id="atlas-title" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', margin: '7px 0 8px' }}>Atlas</h1>
        <p style={{ margin: 0, color: C.sub, fontSize: '0.95rem', lineHeight: 1.65, maxWidth: 760 }}>
          Use this map to reach every active release area. Labels distinguish the free preview, PRO learning content and account controls.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {releasePaths.map(path => (
          <article key={path.title} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{path.title}</div>
                <p style={{ color: C.sub, fontSize: '0.9rem', lineHeight: 1.55, margin: '7px 0 0' }}>{path.description}</p>
              </div>
              <span style={{ color: accessColor[path.access], border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 7px', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                {path.access}
              </span>
            </div>

            <div aria-label={`${path.title} included capabilities`} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {path.details.map(item => (
                <span key={item} style={detailStyle}>{item}</span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigate(path.destination)}
              style={{ ...actionStyle, color: accessColor[path.access] }}
            >
              {path.action} →
            </button>
          </article>
        ))}

        <section aria-labelledby="atlas-plan-title" style={{ ...cardStyle, borderColor: C.border }}>
          <div style={{ color: C.violet, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>APP STORE PLAN</div>
          <h2 id="atlas-plan-title" style={{ fontSize: '1.05rem', margin: '7px 0 6px' }}>Review Cliniverse PRO</h2>
          <p style={{ margin: 0, color: C.sub, fontSize: '0.9rem', lineHeight: 1.55 }}>
            The plan sheet loads the title, renewal period and localized price from StoreKit. PRO activates only after server verification.
          </p>
          <button type="button" onClick={onOpenPlan} style={{ ...actionStyle, color: C.violet }}>
            View plan →
          </button>
        </section>

        <p style={boundaryStyle}>
          Release boundary: third-party clinical AI, diagnosis, prescribing, real-patient workflows and device-health integrations are not part of this version.
        </p>
      </div>
    </section>
  )
}

const introStyle = {
  padding: 16,
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  background: C.panel,
  color: C.text,
  marginBottom: 12,
} as const

const cardStyle = {
  padding: 16,
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  background: C.panel,
  color: C.text,
} as const

const detailStyle = {
  padding: '6px 8px',
  borderRadius: 999,
  background: C.elevated,
  color: C.sub,
  fontSize: '0.78rem',
  fontFamily: 'inherit',
  border: `1px solid ${C.border}`,
} as const

const actionStyle = {
  width: '100%',
  minHeight: 44,
  marginTop: 14,
  borderRadius: 13,
  border: `1px solid ${C.border}`,
  background: C.elevated,
  fontSize: '0.9rem',
  fontWeight: 800,
  cursor: 'pointer',
} as const

const boundaryStyle = {
  margin: 0,
  padding: '12px 14px',
  borderRadius: 14,
  border: `1px solid ${C.border}`,
  background: C.elevated,
  color: C.gold,
  fontSize: '0.82rem',
  lineHeight: 1.55,
} as const
