import type { SurgicalChecklistKey, SurgicalListItem } from '../../../lib/cardiology'
import { CARDIOLOGY_COLORS as C, compactButtonStyle, panelStyle } from './styles'

const checklistLabels: Record<SurgicalChecklistKey, string> = {
  identity: 'Simulation identity checked',
  documents: 'Documents reviewed',
  destination: 'Destination confirmed',
}

interface SurgicalListProps {
  items: SurgicalListItem[]
  onToggle: (itemId: string, key: SurgicalChecklistKey) => void
}

export default function SurgicalList({ items, onToggle }: SurgicalListProps) {
  return (
    <section aria-labelledby="surgical-list-title">
      <div style={{ ...panelStyle, marginBottom: 12 }}>
        <div style={{ color: C.violet, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>SHIFT LIST</div>
        <h3 id="surgical-list-title" style={{ margin: '8px 0 6px', fontSize: 20 }}>Surgical List</h3>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.6 }}>
          A fictional operational checklist. It does not replace consent, theatre verification, or hospital policy.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {items.map(item => {
          const complete = Object.values(item.checklist).filter(Boolean).length
          return (
            <article key={item.id} style={panelStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{item.label}</div>
                  <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>{item.caseId} · {item.area}</div>
                </div>
                <div style={{ color: complete === 3 ? C.teal : C.gold, fontSize: 11, fontWeight: 900 }}>{complete}/3</div>
              </div>
              <div style={{ color: C.blue, fontSize: 11, fontWeight: 800, marginTop: 10 }}>{item.window}</div>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                {(Object.keys(checklistLabels) as SurgicalChecklistKey[]).map(key => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={item.checklist[key]}
                    onClick={() => onToggle(item.id, key)}
                    style={{ ...compactButtonStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', color: item.checklist[key] ? C.teal : C.sub }}
                  >
                    <span>{checklistLabels[key]}</span>
                    <span aria-hidden="true">{item.checklist[key] ? '✓' : '○'}</span>
                  </button>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
