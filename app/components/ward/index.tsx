'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import WardHome from './WardHome'
import PatientJourney from './PatientJourney'
import ErrorBoundary from '../ErrorBoundary'
import { MOCK_PATIENTS } from '../../lib/ward'
import { getOwnEntitlement } from '../../lib/entitlements'

const MedFeed     = dynamic(() => import('../MedFeed'),     { ssr: false })
const ClinicalNet = dynamic(() => import('../ClinicalNet'), { ssr: false })

interface WardIndexProps {
  onXP?: (n: number) => void
}

export default function WardIndex({ onXP = () => {} }: WardIndexProps) {
  const [activeTab, setActiveTab] = useState<'ward'|'feed'|'net'>('ward')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)

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

  useEffect(() => {
    if (activeTab !== 'ward') setSelectedPatient(null)
  }, [activeTab])

  const handleSelectPatient = (id: string) => {
    const found = MOCK_PATIENTS.find(p => p.id === id || p.name === id)
    if (found) setSelectedPatient(found.id)
  }

  const handleBack = () => {
    setSelectedPatient(null)
  }

  if (selectedPatient) {
    const patient = MOCK_PATIENTS.find(p => p.id === selectedPatient)
    if (!patient) return null
    return (
      <ErrorBoundary section="Patient Journey">
        <PatientJourney
          patient={patient}
          onClose={handleBack}
          isPro={isPro}
        />
      </ErrorBoundary>
    )
  }

  return (
    <div style={{ fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ display: 'flex', gap: 6, padding: '12px 16px 0', background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 }}>
        {([['ward','🏥 Ward'],['feed','📡 MedFeed'],['net','🌐 Network']] as const).map(([id,label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s', background: activeTab === id ? 'rgba(13,148,136,0.1)' : 'transparent', color: activeTab === id ? '#0D9488' : '#475569' }}>
            {label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'ward' && (
          <ErrorBoundary section="Ward">
            <WardHome onSelectPatient={handleSelectPatient} isPro={isPro} />
          </ErrorBoundary>
        )}
        {activeTab === 'feed' && (
          <ErrorBoundary section="MedFeed">
            <MedFeed onXP={onXP} />
          </ErrorBoundary>
        )}
        {activeTab === 'net' && (
          <ErrorBoundary section="ClinicalNet">
            <ClinicalNet onXP={onXP} />
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}
