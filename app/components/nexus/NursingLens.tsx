import type { NexusLearningPrompt, NexusModuleId } from '../../lib/nexus'
import ReflectionPanel from './ReflectionPanel'
import { NEXUS_COLORS as C, nexusPanelStyle } from './styles'

interface NursingLensProps {
  prompts: NexusLearningPrompt[]
  reflection: string
  completed: boolean
  onChange: (moduleId: NexusModuleId, reflection: string) => void
  onComplete: (moduleId: NexusModuleId) => void
}

export default function NursingLens({ prompts, reflection, completed, onChange, onComplete }: NursingLensProps) {
  return (
    <article aria-labelledby="nexus-nursing-title">
      <div style={nexusPanelStyle}>
        <div style={{ color: C.teal, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>NURSING LENS</div>
        <h3 id="nexus-nursing-title" style={{ margin: '8px 0 6px', fontSize: 20 }}>Continuity, observation, and ownership</h3>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>
          Review communication structure only. This module does not score deterioration, interpret observations, or recommend escalation thresholds.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {prompts.map(prompt => (
          <section key={prompt.id} style={nexusPanelStyle} aria-labelledby={`${prompt.id}-title`}>
            <div style={{ color: C.teal, fontSize: 9, fontWeight: 900 }}>{prompt.id}</div>
            <h4 id={`${prompt.id}-title`} style={{ margin: '5px 0 6px', fontSize: 14 }}>{prompt.title}</h4>
            <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.6 }}>{prompt.body}</p>
          </section>
        ))}
      </div>

      <ReflectionPanel
        moduleId="nursing"
        prompt="Write neutral handover language that improves ownership without adding clinical advice."
        reflection={reflection}
        completed={completed}
        onChange={onChange}
        onComplete={onComplete}
      />
    </article>
  )
}
