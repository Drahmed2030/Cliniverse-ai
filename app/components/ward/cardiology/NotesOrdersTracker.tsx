'use client'

import { useState } from 'react'
import type { OperationalTask, OperationalTaskKind } from '../../../lib/cardiology'
import { taskStatusLabels } from './labels'
import { CARDIOLOGY_COLORS as C, compactButtonStyle, fieldStyle, labelStyle, panelStyle } from './styles'

type TaskFilter = 'all' | OperationalTaskKind

interface NotesOrdersTrackerProps {
  tasks: OperationalTask[]
  onCycleStatus: (taskId: string) => void
}

export default function NotesOrdersTracker({ tasks, onCycleStatus }: NotesOrdersTrackerProps) {
  const [filter, setFilter] = useState<TaskFilter>('all')
  const visibleTasks = filter === 'all' ? tasks : tasks.filter(task => task.kind === filter)

  return (
    <section aria-labelledby="tasks-title">
      <div style={{ ...panelStyle, marginBottom: 12 }}>
        <div style={{ color: C.red, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>ACCOUNTABILITY</div>
        <h3 id="tasks-title" style={{ margin: '8px 0 6px', fontSize: 20 }}>Notes & Orders Tracking</h3>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.6 }}>
          Records simulated acknowledgement and completion state only. It cannot place, alter, approve, or transmit a clinical order.
        </p>
      </div>

      <label htmlFor="task-filter" style={labelStyle}>Filter work item</label>
      <select id="task-filter" value={filter} onChange={event => setFilter(event.target.value as TaskFilter)} style={{ ...fieldStyle, marginBottom: 12 }}>
        <option value="all">Notes and orders</option>
        <option value="note">Notes only</option>
        <option value="order">Orders only</option>
      </select>

      <div style={{ display: 'grid', gap: 10 }}>
        {visibleTasks.map(task => (
          <article key={task.id} style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ color: task.kind === 'note' ? C.blue : C.violet, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>{task.kind}</div>
                <div style={{ fontWeight: 850, marginTop: 5 }}>{task.label}</div>
                <div style={{ color: C.sub, fontSize: 11, marginTop: 5 }}>{task.caseId} · {task.owner}</div>
              </div>
              <div style={{ color: task.status === 'done' ? C.teal : C.gold, fontSize: 10, fontWeight: 900 }}>{taskStatusLabels[task.status]}</div>
            </div>
            <button type="button" onClick={() => onCycleStatus(task.id)} style={{ ...compactButtonStyle, width: '100%', marginTop: 12, color: C.teal }}>
              Advance simulated state
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
