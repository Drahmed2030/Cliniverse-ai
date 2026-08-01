'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════

export interface Vitals {
  hr: number        // Heart Rate bpm
  bp: string        // e.g. "118/74"
  spo2: number      // %
  temp: number      // °C
  rr: number        // Respiratory Rate
  watchConnected: boolean
  watchHR: number | null
}

export interface Medication {
  id: string
  name: string
  dose: string
  route: string
  frequency: string
  effect: {
    hr?: number       // expected HR change
    bp?: number       // expected BP change mmHg systolic
    potassium?: 'increase' | 'decrease'
    note?: string
  }
}

export interface ChronicCondition {
  id: string
  name: string
  targetHR?: { min: number; max: number }
  targetBP?: { systolic: number; diastolic: number }
  targetSpo2?: number
  protocol?: string  // e.g. 'ACC/AHA HF', 'ESC CKD'
}

export interface NutritionEntry {
  sodium: number    // mg/day
  potassium: number // mg/day
  fluid: number     // ml/day
  calories: number
}

export interface ExerciseData {
  mets: number        // current METs
  targetHRzone: { min: number; max: number }
  weeklyMinutes: number
  contraindicated: boolean
  warning?: string
}

export interface ActiveClinicalCase {
  id: string
  patientName: string
  diagnosis: string
  specialty: string
  severity: 'critical' | 'urgent' | 'stable'
  vitals: Partial<Vitals>
}

export interface ClinicalAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  source: 'vitals' | 'medication' | 'nutrition' | 'exercise'
  timestamp: number
}

export interface ClinicalState {
  // Navigation
  tab: string
  setTab: (t: string) => void
  toolTab: string
  setToolTab: (t: string) => void

  // User
  xp: number
  addXP: (n: number) => void
  streak: number
  casesCompleted: number
  setCasesCompleted: (n: number) => void
  mcqCorrect: number
  setMcqCorrect: (n: number) => void
  isPro: boolean
  setIsPro: (v: boolean) => void
  userName: string
  setUserName: (n: string) => void

  // 5-Pillar Engine
  vitals: Vitals
  setVitals: (v: Partial<Vitals>) => void

  medications: Medication[]
  addMedication: (m: Medication) => void
  removeMedication: (id: string) => void

  conditions: ChronicCondition[]
  addCondition: (c: ChronicCondition) => void
  removeCondition: (id: string) => void

  nutrition: NutritionEntry
  setNutrition: (n: Partial<NutritionEntry>) => void

  exercise: ExerciseData
  setExercise: (e: Partial<ExerciseData>) => void

  // Clinical Stability Score 0-100
  stabilityScore: number

  // Active case (affects DynamicNav pill)
  activeCase: ActiveClinicalCase | null
  setActiveCase: (c: ActiveClinicalCase | null) => void

  // Alerts
  alerts: ClinicalAlert[]
  addAlert: (a: Omit<ClinicalAlert, 'id' | 'timestamp'>) => void
  dismissAlert: (id: string) => void

  // NET → WARD cross-link
  latestResearch: { title: string; specialty: string; relevantCaseId?: string } | null
  setLatestResearch: (r: { title: string; specialty: string; relevantCaseId?: string } | null) => void

  // UI
  showUpgrade: boolean
  setShowUpgrade: (v: boolean) => void
}

// ═══════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════

const ClinicalContext = createContext<ClinicalState | null>(null)

export function useClinical() {
  const ctx = useContext(ClinicalContext)
  if (!ctx) throw new Error('useClinical must be inside ClinicalProvider')
  return ctx
}

// ═══════════════════════════════════════════════════════════
//  STABILITY SCORE ENGINE
// ═══════════════════════════════════════════════════════════

function calcStability(
  vitals: Vitals,
  meds: Medication[],
  conditions: ChronicCondition[],
  nutrition: NutritionEntry,
  exercise: ExerciseData
): number {
  let score = 100

  // Vitals check
  if (vitals.hr < 50 || vitals.hr > 100) score -= 15
  if (vitals.spo2 < 95) score -= 20
  if (vitals.temp > 38.5 || vitals.temp < 36) score -= 10

  // Medication interactions
  const hasLoopDiuretic = meds.some(m => m.name.toLowerCase().includes('furosemide') || m.name.toLowerCase().includes('lasix'))
  const hasBetaBlocker = meds.some(m => m.name.toLowerCase().includes('bisoprolol') || m.name.toLowerCase().includes('metoprolol') || m.name.toLowerCase().includes('carvedilol'))
  const hasACEI = meds.some(m => m.name.toLowerCase().includes('ramipril') || m.name.toLowerCase().includes('lisinopril'))

  if (hasLoopDiuretic && nutrition.potassium < 2000) score -= 10 // Low K risk
  if (hasBetaBlocker && vitals.hr < 55) score -= 15 // Bradycardia risk
  if (hasACEI && nutrition.potassium > 4000) score -= 8 // Hyperkalemia risk

  // Exercise safety
  if (exercise.contraindicated && exercise.mets > 3) score -= 20

  // Nutrition
  const hasHF = conditions.some(c => c.id === 'hf' || c.name.toLowerCase().includes('heart failure'))
  if (hasHF && nutrition.sodium > 2000) score -= 10
  if (hasHF && nutrition.fluid > 1500) score -= 8

  return Math.max(0, Math.min(100, score))
}

