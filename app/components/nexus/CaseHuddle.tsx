import type { NexusCardiovascularCase, NexusModuleId } from '../../lib/nexus'
import ReflectionPanel from './ReflectionPanel'
import { NEXUS_COLORS as C, nexusPanelStyle } from './styles'

interface CaseHuddleProps {
  exercise: NexusCardiovascularCase
  reflection: string
  completed: boolean
  onChange: (moduleId: NexusModuleId, reflection: string) => void
  onComplete: (moduleId: NexusModuleId) => void
}

export default function CaseHuddle({ exercise, reflection, completed, onChange, onComplete }: CaseHuddleProps) {
  return (
    <article aria-labelledby="nexus-huddle-title">
      <div style={nexusPanelStyle}>
        <div style={{ color: C.blue, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>CASE HUDDLE · FICTIONAL</div>
        <h3 id="nexus-huddle-title" style={{ margin: '8px 0 6px', fontSize: 20 }}>{exercise.title}</h3>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>{exercise.summary}</p>
        <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 8, margin: '13px 0 0' }}>
          <div><dt style={{ color: C.sub, fontSize: 9 }}>CASE ID</dt><dd style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 800 }}>{exercise.id}</dd></div>
          <div><dt style={{ color: C.sub, fontSize: 9 }}>CONTENT STATUS</dt><dd style={{ margin: '3px 0 0', color: C.gold, fontSize: 11, fontWeight: 800 }}>{exercise.contentStatus}</dd></div>
        </dl>
      </div>

      <div style={{ ...nexusPanelStyle, marginTop: 12 }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Operational signals to discuss</h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>
          {exercise.caseSignals.map(signal => <li key={signal} style={{ marginBottom: 7 }}>{signal}</li>)}
        </ul>
      </div>

      <ReflectionPanel
        moduleId="huddle"
        prompt="What should the fictional team clarify first, and why?"
        reflection={reflection}
        completed={completed}
        onChange={onChange}
        onComplete={onComplete}
      />
    </article>
  )
}
