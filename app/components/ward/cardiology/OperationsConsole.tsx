'use client'

import { useMemo, useRef, useState } from 'react'
import type { NexusCase } from '../../../lib/cardiology/nexusCore'
import type { CardiologyOperationsState } from '../../../lib/cardiology/types'
import {
  CARDIAC_PATHWAY_BEAM_STAGES,
  deriveCareBeam,
  deriveEscalations,
  deriveExceptionLens,
  deriveHandoverReadiness,
  deriveOwnershipSummary,
  derivePulse,
  deriveProcedureReadiness,
  mapLegacyCaseToEncounter,
  mapLegacyHandoverToState,
  mapLegacySurgicalItemToProcedure,
  mapLegacyTaskToWorkItem,
  projectNexusCaseToOperationalEncounter,
  type ClinicalWorkItem,
  type EscalationState,
  type OperationalEncounter,
} from '../../../lib/cardiologyOperations'
import styles from './operations-console.module.css'

const REASON_LABELS: Record<EscalationState['reason'], string> = {
  no_owner: 'No owner assigned',
  overdue_work_item: 'Work item overdue',
  unresolved_result: 'Result not yet reviewed',
  incomplete_handover: 'Handover incomplete',
  incomplete_procedure_prep: 'Procedure prep incomplete',
}

interface OperationsConsoleProps {
  state: CardiologyOperationsState
  nexusCase: NexusCase
}

