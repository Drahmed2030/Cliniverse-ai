'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  NEXUS_CARDIOVASCULAR_STORAGE_KEY,
  NEXUS_REFLECTION_MIN_LENGTH,
  canRevealNexusDebrief,
  createNexusLearningState,
  isNexusLearningState,
  type NexusModuleId,
} from '../../lib/nexus'

interface NexusStoreSnapshot {
  state: ReturnType<typeof createNexusLearningState>
  saveStatus: string
}

const NEXUS_STORAGE_EVENT = 'cliniverse:nexus-learning-storage'
const serverSnapshot: NexusStoreSnapshot = {
  state: createNexusLearningState(),
  saveStatus: 'Preparing local fictional exercise…',
}

let cachedRaw: string | null | undefined
let cachedSnapshot = serverSnapshot

function setCachedSnapshot(state: NexusStoreSnapshot['state'], saveStatus: string) {
  if (cachedSnapshot.state === state && cachedSnapshot.saveStatus === saveStatus) return cachedSnapshot
  cachedSnapshot = { state, saveStatus }
  return cachedSnapshot
}

function readNexusSnapshot(): NexusStoreSnapshot {
  if (typeof window === 'undefined') return serverSnapshot

  try {
    const raw = window.localStorage.getItem(NEXUS_CARDIOVASCULAR_STORAGE_KEY)
    if (raw === cachedRaw) return cachedSnapshot

    cachedRaw = raw
    if (!raw) {
      return setCachedSnapshot(createNexusLearningState(), 'Ready · Fictional learning data only')
    }

    const parsed: unknown = JSON.parse(raw)
    if (isNexusLearningState(parsed)) {
      return setCachedSnapshot(parsed, 'Restored from this device · Fictional learning data only')
    }
    return setCachedSnapshot(createNexusLearningState(), 'Invalid local state was ignored safely')
  } catch {
    return setCachedSnapshot(cachedSnapshot.state, 'Local recovery unavailable · Keep this screen open')
  }
}

function writeNexusState(state: NexusStoreSnapshot['state'], successMessage = 'Saved on this device · Fictional learning data only') {
  let saveStatus = successMessage
  try {
    const raw = JSON.stringify(state)
    window.localStorage.setItem(NEXUS_CARDIOVASCULAR_STORAGE_KEY, raw)
    cachedRaw = raw
  } catch {
    saveStatus = 'Local save unavailable · Keep this screen open'
  }
  setCachedSnapshot(state, saveStatus)
  window.dispatchEvent(new Event(NEXUS_STORAGE_EVENT))
}

function subscribeToNexusStore(onStoreChange: () => void) {
  const handleLocalChange = () => onStoreChange()
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== NEXUS_CARDIOVASCULAR_STORAGE_KEY) return
    cachedRaw = undefined
    onStoreChange()
  }

  window.addEventListener(NEXUS_STORAGE_EVENT, handleLocalChange)
  window.addEventListener('storage', handleStorageChange)
  return () => {
    window.removeEventListener(NEXUS_STORAGE_EVENT, handleLocalChange)
    window.removeEventListener('storage', handleStorageChange)
  }
}

export function useNexusLearning() {
  const { state, saveStatus } = useSyncExternalStore(
    subscribeToNexusStore,
    readNexusSnapshot,
    () => serverSnapshot,
  )

  const setActiveModule = useCallback((activeModule: NexusModuleId) => {
    const current = readNexusSnapshot().state
    writeNexusState({ ...current, activeModule })
  }, [])

  const updateReflection = useCallback((moduleId: NexusModuleId, reflection: string) => {
    const current = readNexusSnapshot().state
    const normalizedReflection = reflection.slice(0, 800)
    const stillComplete = normalizedReflection.trim().length >= NEXUS_REFLECTION_MIN_LENGTH
    const completedModules = stillComplete
      ? current.completedModules
      : current.completedModules.filter(id => id !== moduleId)

    writeNexusState({
      ...current,
      completedModules,
      reflections: { ...current.reflections, [moduleId]: normalizedReflection },
      debriefRevealed: stillComplete ? current.debriefRevealed : false,
    })
  }, [])

  const completeModule = useCallback((moduleId: NexusModuleId) => {
    const current = readNexusSnapshot().state
    if (current.reflections[moduleId].trim().length < NEXUS_REFLECTION_MIN_LENGTH) return
    if (current.completedModules.includes(moduleId)) return
    writeNexusState({ ...current, completedModules: [...current.completedModules, moduleId] })
  }, [])

  const setFictionalBoundaryConfirmed = useCallback((fictionalBoundaryConfirmed: boolean) => {
    const current = readNexusSnapshot().state
    writeNexusState({
      ...current,
      fictionalBoundaryConfirmed,
      debriefRevealed: fictionalBoundaryConfirmed ? current.debriefRevealed : false,
    })
  }, [])

  const revealDebrief = useCallback(() => {
    const current = readNexusSnapshot().state
    if (canRevealNexusDebrief(current)) writeNexusState({ ...current, debriefRevealed: true })
  }, [])

  const resetExercise = useCallback(() => {
    writeNexusState(createNexusLearningState(), 'Fictional exercise reset on this device')
  }, [])

  return {
    state,
    saveStatus,
    setActiveModule,
    updateReflection,
    completeModule,
    setFictionalBoundaryConfirmed,
    revealDebrief,
    resetExercise,
  }
}