// ═══════════════════════════════════════════════════════════
//  DRUG-VITALS INTERACTION ENGINE
// ═══════════════════════════════════════════════════════════

function checkMedAlerts(
  meds: Medication[],
  vitals: Vitals,
  nutrition: NutritionEntry
): Omit<ClinicalAlert, 'id' | 'timestamp'>[] {
  const alerts: Omit<ClinicalAlert, 'id' | 'timestamp'>[] = []

  const hasBetaBlocker = meds.some(m =>
    ['bisoprolol','metoprolol','carvedilol','atenolol'].some(n => m.name.toLowerCase().includes(n))
  )
  const hasLoopDiuretic = meds.some(m =>
    ['furosemide','lasix','bumetanide','torsemide'].some(n => m.name.toLowerCase().includes(n))
  )
  const hasWarfarin = meds.some(m => m.name.toLowerCase().includes('warfarin'))
  const hasACEI = meds.some(m =>
    ['ramipril','lisinopril','enalapril','perindopril'].some(n => m.name.toLowerCase().includes(n))
  )

  if (hasBetaBlocker && vitals.hr < 55)
    alerts.push({ type:'critical', message:`⚠️ Bradycardia risk: HR ${vitals.hr} bpm with beta-blocker`, source:'medication' })

  if (hasLoopDiuretic && nutrition.potassium < 2000)
    alerts.push({ type:'warning', message:`💊 Low potassium intake (${nutrition.potassium}mg) with loop diuretic — arrhythmia risk`, source:'nutrition' })

  if (hasWarfarin && nutrition.potassium > 3500)
    alerts.push({ type:'info', message:`🥬 High Vit K foods may reduce warfarin efficacy`, source:'nutrition' })

  if (hasACEI && nutrition.potassium > 4000)
    alerts.push({ type:'warning', message:`⚠️ Hyperkalemia risk: High K+ intake with ACE inhibitor`, source:'nutrition' })

  return alerts
}

// ═══════════════════════════════════════════════════════════
//  PROVIDER
// ═══════════════════════════════════════════════════════════

