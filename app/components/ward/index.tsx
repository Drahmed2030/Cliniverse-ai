'use client'

import { useEffect, useState } from 'react'
import WardHome from './WardHome'
import PatientJourney from './PatientJourney'
import CardiologyOperations from './cardiology'
import ErrorBoundary from '../ErrorBoundary'
import { MOCK_PATIENTS } from '../../lib/ward'
import { getOwnEntitlement } from '../../lib/entitlements'

type CareWorkspace = 'cardiology' | 'ward'

const workspaceButtonStyle = {
  flex: '1 1 180px',
  minHeight: 44,
  padding: '10px 14px',
  borderRadius: 14,
  fontSize: 12,
  fontWeight: 800,
  cursor: 'pointer',
} as const

export default function WardIndex() {
  const [workspace, setWorkspace] = useState<CareWorkspace>('cardiology')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [consultedPatientIds, setConsultedPatientIds] = useState<string[]>([])

  const handleRequestConsult = (patientId: string) => {
    setConsultedPatientIds(current => current.includes(patientId) ? current : [...current, patientId])
  }

  useEffect(() => {
    let active = true
    getOwnEntitlement()
      .then(entitlement => {
        if (active) setIsPro(entitlement.isPro && entitlement.status === 'active')
      })
      .catch(() => {
        if (active) setIsPro(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSelectPatient = (id: string) => {
    const found = MOCK_PATIENTS.find(patient => patient.id === id || patient.name === id)
    if (found) setSelectedPatient(found.id)
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
        />
      </ErrorBoundary>
    )
  }

  return (
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', minHeight: 'calc(100dvh - 190px)', background: 'transparent' }}>
      <div aria-label="Care workspace" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 0 12px' }}>
        <button
          type="button"
          aria-pressed={workspace === 'cardiology'}
          onClick={() => setWorkspace('cardiology')}
          style={{
            ...workspaceButtonStyle,
            border: workspace === 'cardiology' ? '1px solid rgba(45,212,191,0.60)' : '1px solid rgba(148,163,184,0.20)',
            background: workspace === 'cardiology' ? 'rgba(13,148,136,0.24)' : '#111827',
            color: workspace === 'cardiology' ? '#5EEAD4' : '#94A3B8',
          }}
        >
          Cardiology Operations
        </button>
        <button
          type="button"
          aria-pressed={workspace === 'ward'}
          onClick={() => setWorkspace('ward')}
          style={{
            ...workspaceButtonStyle,
            border: workspace === 'ward' ? '1px solid rgba(96,165,250,0.60)' : '1px solid rgba(148,163,184,0.20)',
            background: workspace === 'ward' ? 'rgba(37,99,235,0.22)' : '#111827',
            color: workspace === 'ward' ? '#93C5FD' : '#94A3B8',
          }}
        >
          Ward Simulation
        </button>
      </div>

      {workspace === 'cardiology' ? (
        <ErrorBoundary section="Cardiology Operations">
          <CardiologyOperations />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary section="Ward Simulation">
          <WardHome onSelectPatient={handleSelectPatient} />
        </ErrorBoundary>
      )}
    </div>
  )
}
