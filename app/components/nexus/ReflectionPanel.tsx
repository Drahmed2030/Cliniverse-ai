import { NEXUS_REFLECTION_MIN_LENGTH, type NexusModuleId } from '../../lib/nexus'
import { NEXUS_COLORS as C, nexusButtonStyle, nexusFieldStyle, nexusLabelStyle, nexusPanelStyle } from './styles'

interface ReflectionPanelProps {
  moduleId: NexusModuleId
  prompt: string
  reflection: string
  completed: boolean
  onChange: (moduleId: NexusModuleId, reflection: string) => void
  onComplete: (moduleId: NexusModuleId) => void
}

export default function ReflectionPanel({
  moduleId,
  prompt,
  reflection,
  completed,
  onChange,
  onComplete,
}: ReflectionPanelProps) {
  const ready = reflection.trim().length >= NEXUS_REFLECTION_MIN_LENGTH
  const fieldId = `nexus-reflection-${moduleId}`

  return (
    <div style={{ ...nexusPanelStyle, marginTop: 12, background: '#0C1727' }}>
      <label htmlFor={fieldId} style={nexusLabelStyle}>{prompt}</label>
      <textarea
        id={fieldId}
        value={reflection}
        maxLength={800}
        onChange={event => onChange(moduleId, event.target.value)}
        placeholder="Write a short systems-focused reflection using fictional information only."
        style={nexusFieldStyle}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
        <span style={{ color: ready ? C.teal : C.sub, fontSize: 10 }}>
          {reflection.trim().length}/800 · {ready ? 'Ready to complete' : `Minimum ${NEXUS_REFLECTION_MIN_LENGTH} characters`}
        </span>
        <button
          type="button"
          disabled={!ready}
          onClick={() => onComplete(moduleId)}
          style={{
            ...nexusButtonStyle,
            opacity: ready ? 1 : 0.48,
            cursor: ready ? 'pointer' : 'not-allowed',
            borderColor: completed ? 'rgba(45,212,191,0.60)' : C.border,
            background: completed ? 'rgba(13,148,136,0.24)' : C.elevated,
            color: completed ? C.teal : C.text,
          }}
        >
          {completed ? 'Module complete' : 'Complete module'}
        </button>
      </div>
    </div>
  )
}
