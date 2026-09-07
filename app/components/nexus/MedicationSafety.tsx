import type { NexusLearningPrompt, NexusModuleId } from '../../lib/nexus'
import ReflectionPanel from './ReflectionPanel'
import { NEXUS_COLORS as C, nexusPanelStyle } from './styles'

interface MedicationSafetyProps {
  prompts: NexusLearningPrompt[]
  reflection: string
  completed: boolean
  onChange: (moduleId: NexusModuleId, reflection: string) => void
  onComplete: (moduleId: NexusModuleId) => void
}

export default function MedicationSafety({ prompts, reflection, completed, onChange, onComplete }: MedicationSafetyProps) {
  return (
    <article aria-labelledby="nexus-medication-title">
      <div style={nexusPanelStyle}>
        <div style={{ color: C.violet, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>MEDICATION SAFETY</div>
        <h3 id="nexus-medication-title" style={{ margin: '8px 0 6px', fontSize: 20 }}>Reconciliation workflow, not prescribing</h3>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>
          This learning surface documents workflow gaps and human-review ownership. It never supplies drug selection, dosing, interaction analysis, or treatment recommendations.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {prompts.map(prompt => (
          <section key={prompt.id} style={nexusPanelStyle} aria-labelledby={`${prompt.id}-title`}>
            <div style={{ color: C.violet, fontSize: 9, fontWeight: 900 }}>{prompt.id}</div>
            <h4 id={`${prompt.id}-title`} style={{ margin: '5px 0 6px', fontSize: 14 }}>{prompt.title}</h4>
            <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.6 }}>{prompt.body}</p>
          </section>
        ))}
      </div>

      <ReflectionPanel
        moduleId="medication"
        prompt="How should the fictional review request be owned, acknowledged, and closed?"
        reflection={reflection}
        completed={completed}
        onChange={onChange}
        onComplete={onComplete}
      />
    </article>
  )
}
