'use client'

import { useState } from 'react'
import ErrorBoundary from '../ErrorBoundary'
import NexusCardiovascularSlice from '../nexus/NexusCardiovascularSlice'
import { useCliniverseSubscription } from '../release/SubscriptionPurchaseProvider'
import { MOCK_PATIENTS } from '../../lib/ward'
import CardiologyOperations from './cardiology'
import CodeLabHub from './CodeLabHub'
import PatientJourney from './PatientJourney'
import WardHome from './WardHome'

export type CareWorkspace = 'ward' | 'learning' | 'cardiology' | 'nexus'

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
    id: 'ward',
    label: 'Ward Simulation',
    description: 'Fictional care-flow cases',
    premium: false,
  },
  {
    id: 'learning',
    label: 'Code Lab',
    description: 'Governed BLS and ACLS learning',
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
  panel: '#111827',
  border: 'rgba(148,163,184,0.20)',
  text: '#F8FAFC',
  sub: '#94A3B8',
  teal: '#2DD4BF',
  blue: '#60A5FA',
}

export default function WardIndex({ initialWorkspace = 'ward' }: Props) {
  const [workspace, setWorkspace] = useState<CareWorkspace>(
    initialWorkspace === 'learning' ? 'learning' : 'ward',
  )
  const [pendingWorkspace, setPendingWorkspace] = useState<CareWorkspace | null>(
    initialWorkspace === 'cardiology' || initialWorkspace === 'nexus' ? initialWorkspace : null,
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
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', minHeight: 'calc(100dvh - 190px)', background: 'transparent' }}>
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
                border: `1px solid ${selected ? 'rgba(45,212,191,0.62)' : C.border}`,
                background: selected ? 'rgba(13,148,136,0.20)' : C.panel,
                color: C.text,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12, fontWeight: 800 }}>
                {item.label}
                {item.premium ? <span style={{ color: locked ? C.blue : C.teal, fontSize: 9 }}>PRO</span> : null}
              </span>
              <span style={{ display: 'block', color: C.sub, fontSize: 10, lineHeight: 1.45, marginTop: 5 }}>
                {entitlementLoading && item.premium ? 'Checking plan…' : item.description}
              </span>
            </button>
          )
        })}
      </nav>

      {activeWorkspace === 'ward' ? (
        <ErrorBoundary section="Ward Simulation">
          <WardHome onSelectPatient={handleSelectPatient} isPro={isPro} onUpgrade={openPaywall} />
        </ErrorBoundary>
      ) : null}

      {activeWorkspace === 'learning' ? (
        <ErrorBoundary section="Code Lab">
          <CodeLabHub
            isPro={isPro}
            onBack={() => setWorkspace('ward')}
            onUpgrade={openPaywall}
          />
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