export default function OperationsConsole({ state, nexusCase }: OperationsConsoleProps) {
  const nexusProjection = useMemo(() => projectNexusCaseToOperationalEncounter(nexusCase), [nexusCase])

  const legacyEncounters = useMemo(() => state.cases.map(mapLegacyCaseToEncounter), [state.cases])
  const legacyWorkItems = useMemo(() => state.tasks.map(mapLegacyTaskToWorkItem), [state.tasks])
  const legacyProcedures = useMemo(() => state.surgicalItems.map(mapLegacySurgicalItemToProcedure), [state.surgicalItems])
  const legacyHandovers = useMemo(() => state.handovers.map(mapLegacyHandoverToState), [state.handovers])

  const encounters: OperationalEncounter[] = useMemo(
    () => [...legacyEncounters, nexusProjection.encounter],
    [legacyEncounters, nexusProjection.encounter],
  )
  const workItems: ClinicalWorkItem[] = useMemo(
    () => [...legacyWorkItems, ...(nexusProjection.pendingWorkItem ? [nexusProjection.pendingWorkItem] : [])],
    [legacyWorkItems, nexusProjection.pendingWorkItem],
  )

  const nowIso = useMemo(() => new Date().toISOString(), [])

  const escalations: EscalationState[] = useMemo(
    () => encounters.flatMap(encounter => deriveEscalations(
      encounter.encounterId,
      workItems,
      legacyProcedures,
      legacyHandovers.find(h => h.encounterId === encounter.encounterId) ?? null,
      nowIso,
    )),
    [encounters, workItems, legacyProcedures, legacyHandovers, nowIso],
  )

  const pulse = useMemo(
    () => derivePulse(encounters, workItems, legacyHandovers, legacyProcedures, escalations),
    [encounters, workItems, legacyHandovers, legacyProcedures, escalations],
  )
  const ownership = useMemo(() => deriveOwnershipSummary(workItems), [workItems])
  const exceptions = useMemo(() => deriveExceptionLens(escalations), [escalations])

  const [activeIndex, setActiveIndex] = useState(0)
  const clampedIndex = Math.min(activeIndex, encounters.length - 1)
  const activeEncounter = encounters[clampedIndex]
  const touchStartX = useRef<number | null>(null)

  const goTo = (index: number) => setActiveIndex(Math.max(0, Math.min(encounters.length - 1, index)))
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(clampedIndex + 1) }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(clampedIndex - 1) }
  }
  const onTouchStart = (event: React.TouchEvent) => { touchStartX.current = event.touches[0]?.clientX ?? null }
  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const deltaX = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
    if (Math.abs(deltaX) > 40) goTo(clampedIndex + (deltaX < 0 ? 1 : -1))
    touchStartX.current = null
  }

  const isNexusEncounter = activeEncounter?.encounterId === nexusProjection.encounter.encounterId
  const beam = isNexusEncounter
    ? deriveCareBeam(CARDIAC_PATHWAY_BEAM_STAGES, nexusProjection.encounter.encounterId, nexusProjection.events, workItems, escalations)
    : null

  const activeHandover = legacyHandovers.find(h => h.encounterId === activeEncounter?.encounterId) ?? null
  const activeHandoverReadiness = activeHandover ? deriveHandoverReadiness(activeHandover, workItems) : null
  const activeWorkItems = workItems.filter(item => item.encounterId === activeEncounter?.encounterId)
  const activeProcedures = legacyProcedures.filter(procedure => procedure.encounterId === activeEncounter?.encounterId)

  return (
    <section aria-labelledby="operations-console-title" className={styles.shell}>
      <h3 id="operations-console-title" style={{ margin: '0 0 4px', fontSize: 20 }}>Operations Console</h3>
      <p className={styles.intro}>
        One shared operational model — every count below is derived live from real events and work items, never a stored duplicate.
      </p>

      <div className={styles.pulseStrip} role="group" aria-label="Operational pulse">
        <PulseTile label="Active encounters" value={pulse.activeEncounters} />
        <PulseTile label="Open work items" value={pulse.openWorkItems} />
        <PulseTile label="Exceptions" value={pulse.blockedOrExceptionItems} accent={pulse.blockedOrExceptionItems > 0} />
        <PulseTile label="Handover ready" value={pulse.handoverReadyEncounters} />
        <PulseTile label="Procedure ready" value={pulse.procedureReadyEncounters} />
      </div>

      <div
        aria-label="Encounters"
        aria-live="polite"
        className={styles.encounterRail}
        onKeyDown={onKeyDown}
        onTouchEnd={onTouchEnd}
        onTouchStart={onTouchStart}
        role="listbox"
        tabIndex={0}
      >
        {encounters.map((encounter, index) => (
          <button
            aria-selected={index === clampedIndex}
            className={`${styles.encounterChip} ${index === clampedIndex ? styles.encounterChipActive : ''}`}
            key={encounter.encounterId}
            onClick={() => goTo(index)}
            role="option"
            type="button"
          >
            {encounter.encounterId}
          </button>
        ))}
      </div>
      <div className={styles.railControls}>
        <button aria-label="Previous encounter" className={styles.railButton} disabled={clampedIndex === 0} onClick={() => goTo(clampedIndex - 1)} type="button">← Previous</button>
        <span className={styles.railPosition}>{clampedIndex + 1} of {encounters.length}</span>
        <button aria-label="Next encounter" className={styles.railButton} disabled={clampedIndex === encounters.length - 1} onClick={() => goTo(clampedIndex + 1)} type="button">Next →</button>
      </div>

      <div className={styles.consoleGrid}>
        <div className={styles.centerColumn}>
          <div className={styles.panel}>
            <div className={styles.panelLabel}>CARE BEAM</div>
            {beam ? (
              <div className={styles.beamRow}>
                {beam.map(node => (
                  <div className={`${styles.beamNode} ${styles[`beamNode_${node.state}`]}`} key={node.stageId}>
                    <div className={styles.beamNodeLabel}>{node.label}</div>
                    <div className={styles.beamNodeState}>{node.state.replace('_', ' ')}</div>
                    {node.owner ? <div className={styles.beamNodeMeta}>{node.owner.replace('_', ' ')}</div> : null}
                    <div className={styles.beamNodeMeta}>{node.openWorkItemCount} open item{node.openWorkItemCount === 1 ? '' : 's'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyNote}>This encounter has no event-sourced ledger yet — Care Beam only renders for the live Cardiac Pathway (QAPAS) encounter in this batch.</p>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelLabel}>PROCEDURE BOARD</div>
            {activeProcedures.length === 0 ? <p className={styles.emptyNote}>No procedure on this encounter.</p> : (
              <ul className={styles.workList}>
                {activeProcedures.map(procedure => {
                  const readiness = deriveProcedureReadiness(procedure, workItems)
                  return (
                    <li className={styles.procedureRow} key={procedure.procedureId}>
                      <div className={styles.workItem}>
                        <span>{procedure.label}</span>
                        <span className={readiness.ready ? styles.readyBadge : styles.notReadyBadge}>{readiness.ready ? 'Ready' : 'Not ready'}</span>
                      </div>
                      <div className={styles.emptyNote}>{procedure.area.replace('_', ' ')} · {procedure.window} · {readiness.completedChecklistItems}/{readiness.totalChecklistItems} checklist items complete</div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelLabel}>WORK ITEMS · {activeEncounter?.encounterId}</div>
            {activeWorkItems.length === 0 ? <p className={styles.emptyNote}>No work items on this encounter.</p> : (
              <ul className={styles.workList}>
                {activeWorkItems.map(item => (
                  <li className={styles.workItem} key={item.workItemId}>
                    <span>{item.kind.replace('_', ' ')}</span>
                    <span className={styles.workItemStatus}>{item.status}</span>
                    <span className={styles.workItemOwner}>{item.owner ? item.owner.role.replace('_', ' ') : 'unowned'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.panel}>
            <div className={styles.panelLabel}>OWNERSHIP</div>
            {ownership.length === 0 ? <p className={styles.emptyNote}>No ownership assignments recorded yet.</p> : (
              <ul className={styles.ownershipList}>
                {ownership.map(row => (
                  <li className={styles.ownershipRow} key={row.role}>
                    <span>{row.role.replace('_', ' ')}</span>
                    <span>{row.openItems} open · {row.acknowledged} ack'd · {row.unresolved} unresolved</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelLabel}>HANDOVER READINESS</div>
            {activeHandoverReadiness ? (
              <>
                <div className={activeHandoverReadiness.ready ? styles.readyBadge : styles.notReadyBadge}>
                  {activeHandoverReadiness.ready ? 'Ready' : 'Not ready'}
                </div>
                {activeHandoverReadiness.blockers.length > 0 && (
                  <ul className={styles.blockerList}>
                    {activeHandoverReadiness.blockers.map(blocker => <li key={blocker}>{blocker.replace(/_/g, ' ')}</li>)}
                  </ul>
                )}
              </>
            ) : <p className={styles.emptyNote}>No handover drafted for this encounter yet.</p>}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelLabel}>EXCEPTION LENS</div>
            {exceptions.length === 0 ? <p className={styles.emptyNote}>No open exceptions.</p> : (
              <ul className={styles.exceptionList}>
                {exceptions.map((entry, index) => (
                  <li className={styles.exceptionRow} key={`${entry.encounterId}-${entry.reason}-${index}`}>
                    <span className={styles.exceptionEncounter}>{entry.encounterId}</span>
                    <span>{REASON_LABELS[entry.reason]}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <p className={styles.disclaimer}>Operational workflow signaling only — this view never infers patient deterioration, diagnostic severity, or treatment urgency. Synthetic simulation data only.</p>
    </section>
  )
}

function PulseTile({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`${styles.pulseTile} ${accent ? styles.pulseTileAccent : ''}`}>
      <div className={styles.pulseValue}>{value}</div>
      <div className={styles.pulseLabel}>{label}</div>
    </div>
  )
}
