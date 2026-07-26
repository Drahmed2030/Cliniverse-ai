'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const CodeBlue = dynamic(() => import('./CodeBlue'), { ssr: false })
const AICaseGenerator = dynamic(() => import('./AICaseGenerator'), { ssr: false })
const ClinicalDuels = dynamic(() => import('./ClinicalDuels'), { ssr: false })
const DiagnosticDetective = dynamic(() => import('./DiagnosticDetective'), { ssr: false })
const ErrorAutopsy = dynamic(() => import('./ErrorAutopsy'), { ssr: false })
const NightShiftSurvival = dynamic(() => import('./NightShiftSurvival'), { ssr: false })
const PharmacyModule = dynamic(() => import('./PharmacyModule'), { ssr: false })
const NursingModule = dynamic(() => import('./NursingModule'), { ssr: false })
const LabModule = dynamic(() => import('./LabModule'), { ssr: false })
const RadiologyModule = dynamic(() => import('./RadiologyModule'), { ssr: false })
const HealthInsights = dynamic(() => import('./HealthInsights'), { ssr: false })
const EcgChallenge = dynamic(() => import('./EcgChallenge'), { ssr: false })
const MedCalculators = dynamic(() => import('./MedCalculators'), { ssr: false })
const CardiacSurgeryAI = dynamic(() => import('./CardiacSurgeryAI'), { ssr: false })
const NeuroSurgeryAI = dynamic(() => import('./NeuroSurgeryAI'), { ssr: false })
const GeneralSurgeryAI = dynamic(() => import('./GeneralSurgeryAI'), { ssr: false })
const ClinicalNexus = dynamic(() => import('./ClinicalNexus'), { ssr: false })
const RapidFire = dynamic(() => import('./RapidFire'), { ssr: false })
const LabsReference = dynamic(() => import('./LabsReference'), { ssr: false })
const Guidelines = dynamic(() => import('./Guidelines'), { ssr: false })
const Medications = dynamic(() => import('./Medications'), { ssr: false })
const BLSACLSModule = dynamic(() => import('./BLSACLSModule'), { ssr: false })
const OnCallSystem = dynamic(() => import('./OnCallSystem'), { ssr: false })
const GrandRoundsAI = dynamic(() => import('./GrandRoundsAI'), { ssr: false })

const T = {
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.18)',
  F: '"Inter", -apple-system, "SF Pro Display", sans-serif',
}

