'use client'

import { useMemo, useState } from 'react'
import {
  appendIdentifier,
  applyNexusEvent,
  calculateKpiDrafts,
  createNexusCase,
  createSyntheticClockEvent,
  createSyntheticTransitionEvent,
  getNextTransition,
  NEXUS_REFERENCE_REGISTRY,
  QAPAS_KPI_BASELINES,
  QAPAS_ROLES,
  QAPAS_STEPS,
  type NexusCase,
  type NexusClockType,
  type NexusIdentifier,
  type QapasRoleId,
} from '../../../lib/cardiology'
import { CARDIOLOGY_COLORS as C, compactButtonStyle, panelStyle } from './styles'

const roleLabel = (id: QapasRoleId) => QAPAS_ROLES.find(role => role.id === id)?.label ?? id
const SIMULATION_STARTED_AT = '2026-08-31T08:00:00.000Z'

const stateStepIndex: Record<NexusCase['state'], number> = {
  draft: 0,
  'referral-received': 1,
  reviewed: 2,
  accepted: 3,
  'identity-linked': 4,
  'in-transport': 5,
  'cath-lab-activated': 6,
  arrived: 7,
  'episode-recorded': 7,
  'quality-validated': 7,
}

export default function QapasDirectSimulation() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [activeRole, setActiveRole] = useState<QapasRoleId>('referring')
  const [nexusCase, setNexusCase] = useState(() => createNexusCase('SIM-QD-001', 'SIM-REF-001', SIMULATION_STARTED_AT))
  const [engineMessage, setEngineMessage] = useState('Ready for the first authorized event.')
  const activeStep = QAPAS_STEPS[activeStepIndex]
  const activeRoleDetails = QAPAS_ROLES.find(role => role.id === activeRole) ?? QAPAS_ROLES[0]
  const roleAction = activeStep.roleActions[activeRole]
  const isInvolved = activeStep.owner === activeRole || activeStep.supportingRoles.includes(activeRole)
  const nextTransition = getNextTransition(nexusCase.state)
  const roleCanAdvance = nextTransition?.allowedRoles.includes(activeRole) ?? false
  const kpiDrafts = useMemo(() => calculateKpiDrafts(nexusCase.events), [nexusCase.events])
  const relatedKpis = useMemo(
    () => QAPAS_KPI_BASELINES.filter(kpi => activeStep.relatedKpis.includes(kpi.id)),
    [activeStep],
  )

  const move = (direction: -1 | 1) => {
    setActiveStepIndex(current => Math.min(QAPAS_STEPS.length - 1, Math.max(0, current + direction)))
  }

  const recordSyntheticEvent = () => {
    if (!nextTransition || !roleCanAdvance) return

    let workingCase = nexusCase
    const requiredIdentifier = nextTransition.requiredIdentifier
    if (requiredIdentifier && !workingCase.identifiers.some(identifier => identifier.kind === requiredIdentifier)) {
      const identifier = syntheticIdentifier(requiredIdentifier, workingCase.events.length)
      const linkResult = appendIdentifier(workingCase, identifier)
      if (!linkResult.ok) {
        setEngineMessage(linkResult.error.message)
        return
      }
      workingCase = linkResult.value
    }

    const offsetMinutes = (workingCase.events.length + 1) * 10
    const occurredAt = new Date(Date.parse(SIMULATION_STARTED_AT) + offsetMinutes * 60_000).toISOString()
    const event = createSyntheticTransitionEvent(workingCase, nextTransition, activeRole, occurredAt)
    const result = applyNexusEvent(workingCase, event)
    if (!result.ok) {
      setEngineMessage(result.error.message)
      return
    }

    let progressedCase = result.value
    for (const clock of syntheticClocksFor(event.type, occurredAt)) {
      const clockEvent = createSyntheticClockEvent(progressedCase, clock.type, activeRole, clock.occurredAt)
      const clockResult = applyNexusEvent(progressedCase, clockEvent)
      if (!clockResult.ok) {
        setEngineMessage(clockResult.error.message)
        return
      }
      progressedCase = clockResult.value
    }

    setNexusCase(progressedCase)
    setActiveStepIndex(stateStepIndex[progressedCase.state])
    setEngineMessage(`${event.type} appended by ${roleLabel(activeRole)}. Human authority preserved.`)
  }

  return (
    <section aria-labelledby="qapas-direct-title">
      <div style={{ ...panelStyle, background: 'linear-gradient(145deg, rgba(30,58,138,0.24), rgba(15,23,42,0.96))', marginBottom: 12 }}>
        <div style={{ color: C.blue, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>CARDIO NEXUS · SYNTHETIC PATHWAY</div>
        <h3 id="qapas-direct-title" style={{ margin: '8px 0 7px', fontSize: 21 }}>QAPAS-DIRECT journey simulator</h3>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.65 }}>
          Explore how a referral case becomes an MRN, encounter, Cath episode, and auditable KPI timeline. Every identifier and event below is fictional.
        </p>
      </div>

      <div style={{ ...panelStyle, marginBottom: 12 }}>
        <div style={{ color: C.sub, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.8 }}>View as</div>
        <div role="list" aria-label="Pathway roles" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 0 4px', WebkitOverflowScrolling: 'touch' }}>
          {QAPAS_ROLES.map(role => (
            <button
              key={role.id}
              type="button"
              aria-pressed={activeRole === role.id}
              onClick={() => setActiveRole(role.id)}
              style={{ ...compactButtonStyle, minHeight: 44, flex: '0 0 auto', borderColor: activeRole === role.id ? 'rgba(96,165,250,0.65)' : C.border, background: activeRole === role.id ? 'rgba(37,99,235,0.22)' : C.elevated, color: activeRole === role.id ? C.blue : C.sub, fontSize: 11 }}
            >
              {role.label}
            </button>
          ))}
        </div>
        <p style={{ margin: '8px 0 0', color: C.sub, fontSize: 11, lineHeight: 1.55 }}>{activeRoleDetails.responsibility}</p>
      </div>

      <section aria-labelledby="nexus-engine-title" style={{ ...panelStyle, borderColor: 'rgba(167,139,250,0.35)', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: C.violet, fontSize: 10, fontWeight: 900, letterSpacing: 0.8 }}>CARDIO NEXUS CORE</div>
            <h4 id="nexus-engine-title" style={{ margin: '6px 0 0', fontSize: 16 }}>Append-only journey engine</h4>
          </div>
          <span style={{ color: nexusCase.state === 'quality-validated' ? C.teal : C.gold, fontSize: 10, fontWeight: 900, textAlign: 'right' }}>
            {nexusCase.state}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8, marginTop: 12 }}>
          <EngineMetric label="Events" value={String(nexusCase.events.length)} />
          <EngineMetric label="Identifiers" value={String(nexusCase.identifiers.length)} />
          <EngineMetric label="Version" value={String(nexusCase.version)} />
        </div>

        <div style={{ marginTop: 10, borderRadius: 14, border: `1px solid ${C.border}`, background: C.elevated, padding: 12 }}>
          <div style={{ color: C.sub, fontSize: 10, fontWeight: 900 }}>NEXT AUTHORIZED EVENT</div>
          <div style={{ marginTop: 5, color: C.text, fontSize: 11, lineHeight: 1.5 }}>
            {nextTransition
              ? `${nextTransition.eventType} · ${nextTransition.allowedRoles.map(roleLabel).join(' or ')}`
              : 'Journey validated. No further transition is defined.'}
          </div>
        </div>

        <button
          type="button"
          onClick={recordSyntheticEvent}
          disabled={!roleCanAdvance}
          style={{ ...compactButtonStyle, width: '100%', minHeight: 46, marginTop: 10, borderColor: roleCanAdvance ? 'rgba(167,139,250,0.55)' : C.border, background: roleCanAdvance ? 'rgba(109,40,217,0.20)' : C.elevated, color: roleCanAdvance ? C.violet : C.sub, opacity: nextTransition && !roleCanAdvance ? 0.58 : 1 }}
        >
          {!nextTransition
            ? 'Journey complete'
            : roleCanAdvance
              ? 'Record authorized synthetic event'
              : `Switch to ${nextTransition.allowedRoles.map(roleLabel).join(' or ')}`}
        </button>
        <div aria-live="polite" style={{ marginTop: 8, color: C.sub, fontSize: 10, lineHeight: 1.45 }}>{engineMessage}</div>
      </section>

      <div aria-label="QAPAS-DIRECT pathway steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 7, marginBottom: 12 }}>
        {QAPAS_STEPS.map((step, index) => {
          const selected = activeStepIndex === index
          const completed = index < activeStepIndex
          return (
            <button
              key={step.id}
              type="button"
              aria-current={selected ? 'step' : undefined}
              aria-label={`Step ${step.number}: ${step.title}`}
              onClick={() => setActiveStepIndex(index)}
              style={{ minHeight: 54, borderRadius: 13, border: `1px solid ${selected ? 'rgba(45,212,191,0.70)' : C.border}`, background: selected ? 'rgba(13,148,136,0.22)' : C.panel, color: selected ? C.teal : completed ? C.blue : C.sub, padding: 8, cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ display: 'block', fontSize: 10, fontWeight: 900 }}>0{step.number}</span>
              <span style={{ display: 'block', marginTop: 3, fontSize: 9, lineHeight: 1.25 }}>{step.title}</span>
            </button>
          )
        })}
      </div>

      <article style={{ ...panelStyle, borderColor: 'rgba(45,212,191,0.34)', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ color: C.teal, fontSize: 10, fontWeight: 900 }}>STEP {activeStep.number} OF {QAPAS_STEPS.length}</div>
            <h4 style={{ margin: '6px 0 0', fontSize: 19 }}>{activeStep.title}</h4>
          </div>
          <span style={{ flex: '0 0 auto', borderRadius: 999, background: 'rgba(45,212,191,0.10)', color: C.teal, padding: '6px 9px', fontSize: 9, fontWeight: 900 }}>
            OWNER · {roleLabel(activeStep.owner)}
          </span>
        </div>

        <div style={{ display: 'grid', gap: 9, marginTop: 14 }}>
          <InfoBlock label="Identity chain" value={activeStep.identifier} accent={C.blue} />
          <InfoBlock label="Operational output" value={activeStep.operationalOutput} accent={C.text} />
          <InfoBlock label="Nexus AI assist" value={activeStep.nexusAssist} accent={C.violet} />
          <InfoBlock label="Mandatory human gate" value={activeStep.humanGate} accent={C.gold} />
        </div>

        <div style={{ marginTop: 12, borderRadius: 15, border: `1px solid ${isInvolved ? 'rgba(96,165,250,0.35)' : C.border}`, background: isInvolved ? 'rgba(37,99,235,0.10)' : 'rgba(148,163,184,0.04)', padding: 12 }}>
          <div style={{ color: isInvolved ? C.blue : C.sub, fontSize: 10, fontWeight: 900 }}>{roleLabel(activeRole)} · THIS STEP</div>
          <p style={{ margin: '6px 0 0', color: C.text, fontSize: 11, lineHeight: 1.55 }}>
            {roleAction ?? 'No active input is required from this role. The event remains visible according to approved access rules.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 9, marginTop: 12 }}>
          <button type="button" onClick={() => move(-1)} disabled={activeStepIndex === 0} style={{ ...compactButtonStyle, minHeight: 44, opacity: activeStepIndex === 0 ? 0.42 : 1 }}>Previous</button>
          <button type="button" onClick={() => move(1)} disabled={activeStepIndex === QAPAS_STEPS.length - 1} style={{ ...compactButtonStyle, minHeight: 44, background: 'rgba(13,148,136,0.22)', color: C.teal, opacity: activeStepIndex === QAPAS_STEPS.length - 1 ? 0.42 : 1 }}>Next step</button>
        </div>
      </article>

      <section aria-labelledby="kpi-impact-title" style={{ ...panelStyle, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ color: C.gold, fontSize: 10, fontWeight: 900, letterSpacing: 0.8 }}>MEASUREMENT LAYER</div>
            <h4 id="kpi-impact-title" style={{ margin: '6px 0 0', fontSize: 16 }}>KPI relevance at this step</h4>
          </div>
          <span style={{ color: C.sub, fontSize: 9, textAlign: 'right' }}>Q2 2026<br />provided audit</span>
        </div>
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {relatedKpis.map(kpi => (
            <div key={kpi.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', borderRadius: 14, border: `1px solid ${C.border}`, background: C.elevated, padding: 12 }}>
              <div>
                <div style={{ color: C.blue, fontSize: 10, fontWeight: 900 }}>{kpi.id} · {kpi.target}</div>
                <div style={{ marginTop: 4, color: C.text, fontSize: 11 }}>{kpi.label}</div>
                <div style={{ marginTop: 4, color: C.sub, fontSize: 9 }}>
                  {formatKpiDraft(kpiDrafts.find(draft => draft.id === kpi.id))}
                </div>
              </div>
              <div style={{ color: C.gold, fontSize: 21, fontWeight: 900 }}>{kpi.baseline}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: '10px 0 0', color: C.sub, fontSize: 10, lineHeight: 1.5 }}>
          Baselines are reference values supplied for the prototype—not a forecast or claim of improvement. A future pilot must validate definitions, exclusions, clocks, and impact.
        </p>
      </section>

      <section aria-labelledby="reference-registry-title" style={{ ...panelStyle, marginBottom: 12 }}>
        <div style={{ color: C.blue, fontSize: 10, fontWeight: 900, letterSpacing: 0.8 }}>VERSIONED EVIDENCE</div>
        <h4 id="reference-registry-title" style={{ margin: '6px 0 0', fontSize: 16 }}>Reference registry</h4>
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {NEXUS_REFERENCE_REGISTRY.filter(reference => reference.status === 'verified-public').map(reference => (
            <a key={reference.id} href={reference.sourceUrl ?? undefined} target="_blank" rel="noreferrer" style={{ borderRadius: 14, border: `1px solid ${C.border}`, background: C.elevated, padding: 12, color: C.text, textDecoration: 'none' }}>
              <div style={{ color: C.blue, fontSize: 9, fontWeight: 900 }}>{reference.publisher} · {reference.version}</div>
              <div style={{ marginTop: 4, fontSize: 11, lineHeight: 1.45 }}>{reference.title}</div>
            </a>
          ))}
        </div>
        <p style={{ margin: '10px 0 0', color: C.sub, fontSize: 10, lineHeight: 1.5 }}>
          A reference supports a rule. It never authorizes Nexus to make a clinical decision. Local governance approves the applicable version and resolves conflicts.
        </p>
      </section>

      <div style={{ borderRadius: 16, border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(127,29,29,0.10)', color: '#FCA5A5', padding: 12, fontSize: 10, lineHeight: 1.55 }}>
        Safety boundary: synthetic demonstration only. Nexus does not diagnose, interpret ECGs, accept referrals, activate the Cath Lab, recommend treatment, merge identities, or submit KPI reports. Every consequential action requires an authorized human and the approved system of record.
      </div>
    </section>
  )
}

function InfoBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${C.border}`, background: C.elevated, padding: 12 }}>
      <div style={{ color: accent, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.65 }}>{label}</div>
      <div style={{ marginTop: 5, color: C.text, fontSize: 11, lineHeight: 1.55 }}>{value}</div>
    </div>
  )
}

function EngineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 13, border: `1px solid ${C.border}`, background: C.elevated, padding: 10, textAlign: 'center' }}>
      <div style={{ color: C.violet, fontSize: 18, fontWeight: 900 }}>{value}</div>
      <div style={{ marginTop: 3, color: C.sub, fontSize: 9 }}>{label}</div>
    </div>
  )
}

function syntheticIdentifier(kind: NexusIdentifier['kind'], eventCount: number): NexusIdentifier {
  const valueByKind: Record<NexusIdentifier['kind'], string> = {
    'referral-case-id': 'SIM-REF-001',
    mrn: 'SIM-MRN-4401',
    encounter: 'SIM-ENC-901',
    'cath-episode': 'SIM-CATH-220',
  }

  return {
    kind,
    value: valueByKind[kind],
    sourceSystem: 'cardio-nexus-simulation',
    linkedAt: new Date(Date.parse(SIMULATION_STARTED_AT) + (eventCount + 1) * 10 * 60_000).toISOString(),
  }
}

function syntheticClocksFor(eventType: string, occurredAt: string): Array<{ type: NexusClockType; occurredAt: string }> {
  const time = Date.parse(occurredAt)
  if (eventType === 'referral-received') {
    return [
      { type: 'first-medical-contact', occurredAt: new Date(time - 5 * 60_000).toISOString() },
      { type: 'first-hospital-arrival', occurredAt: new Date(time - 3 * 60_000).toISOString() },
    ]
  }
  if (eventType === 'arrival-recorded') {
    return [{ type: 'receiving-hospital-arrival', occurredAt }]
  }
  if (eventType === 'episode-recorded') {
    return [{ type: 'procedure-milestone', occurredAt: new Date(time + 20 * 60_000).toISOString() }]
  }
  return []
}

function formatKpiDraft(draft: ReturnType<typeof calculateKpiDrafts>[number] | undefined): string {
  if (!draft) return 'No draft available'
  if (draft.status === 'missing-clock') return `Draft waiting for: ${draft.missingClocks.join(', ')}`
  if (draft.status === 'invalid-order') return 'Draft blocked: timestamp order requires human review'
  return `Draft interval: ${draft.elapsedMinutes} min · quality validation required`
}
