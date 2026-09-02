import type { NexusModuleId, NexusSafetyTimelineItem } from '../../lib/nexus'
import ReflectionPanel from './ReflectionPanel'
import { NEXUS_COLORS as C, nexusPanelStyle } from './styles'

interface SafetyReviewProps {
  timeline: NexusSafetyTimelineItem[]
  factors: string[]
  reflection: string
  completed: boolean
  onChange: (moduleId: NexusModuleId, reflection: string) => void
  onComplete: (moduleId: NexusModuleId) => void
}

export default function SafetyReview({ timeline, factors, reflection, completed, onChange, onComplete }: SafetyReviewProps) {
  return (
    <article aria-labelledby="nexus-safety-title">
      <div style={nexusPanelStyle}>
        <div style={{ color: C.gold, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>SAFETY REVIEW · NO-BLAME</div>
        <h3 id="nexus-safety-title" style={{ margin: '8px 0 6px', fontSize: 20 }}>System conditions and recovery barriers</h3>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>
          Reconstruct the fictional workflow without attributing fault, estimating harm, or drawing conclusions about a real person or organization.
        </p>
      </div>

      <ol style={{ display: 'grid', gap: 10, margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
        {timeline.map((item, index) => (
          <li key={item.id} style={nexusPanelStyle}>
            <div style={{ color: C.gold, fontSize: 9, fontWeight: 900 }}>STEP {index + 1} · {item.phase.toUpperCase()}</div>
            <p style={{ margin: '6px 0 0', color: C.sub, fontSize: 12, lineHeight: 1.6 }}>{item.observation}</p>
          </li>
        ))}
      </ol>

      <div style={{ ...nexusPanelStyle, marginTop: 12 }}>
        <h4 style={{ margin: '0 0 9px', fontSize: 14 }}>Potential system factors for discussion</h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>
          {factors.map(factor => <li key={factor}>{factor}</li>)}
        </ul>
      </div>

      <ReflectionPanel
        moduleId="safety"
        prompt="Propose one process barrier and one recovery action for this fictional workflow."
        reflection={reflection}
        completed={completed}
        onChange={onChange}
        onComplete={onComplete}
      />
    </article>
  )
}
