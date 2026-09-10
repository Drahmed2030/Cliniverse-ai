'use client'

import MeAccountSummary from './MeAccountSummary'
import AchievementsHub from './AchievementsHub'
import LifeDeviceBoundary from './LifeDeviceBoundary'

const C = {
  panel: 'var(--cv-surface)',
  elevated: 'var(--cv-surface-elevated)',
  border: 'var(--cv-border)',
  text: 'var(--cv-text)',
  sub: 'var(--cv-text-secondary)',
  blue: 'var(--cv-blue)',
  teal: 'var(--cv-teal)',
  gold: 'var(--cv-gold)',
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
    detail: 'Manual entries are labelled as manual. Device data appears only after a real Apple Health integration is verified.',
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
    <section aria-labelledby="me-title" data-commercial-me-surface>
      <div style={introStyle}>
        <div style={{ color: C.blue, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>ONE ACCOUNT DESTINATION</div>
        <h1 id="me-title" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', margin: '7px 0 8px' }}>Me</h1>
        <p style={{ margin: 0, color: C.sub, fontSize: '0.95rem', lineHeight: 1.65, maxWidth: 720 }}>
          Profile, plan, learning achievements, Life, privacy and settings share one identity and one account state across Cliniverse.
        </p>
      </div>

      <MeAccountSummary />

      <div style={{ marginTop: 12 }}>
        <AchievementsHub />
      </div>

      <div style={{ marginTop: 12 }}>
        <LifeDeviceBoundary />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 10, marginTop: 12 }}>
        {sections.map(section => (
          <article key={section.title} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{section.title}</div>
              <span
                style={{
                  color: statusColor[section.status],
                  border: `1px solid color-mix(in srgb, ${statusColor[section.status]} 35%, transparent)`,
                  borderRadius: 999,
                  padding: '4px 7px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                {statusLabel[section.status]}
              </span>
            </div>
            <p style={{ color: C.sub, fontSize: '0.9rem', lineHeight: 1.55, margin: '10px 0 0' }}>{section.description}</p>
            <div style={{ marginTop: 12, padding: 11, borderRadius: 12, background: C.elevated, color: C.sub, fontSize: '0.85rem', lineHeight: 1.55 }}>
              {section.detail}
            </div>
            {section.links ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {section.links.map(link => (
                  <a key={link.href} href={link.href} style={{ padding: '8px 11px', borderRadius: 999, border: `1px solid ${C.border}`, color: C.teal, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 800 }}>
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 10, borderColor: C.border }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: C.teal }}>Identity rule</div>
        <div style={{ marginTop: 5, color: C.sub, fontSize: '0.82rem', lineHeight: 1.6 }}>
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
