'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '../ErrorBoundary'
import NexusCardiovascularSlice from '../nexus/NexusCardiovascularSlice'
import { useCliniverseSubscription } from '../release/SubscriptionPurchaseProvider'
import { MOCK_PATIENTS } from '../../lib/ward'
import CardiologyOperations from './cardiology'
import PatientJourney from './PatientJourney'
import WardHome from './WardHome'

const AccountCodeLab = dynamic(() => import('./AccountCodeLab'), {
  loading: () => <p role="status">Loading Code Lab…</p>,
})

export type CareWorkspace = 'ward' | 'cardiology' | 'nexus' | 'codelab'

interface Props {
  initialWorkspace?: CareWorkspace
}

const workspaces: Array<{
  id: CareWorkspace
  label: string
  description: string
  premium: boolean
}> = [
  {
    id: 'codelab',
    label: 'Code Lab',
    description: 'BLS and ACLS lessons with knowledge checks',
    premium: false,
  },
  {
    id: 'ward',
    label: 'Ward Simulation',
    description: 'Fictional care-flow cases',
    premium: false,
  },
  {
    id: 'cardiology',
    label: 'Cardiology Operations',
    description: 'QAPAS and coordination practice',
    premium: true,
  },
  {
    id: 'nexus',
    label: 'Nexus Learning',
    description: 'Four-role cardiovascular huddle',
    premium: true,
  },
]

const C = {
  panel: 'var(--cv-surface)',
  elevated: 'var(--cv-surface-elevated)',
  border: 'var(--cv-border)',
  text: 'var(--cv-text)',
  sub: 'var(--cv-text-secondary)',
  teal: 'var(--cv-teal)',
  blue: 'var(--cv-blue)',
}

export default function WardIndex({ initialWorkspace = 'ward' }: Props) {
  const [workspace, setWorkspace] = useState<CareWorkspace>(initialWorkspace === 'codelab' ? 'codelab' : 'ward')
  const [pendingWorkspace, setPendingWorkspace] = useState<CareWorkspace | null>(
    initialWorkspace === 'ward' || initialWorkspace === 'codelab' ? null : initialWorkspace,
  )
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [consultedPatientIds, setConsultedPatientIds] = useState<string[]>([])
  const { entitlement, entitlementLoading, openPaywall } = useCliniverseSubscription()
  const isPro = Boolean(entitlement?.isPro)
  const activeWorkspace = isPro && pendingWorkspace ? pendingWorkspace : workspace

  const handleRequestConsult = (patientId: string) => {
    setConsultedPatientIds(current => current.includes(patientId) ? current : [...current, patientId])
  }

  const handleSelectPatient = (id: string) => {
    const found = MOCK_PATIENTS.find(patient => patient.id === id || patient.name === id)
    if (found) setSelectedPatient(found.id)
  }

  const handleWorkspace = (nextWorkspace: CareWorkspace, premium: boolean) => {
    setSelectedPatient(null)
    if (premium && !isPro) {
      setPendingWorkspace(nextWorkspace)
      openPaywall()
      return
    }
    setPendingWorkspace(null)
    setWorkspace(nextWorkspace)
  }

  if (selectedPatient) {
    const patient = MOCK_PATIENTS.find(item => item.id === selectedPatient)
    if (!patient) return null

    return (
      <ErrorBoundary section="Patient Journey">
        <PatientJourney
          patient={patient}
          onClose={() => setSelectedPatient(null)}
          onRequestConsult={handleRequestConsult}
          consultRequested={consultedPatientIds.includes(patient.id)}
          isPro={isPro}
          onUpgrade={openPaywall}
        />
      </ErrorBoundary>
    )
  }

  return (
    <div
      data-commercial-learn-surface
      style={{
        fontFamily: 'var(--cv-font)',
        minHeight: 'calc(100dvh - 190px)',
        background: 'transparent',
        color: C.text,
      }}
    >
      <nav aria-label="Care workspaces" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: 8, marginBottom: 12 }}>
        {workspaces.map(item => {
          const selected = activeWorkspace === item.id
          const locked = item.premium && !isPro
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={activeWorkspace === item.id}
              aria-label={`${item.label}${locked ? ', Cliniverse PRO' : ''}`}
              onClick={() => handleWorkspace(item.id, item.premium)}
              style={{
                minHeight: 74,
                padding: 12,
                borderRadius: 16,
                border: `1px solid ${selected ? C.teal : C.border}`,
                background: selected ? C.elevated : C.panel,
                color: selected ? C.teal : C.text,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: '0.85rem', fontWeight: 800 }}>
                {item.label}
                {item.premium ? <span style={{ color: locked ? C.blue : C.teal, fontSize: '0.72rem' }}>PRO</span> : null}
              </span>
              <span style={{ display: 'block', color: C.sub, fontSize: '0.78rem', lineHeight: 1.45, marginTop: 5 }}>
                {entitlementLoading && item.premium ? 'Checking plan…' : item.description}
              </span>
            </button>
          )
        })}
      </nav>

      {activeWorkspace === 'codelab' ? (
        <ErrorBoundary section="Code Lab">
          <AccountCodeLab isPro={!entitlementLoading && isPro} onUpgrade={openPaywall} onBack={() => setWorkspace('ward')} />
        </ErrorBoundary>
      ) : null}

      {activeWorkspace === 'ward' ? (
        <ErrorBoundary section="Ward Simulation">
          <WardHome onSelectPatient={handleSelectPatient} isPro={isPro} onUpgrade={openPaywall} />
        </ErrorBoundary>
      ) : null}

      {activeWorkspace === 'cardiology' && isPro ? (
        <ErrorBoundary section="Cardiology Operations">
          <CardiologyOperations />
        </ErrorBoundary>
      ) : null}

      {activeWorkspace === 'nexus' && isPro ? (
        <ErrorBoundary section="Nexus Learning">
          <NexusCardiovascularSlice />
        </ErrorBoundary>
      ) : null}
    </div>
  )
}