export function ClinicalProvider({ children }: { children: ReactNode }) {

  // Navigation
  const [tab, setTab]         = useState('hub')
  const [toolTab, setToolTab] = useState('codeblue')

  // User
  const [xp, setXp]                       = useState(0)
  const [streak]                           = useState(3)
  const [casesCompleted, setCasesCompleted] = useState(0)
  const [mcqCorrect, setMcqCorrect]        = useState(0)
  const [isPro, setIsPro]                  = useState(false)
  const [userName, setUserName]            = useState('')
  const [showUpgrade, setShowUpgrade]      = useState(false)

  // 5-Pillar Engine
  const [vitals, setVitalsState] = useState<Vitals>({
    hr: 72, bp: '120/80', spo2: 98, temp: 36.6, rr: 16,
    watchConnected: false, watchHR: null,
  })

  const [medications, setMedications] = useState<Medication[]>([])
  const [conditions, setConditions]   = useState<ChronicCondition[]>([])
  const [nutrition, setNutritionState] = useState<NutritionEntry>({
    sodium: 2000, potassium: 3000, fluid: 1500, calories: 2000,
  })
  const [exercise, setExerciseState] = useState<ExerciseData>({
    mets: 3, targetHRzone: { min: 95, max: 130 },
    weeklyMinutes: 0, contraindicated: false,
  })

  const [alerts, setAlerts]           = useState<ClinicalAlert[]>([])
  const [activeCase, setActiveCase]   = useState<ActiveClinicalCase | null>(null)
  const [latestResearch, setLatestResearch] = useState<{ title: string; specialty: string; relevantCaseId?: string } | null>(null)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('clinical-state')
    if (saved) {
      try {
        const s = JSON.parse(saved)
        if (s.xp) setXp(s.xp)
        if (s.casesCompleted) setCasesCompleted(s.casesCompleted)
        if (s.mcqCorrect) setMcqCorrect(s.mcqCorrect)
        if (s.isPro) setIsPro(s.isPro)
        if (s.userName) setUserName(s.userName)
        if (s.medications) setMedications(s.medications)
        if (s.conditions) setConditions(s.conditions)
        if (s.nutrition) setNutritionState(s.nutrition)
      } catch {}
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('clinical-state', JSON.stringify({
      xp, casesCompleted, mcqCorrect, isPro, userName, medications, conditions, nutrition
    }))
  }, [xp, casesCompleted, mcqCorrect, isPro, userName, medications, conditions, nutrition])

  // Auto-check med alerts when vitals/meds/nutrition change
  useEffect(() => {
    const newAlerts = checkMedAlerts(medications, vitals, nutrition)
    if (newAlerts.length > 0) {
      newAlerts.forEach(a => {
        setAlerts(prev => {
          if (prev.some(p => p.message === a.message)) return prev
          return [...prev, { ...a, id: Math.random().toString(36).slice(2), timestamp: Date.now() }]
        })
      })
    }
  }, [medications, vitals, nutrition])

  // Exercise HR zone from conditions
  useEffect(() => {
    const age = 35 // default — can be enhanced with profile age
    const hrMax = 220 - age
    const hasCardiac = conditions.some(c => c.name.toLowerCase().includes('heart') || c.name.toLowerCase().includes('cardiac'))
    setExerciseState(prev => ({
      ...prev,
      targetHRzone: {
        min: hasCardiac ? Math.round(hrMax * 0.50) : Math.round(hrMax * 0.60),
        max: hasCardiac ? Math.round(hrMax * 0.65) : Math.round(hrMax * 0.75),
      },
      contraindicated: vitals.hr > 120 || vitals.spo2 < 90,
      warning: vitals.hr > 120 ? 'High resting HR — exercise contraindicated' :
               vitals.spo2 < 90 ? 'Low SpO₂ — exercise contraindicated' : undefined,
    }))
  }, [conditions, vitals.hr, vitals.spo2])

  // Stability score
  const stabilityScore = calcStability(vitals, medications, conditions, nutrition, exercise)

  // Helpers
  const addXP = useCallback((n: number) => setXp(prev => prev + n), [])

  const setVitals = useCallback((v: Partial<Vitals>) =>
    setVitalsState(prev => ({ ...prev, ...v })), [])

  const addMedication = useCallback((m: Medication) =>
    setMedications(prev => [...prev.filter(x => x.id !== m.id), m]), [])

  const removeMedication = useCallback((id: string) =>
    setMedications(prev => prev.filter(m => m.id !== id)), [])

  const addCondition = useCallback((c: ChronicCondition) =>
    setConditions(prev => [...prev.filter(x => x.id !== c.id), c]), [])

  const removeCondition = useCallback((id: string) =>
    setConditions(prev => prev.filter(c => c.id !== id)), [])

  const setNutrition = useCallback((n: Partial<NutritionEntry>) =>
    setNutritionState(prev => ({ ...prev, ...n })), [])

  const setExercise = useCallback((e: Partial<ExerciseData>) =>
    setExerciseState(prev => ({ ...prev, ...e })), [])

  const addAlert = useCallback((a: Omit<ClinicalAlert, 'id' | 'timestamp'>) =>
    setAlerts(prev => [...prev, { ...a, id: Math.random().toString(36).slice(2), timestamp: Date.now() }]), [])

  const dismissAlert = useCallback((id: string) =>
    setAlerts(prev => prev.filter(a => a.id !== id)), [])

  const value: ClinicalState = {
    tab, setTab, toolTab, setToolTab,
    xp, addXP, streak, casesCompleted, setCasesCompleted,
    mcqCorrect, setMcqCorrect, isPro, setIsPro,
    userName, setUserName, showUpgrade, setShowUpgrade,
    vitals, setVitals,
    medications, addMedication, removeMedication,
    conditions, addCondition, removeCondition,
    nutrition, setNutrition,
    exercise, setExercise,
    stabilityScore,
    activeCase, setActiveCase,
    alerts, addAlert, dismissAlert,
    latestResearch, setLatestResearch,
  }

  return (
    <ClinicalContext.Provider value={value}>
      {children}
    </ClinicalContext.Provider>
  )
}

export default ClinicalContext