const SECTIONS = [
  {
    id: 'emergency', label: 'Emergency & Critical', icon: '🚨', color: '#f87171',
    desc: 'Code Blue · BLS/ACLS · Rapid Fire',
    tools: [
      { id: 'codeblue', label: 'Code Blue', icon: '🔴', desc: 'Resuscitation protocols', color: '#f87171' },
      { id: 'rapid', label: 'Rapid Fire', icon: '⚡', desc: 'Quick-fire clinical cases', color: '#fbbf24' },
      { id: 'bls', label: 'BLS / ACLS', icon: '💊', desc: 'Life support algorithms', color: '#f87171' },
      { id: 'oncall', label: 'On-Call', icon: '📞', desc: 'Night shift call system', color: '#a78bfa' },
      { id: 'nightshift', label: 'Night Shift', icon: '🌙', desc: 'Survival mode · Triage', color: '#a78bfa' },
    ]
  },
  {
    id: 'cardiac', label: 'Cardiac & Neuro', icon: '🫀', color: '#38bdf8',
    desc: 'ECG · Cardiac Surgery · Neuro AI',
    tools: [
      { id: 'ecg', label: 'ECG Challenge', icon: '📈', desc: 'Interpret real ECGs', color: '#38bdf8' },
      { id: 'cardiac', label: 'Cardiac Surgery AI', icon: '🫀', desc: 'CABG · Valve · LVAD', color: '#f87171' },
      { id: 'neuro', label: 'Neuro Surgery AI', icon: '🧠', desc: 'Craniotomy · Spine', color: '#a78bfa' },
      { id: 'nexus', label: 'Clinical Nexus', icon: '🔗', desc: 'AI clinical reasoning', color: '#38bdf8' },
    ]
  },
  {
    id: 'surgical', label: 'Surgical AI', icon: '🔪', color: '#38bdf8',
    desc: 'General · Cardiac · Neuro Surgery',
    tools: [
      { id: 'general', label: 'General Surgery AI', icon: '🔪', desc: 'Appendix · Cholecyst · Hernia', color: '#38bdf8' },
      { id: 'cardiac', label: 'Cardiac Surgery AI', icon: '🫀', desc: 'CABG · Valve · LVAD', color: '#f87171' },
      { id: 'neuro', label: 'Neuro Surgery AI', icon: '🧠', desc: 'Craniotomy · Spine', color: '#a78bfa' },
    ]
  },
  {
    id: 'specialties', label: 'Specialties', icon: '🎓', color: '#4ade80',
    desc: 'Pharmacy · Nursing · Lab · Radiology',
    tools: [
      { id: 'pharmacy', label: 'Pharmacy', icon: '💊', desc: 'Drug interactions · Dosing', color: '#4ade80' },
      { id: 'nursing', label: 'Nursing', icon: '🩺', desc: 'Vitals · NEWS2 · Skills', color: '#64d2ff' },
      { id: 'lab', label: 'Laboratory', icon: '🔬', desc: '5 panels · Critical values', color: '#a78bfa' },
      { id: 'radiology', label: 'Radiology', icon: '🩻', desc: 'CXR · CT patterns · Echo', color: '#fbbf24' },
    ]
  },
  {
    id: 'reference', label: 'Clinical Reference', icon: '📚', color: '#fbbf24',
    desc: 'Guidelines · Labs · Medications · Calculators',
    tools: [
      { id: 'guidelines', label: 'Guidelines', icon: '📋', desc: 'ESC · NICE · AHA 2024', color: '#fbbf24' },
      { id: 'labs', label: 'Lab Reference', icon: '🔬', desc: 'Normal ranges · Critical', color: '#a78bfa' },
      { id: 'medications', label: 'Medications', icon: '💉', desc: 'Drug database · Doses', color: '#4ade80' },
      { id: 'calc', label: 'Calculators', icon: '🧮', desc: 'GFR · BMI · Scores', color: '#38bdf8' },
    ]
  },
  {
    id: 'gaming', label: 'AI & Gaming', icon: '⚔️', color: '#bf5af2',
    desc: 'Duels · Detective · AI Generator',
    tools: [
      { id: 'aigen', label: 'AI Case Generator', icon: '🤖', desc: 'Unlimited AI cases', color: '#38bdf8' },
      { id: 'duels', label: 'Clinical Duels', icon: '⚔️', desc: 'Compete globally', color: '#f87171' },
      { id: 'detective', label: 'Diagnostic Detective', icon: '🔍', desc: 'Mystery cases', color: '#bf5af2' },
      { id: 'autopsy', label: 'Error Autopsy', icon: '⚠️', desc: 'Learn from errors', color: '#fbbf24' },
      { id: 'insights', label: 'Health Insights', icon: '📊', desc: 'Your stats & progress', color: '#bf5af2' },
    ]
  },
]

function ToolRenderer({ toolId, onXP }: { toolId: string, onXP: (n: number) => void }) {
  const map: Record<string, React.ReactNode> = {
    codeblue: <CodeBlue onXP={onXP} />,
    rapid: <RapidFire onXP={onXP} />,
    bls: <BLSACLSModule onXP={onXP} />,
    oncall: <OnCallSystem />,
    grandrounds: <GrandRoundsAI onXP={onXP} />,
    nightshift: <NightShiftSurvival onXP={onXP} />,
    ecg: <EcgChallenge onXP={onXP} />,
    cardiac: <CardiacSurgeryAI onXP={onXP} />,
    neuro: <NeuroSurgeryAI onXP={onXP} />,
    nexus: <ClinicalNexus onXP={onXP} />,
    general: <GeneralSurgeryAI onXP={onXP} />,
    pharmacy: <PharmacyModule onXP={onXP} />,
    nursing: <NursingModule onXP={onXP} />,
    lab: <LabModule onXP={onXP} />,
    radiology: <RadiologyModule onXP={onXP} />,
    guidelines: <Guidelines />,
    labs: <LabsReference />,
    medications: <Medications />,
    calc: <MedCalculators onXP={onXP} />,
    aigen: <AICaseGenerator onXP={onXP} />,
    duels: <ClinicalDuels onXP={onXP} />,
    detective: <DiagnosticDetective onXP={onXP} />,
    autopsy: <ErrorAutopsy onXP={onXP} />,
    insights: <HealthInsights />,
  }
  return <>{map[toolId] || <div style={{ padding: 40, textAlign: 'center', color: T.sub, fontFamily: T.F }}>Coming soon...</div>}</>
}

