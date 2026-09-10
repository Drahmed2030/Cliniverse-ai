'use client'

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

type SourceState = 'manual' | 'device' | 'sample' | 'not_connected'

const items: Array<{
  title: string
  state: SourceState
  detail: string
}> = [
  {
    title: 'Manual wellness',
    state: 'manual',
    detail: 'User-entered context remains available, but is explicitly labelled Manual and is never presented as live sensor data.',
  },
  {
    title: 'Apple Health / Apple Watch',
    state: 'not_connected',
    detail: 'Hidden from connected-data claims until native HealthKit permissions, source attribution and physical-device testing are complete.',
  },
  {
    title: 'Demo / educational vitals',
    state: 'sample',
    detail: 'Allowed only in clearly marked demo or simulation surfaces and never in the user wellness record.',
  },
]

const label: Record<SourceState, string> = {
  manual: 'Manual',
  device: 'Connected device',
  sample: 'Sample only',
  not_connected: 'Not connected',
}

const color: Record<SourceState, string> = {
  manual: C.blue,
  device: C.teal,
  sample: C.gold,
  not_connected: C.gold,
}

export default function LifeDeviceBoundary() {
  return (
    <section aria-labelledby="life-device-title">
      <div style={cardStyle}>
        <div style={{ color: C.gold, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>LIFE & DEVICES</div>
        <h2 id="life-device-title" style={{ margin: '7px 0 8px', fontSize: 'clamp(1.3rem, 2vw, 1.6rem)' }}>Know where every health value came from.</h2>
        <p style={{ margin: 0, color: C.sub, fontSize: '0.9rem', lineHeight: 1.65 }}>
          Cliniverse separates manual wellness context, verified device data and samples so no user has to guess whether a value is actually connected.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 10, marginTop: 10 }}>
        {items.map(item => (
          <article key={item.title} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{item.title}</div>
              <span style={{ color: color[item.state], border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 7px', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                {label[item.state]}
              </span>
            </div>
            <p style={{ color: C.sub, fontSize: '0.85rem', lineHeight: 1.6, margin: '10px 0 0' }}>{item.detail}</p>
          </article>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 10, background: C.elevated }}>
        <div style={{ color: C.teal, fontSize: '0.85rem', fontWeight: 800 }}>Connection contract</div>
        <div style={{ color: C.sub, fontSize: '0.85rem', lineHeight: 1.65, marginTop: 6 }}>
          Connected metrics must carry a source, timestamp and permission-aware connection state. Until that contract is implemented natively, the release UI must say Not connected.
        </div>
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
