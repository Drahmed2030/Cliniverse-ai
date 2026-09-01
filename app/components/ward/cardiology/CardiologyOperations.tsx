'use client'

import { useState } from 'react'
import type { CardiologyModuleId } from '../../../lib/cardiology'
import ChestPainCensus from './ChestPainCensus'
import NotesOrdersTracker from './NotesOrdersTracker'
import OperationsOverview from './OperationsOverview'
import QapasDirectSimulation from './QapasDirectSimulation'
import StructuredHandover from './StructuredHandover'
import SurgicalList from './SurgicalList'
import { CARDIOLOGY_COLORS as C, compactButtonStyle, panelStyle } from './styles'
import { useCardiologyOperations } from './useCardiologyOperations'

const modules: Array<{ id: CardiologyModuleId; label: string }> = [
  { id: 'overview', label: 'On-call' },
  { id: 'pathway', label: 'QAPAS Direct' },
  { id: 'census', label: 'Census' },
  { id: 'surgery', label: 'Surgical' },
  { id: 'tasks', label: 'Notes & Orders' },
  { id: 'handover', label: 'Handover' },
]

export default function CardiologyOperations() {
  const [activeModule, setActiveModule] = useState<CardiologyModuleId>('overview')
  const {
    state,
    saveStatus,
    cycleCaseStatus,
    toggleSurgicalCheck,
    cycleTaskStatus,
    saveHandover,
    resetSimulation,
  } = useCardiologyOperations()

  return (
    <section aria-labelledby="cardiology-operations-title" style={{ color: C.text }}>
      <div style={{ ...panelStyle, background: `linear-gradient(145deg, ${C.panel}, ${C.elevated})`, marginBottom: 12 }}>
        <div style={{ color: C.teal, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>INTERNAL OPERATIONS MVP</div>
        <h2 id="cardiology-operations-title" style={{ margin: '8px 0 7px', fontSize: 24 }}>Cardiology Operations</h2>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>
          One operational workspace for on-call coordination, pathway census, surgical lists, notes and orders accountability, and structured handover.
        </p>
        <div style={{ marginTop: 12, borderRadius: 13, border: '1px solid rgba(251,191,36,0.24)', background: 'rgba(251,191,36,0.06)', color: '#E8D49A', padding: 11, fontSize: 11, lineHeight: 1.55 }}>
          Internal simulation only. Do not enter real patient data. This workspace does not provide diagnosis, treatment advice, order entry, or clinical decision support.
        </div>
      </div>

      <nav aria-label="Cardiology Operations modules" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 0 10px', WebkitOverflowScrolling: 'touch' }}>
        {modules.map(module => (
          <button
            key={module.id}
            type="button"
            aria-current={activeModule === module.id ? 'page' : undefined}
            onClick={() => setActiveModule(module.id)}
            style={{ ...compactButtonStyle, flex: '0 0 auto', borderColor: activeModule === module.id ? 'rgba(45,212,191,0.60)' : C.border, background: activeModule === module.id ? 'rgba(13,148,136,0.24)' : C.panel, color: activeModule === module.id ? C.teal : C.sub, fontSize: 11 }}
          >
            {module.label}
          </button>
        ))}
      </nav>

      {activeModule === 'overview' && <OperationsOverview cases={state.cases} tasks={state.tasks} onOpenModule={setActiveModule} />}
      {activeModule === 'pathway' && <QapasDirectSimulation />}
      {activeModule === 'census' && <ChestPainCensus cases={state.cases} onCycleStatus={cycleCaseStatus} />}
      {activeModule === 'surgery' && <SurgicalList items={state.surgicalItems} onToggle={toggleSurgicalCheck} />}
      {activeModule === 'tasks' && <NotesOrdersTracker tasks={state.tasks} onCycleStatus={cycleTaskStatus} />}
      {activeModule === 'handover' && <StructuredHandover cases={state.cases} handovers={state.handovers} onSave={saveHandover} />}

      <footer style={{ marginTop: 14, padding: '12px 4px 2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div aria-live="polite" style={{ color: C.sub, fontSize: 10, lineHeight: 1.45 }}>{saveStatus}</div>
        <button type="button" onClick={resetSimulation} style={{ border: 0, background: 'transparent', color: C.blue, padding: 6, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
          Reset demo
        </button>
      </footer>
    </section>
  )
}
