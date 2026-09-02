'use client'

const C = {
  panel: '#111827',
  elevated: '#172033',
  border: 'rgba(148,163,184,0.20)',
  text: '#F8FAFC',
  sub: '#94A3B8',
  blue: '#3B82F6',
  teal: '#14B8A6',
  violet: '#8B5CF6',
  gold: '#D4A72C',
}

const achievementGroups = [
  {
    title: 'Progress',
    description: 'XP, streaks and completed learning activities.',
    state: 'Educational progression',
    accent: C.blue,
  },
  {
    title: 'Ranks & Badges',
    description: 'In-platform milestones earned through simulation and educational activity.',
    state: 'Not a professional credential',
    accent: C.violet,
  },
  {
    title: 'Certificates',
    description: 'Achievement certificates summarising in-platform activity and completion history.',
    state: 'Not CME / board accreditation',
    accent: C.gold,
  },
]

export default function AchievementsHub() {
  return (
    <section aria-labelledby="achievements-title">
      <div style={cardStyle}>
        <div style={{ color: C.teal, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>ACADEMY ACHIEVEMENTS</div>
        <h2 id="achievements-title" style={{ margin: '7px 0 8px', fontSize: 21 }}>Learning progress</h2>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>
          Progress, ranks, badges and certificates are educational records inside Cliniverse. They do not represent medical licensure, board status, CME credit or external accreditation unless separately verified and documented.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 10, marginTop: 10 }}>
        {achievementGroups.map(group => (
          <article key={group.title} style={cardStyle}>
            <div style={{ color: group.accent, fontSize: 15, fontWeight: 800 }}>{group.title}</div>
            <p style={{ color: C.sub, fontSize: 12, lineHeight: 1.55, margin: '8px 0 0' }}>{group.description}</p>
            <div style={{ marginTop: 12, padding: 10, borderRadius: 12, background: C.elevated, color: group.accent, fontSize: 10, fontWeight: 800 }}>
              {group.state}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const cardStyle = {
  padding: 16,
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  background: C.panel,
  color: C.text,
} as const