interface Props {
  onXP: (n: number) => void
  initialTool?: string
}

export default function ToolsPage({ onXP, initialTool }: Props) {
  const [view, setView] = useState<'home' | 'section' | 'tool'>(initialTool ? 'tool' : 'home')
  const [activeSection, setActiveSection] = useState<typeof SECTIONS[0] | null>(null)
  const [activeTool, setActiveTool] = useState<string>(initialTool || '')
  const [search, setSearch] = useState('')

  React.useEffect(() => {
    if (initialTool) { setActiveTool(initialTool); setView('tool') }
  }, [initialTool])

  const openSection = (s: typeof SECTIONS[0]) => { setActiveSection(s); setView('section') }
  const openTool = (id: string) => { setActiveTool(id); setView('tool') }
  const goBack = () => {
    if (view === 'tool') { setView(activeSection ? 'section' : 'home') }
    else { setView('home') }
  }

  const searchResults = search.length > 1
    ? SECTIONS.flatMap(s => s.tools.map(t => ({ ...t, sectionLabel: s.label }))).filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.desc.toLowerCase().includes(search.toLowerCase())
      )
    : []

  if (view === 'home') return (
    <div style={{ fontFamily: T.F, paddingBottom: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5, marginBottom: 4 }}>
          Clinical <span style={{ color: '#38bdf8' }}>Tools</span>
        </div>
        <div style={{ fontSize: 12, color: T.sub }}>6 categories · 24+ tools</div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: T.card, borderRadius: 16, border: `1px solid ${T.border}`,
        padding: '12px 16px', marginBottom: 20
      }}>
        <span style={{ fontSize: 16 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools..."
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14, fontFamily: T.F }} />
        {search && <span onClick={() => setSearch('')} style={{ color: T.muted, cursor: 'pointer', fontSize: 18 }}>×</span>}
      </div>

      {search.length > 1 ? (
        <div>
          {searchResults.length === 0
            ? <div style={{ textAlign: 'center', color: T.sub, padding: 20, fontSize: 13 }}>No tools found</div>
            : searchResults.map(t => (
              <div key={t.id + t.sectionLabel} onClick={() => openTool(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: T.card, borderRadius: 16, padding: '14px 16px',
                border: `1px solid ${t.color}20`, cursor: 'pointer', marginBottom: 8
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${t.color}18`, border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: T.sub }}>{t.sectionLabel} · {t.desc}</div>
                </div>
                <span style={{ fontSize: 18, color: T.muted }}>›</span>
              </div>
            ))
          }
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SECTIONS.map(s => (
            <div key={s.id} onClick={() => openSection(s)} style={{
              background: T.card, borderRadius: 20, padding: '18px',
              border: `1px solid ${s.color}20`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: `0 2px 20px ${s.color}08`, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${s.color}08`, filter: 'blur(16px)', pointerEvents: 'none' }} />
              <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: `${s.color}15`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: T.sub }}>{s.desc}</div>
                <div style={{ fontSize: 10, color: `${s.color}90`, fontWeight: 700, marginTop: 4 }}>{s.tools.length} tools</div>
              </div>
              <div style={{ fontSize: 22, color: `${s.color}50` }}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (view === 'section' && activeSection) return (
    <div style={{ fontFamily: T.F, paddingBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, borderRadius: 12, padding: '8px 14px', color: T.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.F }}>← Back</button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{activeSection.icon} {activeSection.label}</div>
          <div style={{ fontSize: 11, color: T.sub }}>{activeSection.tools.length} tools</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeSection.tools.map(t => (
          <div key={t.id} onClick={() => openTool(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: T.card, borderRadius: 20, padding: '16px 18px',
            border: `1px solid ${t.color}20`, cursor: 'pointer',
            boxShadow: `0 2px 16px ${t.color}08`
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: `${t.color}15`, border: `1px solid ${t.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{t.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 3 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: T.sub }}>{t.desc}</div>
            </div>
            <div style={{ background: `${t.color}15`, border: `1px solid ${t.color}25`, borderRadius: 10, padding: '6px 12px', fontSize: 12, color: t.color, fontWeight: 700 }}>Open →</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: T.F }}>
      <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, borderRadius: 12, padding: '8px 16px', color: T.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.F, marginBottom: 16 }}>← Back</button>
      <ToolRenderer toolId={activeTool} onXP={onXP} />
    </div>
  )
}
