'use client'

import { useEffect, useState } from 'react'
import WardHome from './WardHome'
import PatientJourney from './PatientJourney'
import ErrorBoundary from '../ErrorBoundary'
import { MOCK_PATIENTS } from '../../lib/ward'
import { getOwnEntitlement } from '../../lib/entitlements'

interface WardIndexProps {
  onXP?: (n: number) => void
}

export default function WardIndex(_: WardIndexProps) {
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
      <ErrorBoundary section="Care">
        <WardHome onSelectPatient={handleSelectPatient} />
      </ErrorBoundary>
    </div>
  )
}
