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

type State = 'ship' | 'educational' | 'gated'

const groups: Array<{
  title: string
  description: string
  state: State
  examples: string[]
}> = [
  {
    title: 'Reference',
    description: 'Lower-risk reference and calculation utilities that can be released after individual verification.',
    state: 'ship',
    examples: ['Drug reference', 'Medical calculators', 'Evidence lookup'],
  },
  {
    title: 'Simulation & Training',
    description: 'Educational experiences remain clearly separated from real-patient workflow and clinical decision support.',
    state: 'educational',
    examples: ['Virtual Ward simulation', 'Code Blue', 'BLS / ACLS', 'Board exam'],
  },
  {
    title: 'Advanced Clinical AI',
    description: 'Higher-risk analysis stays preserved in the codebase but hidden from the release surface until safety, auth and validation gates pass.',
    state: 'gated',
    examples: ['Imaging analysis', 'Symptom interpretation', 'Prescription / dosing AI'],
  },
]

const stateText: Record<State, string> = {
  ship: 'Release candidate',
  educational: 'Educational mode',
  gated: 'Not exposed in release',
}

const stateColor: Record<State, string> = {
  ship: C.teal,
  educational: C.violet,
  gated: C.gold,
}

export default function AtlasReleaseCatalog() {
  return (
    <section aria-labelledby="atlas-title">
      <div style={introStyle}>
        <div style={{ color: C.blue, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>CURATED CAPABILITY LIBRARY</div>
        <h1 id="atlas-title" style={{ fontSize: 26, margin: '7px 0 8px' }}>Atlas</h1>
        <p style={{ margin: 0, color: C.sub, fontSize: 13, lineHeight: 1.65, maxWidth: 760 }}>
          Atlas preserves Cliniverse&apos;s breadth without presenting every module as equally ready. Each capability is classified before it becomes visible to users.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {groups.map(group => (
          <article key={group.title} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{group.title}</div>
                <p style={{ color: C.sub, fontSize: 12, lineHeight: 1.55, margin: '7px 0 0' }}>{group.description}</p>
              </div>
              <span style={{ color: stateColor[group.state], border: `1px solid ${stateColor[group.state]}44`, borderRadius: 999, padding: '4px 7px', fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {stateText[group.state]}
              </span>
            </div>
            <div aria-label={`${group.title} capability examples`} style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {group.examples.map(item => (
                <span
                  key={item}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 999,
                    background: C.elevated,
                    color: '#CBD5E1',
                    fontSize: 10,
                    fontFamily: 'inherit',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
        <p
          style={{ margin: 0, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(20,184,166,0.28)', background: 'rgba(20,184,166,0.07)', color: '#CBD5E1', fontSize: 11, lineHeight: 1.55 }}
        >
          Catalog note: capability names are release-status labels, not launch controls. Only completed and individually verified tools will become interactive.
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
  marginBottom: 12,
} as const

const cardStyle = {
  padding: 16,
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  background: C.panel,
  color: C.text,
} as const
