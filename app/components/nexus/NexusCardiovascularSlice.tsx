'use client'

import {
  NEXUS_MODULE_IDS,
  canRevealNexusDebrief,
  nexusCardiovascularCase,
  type NexusModuleId,
} from '../../lib/nexus'
import CaseHuddle from './CaseHuddle'
import MedicationSafety from './MedicationSafety'
import NursingLens from './NursingLens'
import SafetyReview from './SafetyReview'
import { NEXUS_COLORS as C, nexusButtonStyle, nexusPanelStyle } from './styles'
import { useNexusLearning } from './useNexusLearning'

const modules: Array<{ id: NexusModuleId; label: string }> = [
  { id: 'huddle', label: 'Case Huddle' },
  { id: 'nursing', label: 'Nursing Lens' },
  { id: 'medication', label: 'Medication Safety' },
  { id: 'safety', label: 'Safety Review' },
]

export default function NexusCardiovascularSlice() {
  const {
    state,
    saveStatus,
    setActiveModule,
    updateReflection,
    completeModule,
    setFictionalBoundaryConfirmed,
    revealDebrief,
    resetExercise,
  } = useNexusLearning()
  const exercise = nexusCardiovascularCase
  const debriefReady = canRevealNexusDebrief(state)

  return (
    <section aria-labelledby="nexus-cardiovascular-title" style={{ color: C.text, background: C.background }}>
      <div style={{ ...nexusPanelStyle, background: `linear-gradient(145deg, ${C.panel}, ${C.elevated})`, marginBottom: 12 }}>
        <div style={{ color: C.teal, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>CLINIVERSE PRO · NEXUS LEARNING</div>
        <h2 id="nexus-cardiovascular-title" style={{ margin: '8px 0 7px', fontSize: 24 }}>Cardiovascular Reliability Huddle</h2>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>
          Four coordinated perspectives on one fictional workflow: case huddle, nursing continuity, medication reconciliation, and no-blame safety review.
        </p>
        <div style={{ marginTop: 12, borderRadius: 13, border: '1px solid rgba(251,191,36,0.26)', background: 'rgba(251,191,36,0.07)', color: '#F4DEA2', padding: 11, fontSize: 11, lineHeight: 1.55 }}>
          {exercise.boundaryNotice}
        </div>
      </div>

      <nav aria-label="Nexus learning modules" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 0 10px', WebkitOverflowScrolling: 'touch' }}>
        {modules.map(module => {
          const selected = state.activeModule === module.id
          const completed = state.completedModules.includes(module.id)
          return (
            <button
              key={module.id}
              type="button"
              aria-current={selected ? 'step' : undefined}
              onClick={() => setActiveModule(module.id)}
              style={{
                ...nexusButtonStyle,
                flex: '0 0 auto',
                borderColor: selected ? 'rgba(45,212,191,0.62)' : C.border,
                background: selected ? 'rgba(13,148,136,0.24)' : C.panel,
                color: selected ? C.teal : C.sub,
                fontSize: 11,
              }}
            >
              {completed ? '✓ ' : ''}{module.label}
            </button>
          )
        })}
      </nav>

      {state.activeModule === 'huddle' && (
        <CaseHuddle
          exercise={exercise}
          reflection={state.reflections.huddle}
          completed={state.completedModules.includes('huddle')}
          onChange={updateReflection}
          onComplete={completeModule}
        />
      )}
      {state.activeModule === 'nursing' && (
        <NursingLens
          prompts={exercise.nursingPrompts}
          reflection={state.reflections.nursing}
          completed={state.completedModules.includes('nursing')}
          onChange={updateReflection}
          onComplete={completeModule}
        />
      )}
      {state.activeModule === 'medication' && (
        <MedicationSafety
          prompts={exercise.medicationPrompts}
          reflection={state.reflections.medication}
          completed={state.completedModules.includes('medication')}
          onChange={updateReflection}
          onComplete={completeModule}
        />
      )}
      {state.activeModule === 'safety' && (
        <SafetyReview
          timeline={exercise.safetyTimeline}
          factors={exercise.contributoryFactors}
          reflection={state.reflections.safety}
          completed={state.completedModules.includes('safety')}
          onChange={updateReflection}
          onComplete={completeModule}
        />
      )}

      <section aria-labelledby="nexus-debrief-title" style={{ ...nexusPanelStyle, marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ color: C.violet, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>GATED DEBRIEF</div>
            <h3 id="nexus-debrief-title" style={{ margin: '7px 0 5px', fontSize: 18 }}>Reliability synthesis</h3>
          </div>
          <span style={{ color: debriefReady ? C.teal : C.gold, fontSize: 10, fontWeight: 900 }}>
            {state.completedModules.length}/{NEXUS_MODULE_IDS.length} complete
          </span>
        </div>

        {!state.debriefRevealed && (
          <>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 12, color: C.sub, fontSize: 12, lineHeight: 1.55 }}>
              <input
                type="checkbox"
                checked={state.fictionalBoundaryConfirmed}
                onChange={event => setFictionalBoundaryConfirmed(event.target.checked)}
                style={{ marginTop: 3 }}
              />
              I confirm that my reflections contain fictional learning information only and no real patient or identifiable data.
            </label>
            <button
              type="button"
              disabled={!debriefReady}
              onClick={revealDebrief}
              style={{
                ...nexusButtonStyle,
                width: '100%',
                marginTop: 12,
                background: debriefReady ? 'rgba(13,148,136,0.28)' : C.elevated,
                borderColor: debriefReady ? 'rgba(45,212,191,0.62)' : C.border,
                color: debriefReady ? C.teal : C.sub,
                opacity: debriefReady ? 1 : 0.55,
                cursor: debriefReady ? 'pointer' : 'not-allowed',
              }}
            >
              Reveal debrief after all modules
            </button>
          </>
        )}

        {state.debriefRevealed && (
          <div aria-live="polite" style={{ marginTop: 12 }}>
            <ul style={{ margin: 0, paddingLeft: 20, color: C.sub, fontSize: 12, lineHeight: 1.7 }}>
              {exercise.debriefPoints.map(point => <li key={point} style={{ marginBottom: 7 }}>{point}</li>)}
            </ul>
          </div>
        )}
      </section>

      <footer style={{ marginTop: 14, padding: '12px 4px 2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div aria-live="polite" style={{ color: C.sub, fontSize: 10, lineHeight: 1.45 }}>{saveStatus}</div>
        <button type="button" onClick={resetExercise} style={{ border: 0, background: 'transparent', color: C.blue, padding: 6, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
          Reset exercise
        </button>
      </footer>
    </section>
  )
}
