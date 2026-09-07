import type { CardiologyCase, CardiologyModuleId, OperationalTask } from '../../../lib/cardiology'
import { caseStatusLabels, pathwayLabels, priorityLabels } from './labels'
import { CARDIOLOGY_COLORS as C, compactButtonStyle, panelStyle } from './styles'

interface OperationsOverviewProps {
  cases: CardiologyCase[]
  tasks: OperationalTask[]
  onOpenModule: (module: CardiologyModuleId) => void
}

export default function OperationsOverview({ cases, tasks, onOpenModule }: OperationsOverviewProps) {
  const openTasks = tasks.filter(task => task.status !== 'done').length
  const metrics = [
    { label: 'Active simulations', value: cases.length, accent: C.blue },
    { label: 'Time-sensitive', value: cases.filter(item => item.priority === 'time-sensitive').length, accent: C.gold },
    { label: 'Open notes & orders', value: openTasks, accent: C.red },
    { label: 'Handover ready', value: cases.filter(item => item.status === 'handover-ready').length, accent: C.teal },
  ]

  return (
    <section aria-labelledby="operations-overview-title">
      <h3 id="operations-overview-title" style={{ margin: '0 0 12px', fontSize: 20 }}>Night Shift / On-call Board</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, marginBottom: 12 }}>
        {metrics.map(metric => (
          <div key={metric.label} style={{ ...panelStyle, padding: 14 }}>
            <div style={{ color: metric.accent, fontSize: 24, fontWeight: 900 }}>{metric.value}</div>
            <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>{metric.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...panelStyle, display: 'grid', gap: 10 }}>
        {cases.map(item => (
          <article key={item.id} style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: C.elevated, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900 }}>{item.id}</div>
                <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>{item.location} · {item.shiftOwner}</div>
              </div>
              <span style={{ color: item.priority === 'time-sensitive' ? C.gold : C.teal, fontSize: 10, fontWeight: 900, textAlign: 'right' }}>
                {priorityLabels[item.priority]}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
              <span style={{ borderRadius: 999, border: `1px solid ${C.border}`, padding: '5px 8px', color: C.blue, fontSize: 10, fontWeight: 800 }}>{pathwayLabels[item.pathway]}</span>
              <span style={{ borderRadius: 999, border: `1px solid ${C.border}`, padding: '5px 8px', color: C.sub, fontSize: 10, fontWeight: 800 }}>{caseStatusLabels[item.status]}</span>
            </div>
          </article>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, marginTop: 12 }}>
        <button type="button" onClick={() => onOpenModule('census')} style={{ ...compactButtonStyle, color: C.blue }}>Open census</button>
        <button type="button" onClick={() => onOpenModule('handover')} style={{ ...compactButtonStyle, color: C.teal }}>Open handover</button>
      </div>
    </section>
  )
}
