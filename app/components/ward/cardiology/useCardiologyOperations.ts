'use client'

import { useEffect, useState } from 'react'
import {
  CARDIOLOGY_SIMULATION_STORAGE_KEY,
  createCardiologySimulationState,
  isCardiologyOperationsState,
  type CardiologyCaseStatus,
  type HandoverRecord,
  type OperationalTaskStatus,
  type SurgicalChecklistKey,
} from '../../../lib/cardiology'

const CASE_STATUS_ORDER: CardiologyCaseStatus[] = ['new', 'reviewing', 'awaiting-action', 'handover-ready']
const TASK_STATUS_ORDER: OperationalTaskStatus[] = ['pending', 'acknowledged', 'done']

export function useCardiologyOperations() {
  const [state, setState] = useState(createCardiologySimulationState)
  const [hydrated, setHydrated] = useState(false)
  const [saveStatus, setSaveStatus] = useState('Preparing local simulation…')

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(CARDIOLOGY_SIMULATION_STORAGE_KEY)
        if (raw) {
          const parsed: unknown = JSON.parse(raw)
          if (isCardiologyOperationsState(parsed)) setState(parsed)
        }
      } catch {
        setSaveStatus('Local recovery was unavailable; safe demo data was restored.')
      } finally {
        setHydrated(true)
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    const frame = window.requestAnimationFrame(() => {
      try {
        window.localStorage.setItem(CARDIOLOGY_SIMULATION_STORAGE_KEY, JSON.stringify(state))
        setSaveStatus('Saved on this device · Simulation data only')
      } catch {
        setSaveStatus('Local save unavailable · Keep this screen open')
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hydrated, state])

  const cycleCaseStatus = (caseId: string) => {
    setState(current => ({
      ...current,
      cases: current.cases.map(item => {
        if (item.id !== caseId) return item
        const currentIndex = CASE_STATUS_ORDER.indexOf(item.status)
        const status = CASE_STATUS_ORDER[(currentIndex + 1) % CASE_STATUS_ORDER.length]
        return { ...item, status, lastUpdated: 'Updated in this simulation' }
      }),
    }))
  }

  const toggleSurgicalCheck = (itemId: string, key: SurgicalChecklistKey) => {
    setState(current => ({
      ...current,
      surgicalItems: current.surgicalItems.map(item => item.id === itemId
        ? { ...item, checklist: { ...item.checklist, [key]: !item.checklist[key] } }
        : item),
    }))
  }

  const cycleTaskStatus = (taskId: string) => {
    setState(current => ({
      ...current,
      tasks: current.tasks.map(task => {
        if (task.id !== taskId) return task
        const currentIndex = TASK_STATUS_ORDER.indexOf(task.status)
        const status = TASK_STATUS_ORDER[(currentIndex + 1) % TASK_STATUS_ORDER.length]
        return { ...task, status }
      }),
    }))
  }

  const saveHandover = (record: Omit<HandoverRecord, 'updatedAt'>) => {
    setState(current => {
      const nextRecord: HandoverRecord = { ...record, updatedAt: 'Saved locally this session' }
      const existing = current.handovers.some(item => item.caseId === record.caseId)
      return {
        ...current,
        handovers: existing
          ? current.handovers.map(item => item.caseId === record.caseId ? nextRecord : item)
          : [...current.handovers, nextRecord],
        cases: current.cases.map(item => {
          if (item.id !== record.caseId) return item
          if (record.ready) return { ...item, status: 'handover-ready', lastUpdated: 'Handover saved locally' }
          if (item.status === 'handover-ready') return { ...item, status: 'awaiting-action', lastUpdated: 'Handover draft updated locally' }
          return item
        }),
      }
    })
  }

  const resetSimulation = () => {
    setState(createCardiologySimulationState())
    setSaveStatus('Demo data reset on this device')
  }

  return {
    state,
    saveStatus,
    cycleCaseStatus,
    toggleSurgicalCheck,
    cycleTaskStatus,
    saveHandover,
    resetSimulation,
  }
}
