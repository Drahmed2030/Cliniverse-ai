'use client'

import { useState } from 'react'
import { DEPARTMENTS, MOCK_PATIENTS } from '../../lib/ward'

// Ward v2 case list. Styling lives in ward-v2.css (scoped to [data-ward-v2], semantic tokens only; the fallbacks below keep
// the original dark release identity if a token is absent). The list shows every non-discharged simulated case: all seven
// are catalogued visible and ready, and "assigned to me" has no meaning for a learner working through the fictional set.
// Access is unchanged: the first case is free and every other case keeps its PRO requirement.
const DARK_RELEASE_BG = 'var(--cv-bg, #080C16)'

const PRIORITY_LABEL = { critical: 'Critical', urgent: 'Urgent', stable: 'Stable' }

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  awaiting_orders: 'Awaiting orders',
  awaiting_consult: 'Awaiting consult',
  ready_for_discharge: 'Ready for discharge',
  in_treatment: 'In treatment',
  workup_pending: 'Workup pending',
  decision_needed: 'Decision needed',
  discharged: 'Discharged',
}

interface WardHomeProps {
  onSelectPatient?: (id: string) => void
  isPro?: boolean
  onUpgrade?: () => void
}

export default function WardHome({ onSelectPatient, isPro = false, onUpgrade }: WardHomeProps) {
  const [selectedDept, setSelectedDept] = useState<string>('all')

  const visiblePatients = MOCK_PATIENTS.filter(
    patient => selectedDept === 'all' || patient.department === selectedDept,
  )
  const cases = visiblePatients.filter(patient => patient.status !== 'discharged')

  return (
    <div data-commercial-ward-home data-ward-v2 className="ward-home" style={{ background: DARK_RELEASE_BG }}>
      <header>
        <p className="ward-eyebrow">CLINIVERSE AI · APPLY YOUR LEARNING</p>
        <h2 className="ward-title">Ward Simulation</h2>
        <p className="ward-lead">Fictional cases · Guided reasoning · No real patient data</p>
      </header>

      <details className="ward-goal">
        <summary id="ward-learning-goal">Turn a case into a clear handover</summary>
        <ol>
          <li>Review the fictional record and distinguish known facts from missing information.</li>
          <li>Practise a decision, then review the explanation and any unsupported assumptions.</li>
          <li>Prepare the handover and check the save confirmation before leaving.</li>
        </ol>
        <p>Start with the first free case. The other case entries retain their PRO access requirements.</p>
      </details>

      <section aria-labelledby="department-heading">
        <div id="department-heading" className="ward-filter-label">DEPARTMENT</div>
        <div className="ward-filter">
          {[{ id: 'all', label: 'All' }, ...DEPARTMENTS].map(department => (
            <button
              key={department.id}
              type="button"
              className="ward-chip"
              aria-pressed={selectedDept === department.id}
              onClick={() => setSelectedDept(department.id)}
            >
              {department.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="assigned-heading">
        <div id="assigned-heading" className="ward-cases-label">{'SIMULATED CASES (' + cases.length + ')'}</div>
        {cases.length > 0 ? (
          <ul className="ward-cases">
            {cases.map(patient => {
              const caseUnlocked = isPro || patient.id === 'w1'
              return (
                <li key={patient.id}>
                  <button
                    type="button"
                    className="ward-case"
                    data-priority={patient.priority}
                    aria-label={caseUnlocked
                      ? `Open ${patient.name} simulated case`
                      : `Upgrade to Cliniverse PRO to open ${patient.name} simulated case`}
                    onClick={() => {
                      if (caseUnlocked) onSelectPatient?.(patient.id)
                      else onUpgrade?.()
                    }}
                  >
                    <span className="ward-case-name">{patient.name}</span>
                    <span className="ward-case-dx">{patient.diagnosis}</span>
                    <span className="ward-case-meta">{'Bed ' + patient.bed + ' · ' + patient.department.toUpperCase()}</span>
                    <span className="ward-case-flags">
                      <span className="ward-case-priority">{PRIORITY_LABEL[patient.priority]}</span>
                      <span>{STATUS_LABEL[patient.status] || patient.status}</span>
                      {!caseUnlocked ? <span className="ward-case-pro">PRO</span> : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="ward-empty">No simulated cases in this department.</p>
        )}
      </section>
    </div>
  )
}
