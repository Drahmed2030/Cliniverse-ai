'use client'

import MeAccountSummary from './MeAccountSummary'

const C = {
  panel: '#111827',
  elevated: '#172033',
  border: 'rgba(148,163,184,0.20)',
  text: '#F8FAFC',
  sub: '#94A3B8',
  blue: '#3B82F6',
  teal: '#14B8A6',
  gold: '#D4A72C',
}

type Status = 'ready' | 'foundation' | 'gated'

const sections: Array<{
  title: string
  description: string
  status: Status
  detail: string
  links?: Array<{ label: string; href: string }>
}> = [
  {
    title: 'Life',
    description: 'Personal wellness context kept separate from clinical workflow data.',
    status: 'gated',
    detail: 'Manual entries are labelled as manual. Device data appears only after a real Apple Health / Health Connect integration is verified.',
  },
  {
    title: 'Privacy & Support',
    description: 'Security, data controls, support and account preferences in one predictable place.',
    status: 'ready',
    detail: 'Privacy, terms and support links are available from the release account surface.',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Support', href: '/support' },
    ],
  },
]

const statusLabel: Record<Status, string> = {
  ready: 'Release structure ready',
  foundation: 'Foundation in progress',
  gated: 'Gated until verified',
}

const statusColor: Record<Status, string> = {
  ready: C.teal,
  foundation: C.blue,
  gated: C.gold,
}

export default function MeHub() {
  return (
    <section aria-labelledby="me-title">
      <div style={introStyle}>
        <div style={{ color: C.blue, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>ONE ACCOUNT DESTINATION</div>
        <h1 id="me-title" style={{ fontSize: 26, margin: '7px 0 8px' }}>Me</h1>
        <p style={{ margin: 0, color: C.sub, fontSize: 13, lineHeight: 1.65, maxWidth: 720 }}>
          Profile, plan, Life, privacy and settings live here so the user has one identity and one account state across Cliniverse.
        </p>
      </div>

      <MeAccountSummary />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 10, marginTop: 12 }}>
        {sections.map(section => (
          <article key={section.title} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{section.title}</div>
              <span
                style={{
                  color: statusColor[section.status],
                  border: `1px solid ${statusColor[section.status]}44`,
                  borderRadius: 999,
                  padding: '4px 7px',
                  fontSize: 9,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                {statusLabel[section.status]}
              </span>
            </div>
            <p style={{ color: C.sub, fontSize: 12, lineHeight: 1.55, margin: '10px 0 0' }}>{section.description}</p>
            <div style={{ marginTop: 12, padding: 11, borderRadius: 12, background: C.elevated, color: '#CBD5E1', fontSize: 11, lineHeight: 1.55 }}>
              {section.detail}
            </div>
            {section.links ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {section.links.map(link => (
                  <a key={link.href} href={link.href} style={{ padding: '8px 11px', borderRadius: 999, border: '1px solid rgba(20,184,166,0.35)', color: '#5EEAD4', textDecoration: 'none', fontSize: 11, fontWeight: 800 }}>
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 10, borderColor: 'rgba(20,184,166,0.22)' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.teal }}>Identity rule</div>
        <div style={{ marginTop: 5, color: C.sub, fontSize: 11, lineHeight: 1.6 }}>
          Authentication owns the user; Profile owns professional metadata; Entitlement owns access; Life owns wellness context. No surface may create a second identity or activate PRO locally.
        </div>
      </div>
    </section>
  )
}

const introStyle = {
  padding: 16,
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  background: C.panel,
  marginBottom: 12,
} as const

const cardStyle = {
  padding: 16,
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  background: C.panel,
  color: C.text,
} as const
