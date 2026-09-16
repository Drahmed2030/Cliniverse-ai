import Link from 'next/link'
import WardCaseConnections from '../ward/WardCaseConnections'

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
  workspace?: 'ward' | 'cardiology' | 'nexus' | 'codelab'
}

interface Props {
  onNavigate: (destination: AtlasDestination) => void
  onOpenPlan: () => void
  caseLibraryPreview?: boolean
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
    title: 'Code Lab',
    description: 'Build your BLS and ACLS knowledge with short lessons, practice and question reviews.',
    access: 'FREE',
    destination: { tab: 'care', workspace: 'codelab' },
    action: 'Open Code Lab',
    details: ['First two lessons per track free', 'Account-saved completion', 'PRO for all lessons'],
  },
  {
    title: 'Ward Simulation',
    description: 'Apply clinical reasoning to the first free fictional case: review the record, recognise missing information and practise a structured handover.',
    access: 'FREE',
    destination: { tab: 'care', workspace: 'ward' },
    action: 'Open Ward',
    details: ['Review facts and gaps', 'Practise a handover', 'Check save confirmation'],
  },
  {
    title: 'Cardiology Operations',
    description: 'A PRO learning workspace for Cardiac Pathway, census, surgical readiness, tasks and structured handover.',
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

export default function AtlasReleaseCatalog({ onNavigate, onOpenPlan, caseLibraryPreview = false }: Props) {
  return (
    <section aria-labelledby="atlas-title" data-commercial-explore-surface>
      <div style={introStyle}>
        <div style={{ color: C.blue, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>FIND YOUR NEXT PRACTICE</div>
        <h1 id="atlas-title" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', margin: '7px 0 8px' }}>Atlas</h1>
        <p style={{ margin: 0, color: C.sub, fontSize: '0.95rem', lineHeight: 1.65, maxWidth: 760 }}>
          Choose what you want to practise: build knowledge in Code Lab, apply it in Ward, then review your work. Each destination below explains its access and learning scope.
        </p>
      </div>

      {caseLibraryPreview && <WardCaseConnections context="atlas" />}
      <div style={{ display: 'grid', gap: 10 }}>
        {releasePaths.map(path => (
          <article key={path.title} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{path.title}</h2>
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

        <article style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>ECG Challenge</h2>
              <p style={{ color: C.sub, fontSize: '0.9rem', lineHeight: 1.55, margin: '7px 0 0' }}>5 ECG cases with findings and explanations</p>
            </div>
            <span style={{ color: accessColor.FREE, border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 7px', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
              FREE
            </span>
          </div>

          <Link href="/labs/ecg-challenge" style={{ ...actionStyle, color: accessColor.FREE, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            Open ECG Challenge →
          </Link>
        </article>

        <section aria-labelledby="atlas-plan-title" style={{ ...cardStyle, borderColor: C.border }}>
          <div style={{ color: C.violet, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>APP STORE PLAN</div>
          <h2 id="atlas-plan-title" style={{ fontSize: '1.05rem', margin: '7px 0 6px' }}>Review Cliniverse PRO</h2>
          <p style={{ margin: 0, color: C.sub, fontSize: '0.9rem', lineHeight: 1.55 }}>
            See available plans and pricing in the iOS app, or restore an existing App Store subscription.
          </p>
          <button type="button" onClick={onOpenPlan} style={{ ...actionStyle, color: C.violet }}>
            View plan →
          </button>
        </section>

        <p style={boundaryStyle}>
          Designed for learning and simulation. Not for diagnosis, prescribing or managing real patient care.
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
  minWidth: 0,
  overflowWrap: 'anywhere',
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
  minHeight: 48,
  padding: 12,
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
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
