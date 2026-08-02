'use client'
import { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.72)',
  muted:  'rgba(238,246,250,0.50)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

const BIO_CSS = `
  @keyframes bioGlow {
    0%,100% { box-shadow:0 0 20px rgba(0,196,180,0.3),0 0 40px rgba(0,196,180,0.15); }
    50%      { box-shadow:0 0 35px rgba(0,196,180,0.5),0 0 70px rgba(0,196,180,0.25); }
  }
  @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`

const SECTORS = [
  {
    id: 'hospital',
    icon: '🏥',
    label: 'Hospitals & Health Systems',
    color: T.red,
    tagline: 'Clinical Training at Scale',
    features: [
      'Departmental MCQ banks by specialty',
      'CPD tracking & revalidation logbook',
      'Ambient AI Scribe for all physicians',
      'Virtual Ward simulation for residents',
      'Progress analytics dashboard',
      'FHIR integration with hospital EHR',
    ],
    pricing: 'From $2,500/year per department',
    clients: '50+ physicians',
  },
  {
    id: 'university',
    icon: '🎓',
    label: 'Medical Universities & Colleges',
    color: T.blue,
    tagline: 'Board Exam Excellence',
    features: [
      'Unlimited case simulations for students',
      'Saudi Board · Arab Board · USMLE · MRCP',
      'AI-generated exam questions per syllabus',
      'PulseAcademy lectures for curriculum',
      'Student performance analytics',
      'Faculty content management portal',
    ],
    pricing: 'From $1,500/year per cohort',
    clients: '200+ students',
  },
  {
    id: 'pharma',
    icon: '💊',
    label: 'Pharmaceutical Companies',
    color: T.green,
    tagline: 'Reach Physicians Directly',
    features: [
      'Sponsored drug information modules',
      'Clinical trial recruitment via ClinicalTrials.gov',
      'Drug interaction checker branding',
      'Guideline update notifications',
      'Physician engagement analytics',
      'Compliant medical education content',
    ],
    pricing: 'Custom partnership pricing',
    clients: 'Global reach',
  },
  {
    id: 'devices',
    icon: '🔬',
    label: 'Medical Device Companies',
    color: T.purple,
    tagline: 'Demonstrate Your Technology',
    features: [
      'ECG AI interpreter co-branding',
      'Non-Invasive Tech module integration',
      'Echo & imaging AI demonstration',
      'Physician training on device usage',
      'Real-world data collection consent',
      'Custom AI interpretation modules',
    ],
    pricing: 'From $5,000/year',
    clients: 'Device showcase',
  },
  {
    id: 'insurance',
    icon: '🛡️',
    label: 'Healthcare Services & Insurance',
    color: T.orange,
    tagline: 'Quality Care Outcomes',
    features: [
      'Teleconsultation platform white-label',
      'Clinical risk calculator integration',
      'Renal dosing alerts for safety',
      'Patient education modules',
      'Physician network directory',
      'Outcome tracking analytics',
    ],
    pricing: 'From $3,000/year',
    clients: 'Enterprise scale',
  },
  {
    id: 'investor',
    icon: '💰',
    label: 'Investors & Venture Capital',
    color: T.gold,
    tagline: 'Join the Medical AI Revolution',
    features: [
      '50,000+ physicians target market MENA',
      'Subscription + B2B revenue model',
      'Defensible AI + clinical data moat',
      'Saudi Vision 2030 aligned',
      'App Store + Web + Enterprise',
      'FHIR-ready for global EHR market',
    ],
    pricing: 'Investor deck available',
    clients: 'Seed → Series A',
  },
]

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$1,500',
    period: '/year',
    color: T.teal,
    desc: 'Perfect for small departments or startups',
    features: [
      'Up to 50 users',
      'Core clinical tools',
      'MCQ bank access',
      'Basic analytics',
      'Email support',
      'Standard branding',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$4,500',
    period: '/year',
    color: T.blue,
    desc: 'For hospitals and universities',
    features: [
      'Up to 500 users',
      'All clinical modules',
      'Ambient AI Scribe',
      'FHIR EHR integration',
      'Advanced analytics',
      'Custom branding',
      'Dedicated support',
      'PulseAcademy access',
    ],
    cta: 'Request Demo',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    color: T.gold,
    desc: 'Unlimited scale with full IP rights',
    features: [
      'Unlimited users',
      'White-label solution',
      'Full API access',
      'Custom AI modules',
      'Revenue share model',
      'Co-development rights',
      'Legal IP framework',
      'Dedicated team',
      'SLA guarantee',
    ],
    cta: 'Contact Us',
    popular: false,
  },
]

const IP_TERMS = [
  {
    icon: '©️',
    title: 'Core IP — Cliniverse AI',
    desc: 'All core technology, AI models, and platform code remain exclusively owned by Cliniverse AI. Partners license the platform, not the IP.',
    color: T.red,
  },
  {
    icon: '🤝',
    title: 'Co-Development Agreement',
    desc: 'Specialists and institutions contributing content or features receive revenue share (up to 30%) on modules they develop, with clear IP assignment.',
    color: T.blue,
  },
  {
    icon: '🏷️',
    title: 'White-Label License',
    desc: 'Enterprise clients may brand the platform as their own for internal use. Cliniverse AI retains all underlying technology rights.',
    color: T.teal,
  },
  {
    icon: '📊',
    title: 'Data Rights',
    desc: 'Anonymized, aggregated clinical education data may be used for AI model improvement. No patient data is stored without explicit consent.',
    color: T.green,
  },
  {
    icon: '📅',
    title: 'Contract Terms',
    desc: 'Annual contracts with auto-renewal option. Open-ended enterprise agreements available with 90-day termination notice.',
    color: T.orange,
  },
  {
    icon: '⚖️',
    title: 'Governing Law',
    desc: 'Contracts governed by Saudi Arabian law (Vision 2030 digital economy framework) with international arbitration option.',
    color: T.purple,
  },
]

function ContactForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ org: '', name: '', email: '', type: 'hospital', message: '', plan: 'professional' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async () => {
    if (!form.org || !form.email) return
    setSending(true)
    // Simulate sending — in production connect to email API
    await new Promise(r => setTimeout(r, 1500))
    setSent(true)
    setSending(false)
  }

  if (sent) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background:'var(--bg-card,rgba(255,255,255,0.06))', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ background:'var(--bg-base,#F7F9FC)', borderRadius: 24, padding: '40px 30px', maxWidth: 340, textAlign: 'center', border: `1px solid ${T.green}30` }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: T.green, marginBottom: 8 }}>Request Sent!</div>
        <div style={{ fontSize: 13, color:'var(--text-secondary,rgba(10,22,40,0.55))', marginBottom: 24, lineHeight: 1.6 }}>Our enterprise team will contact you within 24 hours.</div>
        <button onClick={onClose} style={{ background: `linear-gradient(135deg,${T.teal},${T.blue})`, border: 'none', borderRadius: 14, padding: '12px 24px', color: 'var(--text-primary,#0A1628)', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F }}>Done</button>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background:'var(--bg-card,rgba(255,255,255,0.06))', backdropFilter: 'blur(12px)', overflowY: 'auto', fontFamily: F }}>
      <div style={{ padding: '20px 16px 60px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.border}`, borderRadius: 12, padding: '9px 16px', color:'var(--text-secondary,rgba(10,22,40,0.55))', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Back</button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color:'var(--text-primary,#0A1628)' }}>Enterprise Inquiry</div>
            <div style={{ fontSize: 11, color: T.teal }}>Cliniverse AI Partnership Team</div>
          </div>
        </div>

        {[
          { key: 'org',   label: 'Organization Name *', placeholder: 'e.g. King Faisal Hospital, KSAU-HS' },
          { key: 'name',  label: 'Your Name *',          placeholder: 'Full name' },
          { key: 'email', label: 'Email Address *',      placeholder: 'work@organization.com' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{f.label}</div>
            <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.glass, color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
          </div>
        ))}

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>ORGANIZATION TYPE</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[['hospital','🏥 Hospital'],['university','🎓 University'],['pharma','💊 Pharma'],['devices','🔬 Devices'],['insurance','🛡️ Insurance'],['investor','💰 Investor']].map(([id,label]) => (
              <button key={id} onClick={() => setForm(p => ({ ...p, type: id }))} style={{ background: form.type === id ? T.teal + '18' : T.glass2, border: `1px solid ${form.type === id ? T.teal : T.border}`, borderRadius: 20, padding: '6px 12px', cursor: 'pointer', fontFamily: F, color: form.type === id ? T.teal : T.muted, fontSize: 11, fontWeight: 700 }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>INTERESTED PLAN</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['starter','Starter'],['professional','Professional'],['enterprise','Enterprise']].map(([id,label]) => (
              <button key={id} onClick={() => setForm(p => ({ ...p, plan: id }))} style={{ flex: 1, background: form.plan === id ? T.blue + '18' : T.glass2, border: `1px solid ${form.plan === id ? T.blue : T.border}`, borderRadius: 12, padding: '8px', cursor: 'pointer', fontFamily: F, color: form.plan === id ? T.blue : T.muted, fontSize: 11, fontWeight: 700 }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>MESSAGE (optional)</div>
          <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us about your needs, number of users, specific requirements..." rows={4} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.glass, color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: F, lineHeight: 1.6, boxSizing: 'border-box' }} />
        </div>

        <button onClick={submit} disabled={sending || !form.org || !form.email} style={{ width: '100%', padding: '15px', borderRadius: 18, border: 'none', background: !form.org || !form.email ? 'rgba(0,196,180,0.15)' : `linear-gradient(135deg,${T.teal},${T.blue})`, color: 'var(--text-primary,#0A1628)', fontSize: 15, fontWeight: 800, cursor: !form.org || !form.email ? 'not-allowed' : 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {sending ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />Sending...</> : '🤝 Send Enterprise Inquiry'}
        </button>

        <div style={{ marginTop: 14, fontSize: 10, color: T.muted, textAlign: 'center', lineHeight: 1.6 }}>
          By submitting, you agree to our Privacy Policy. We respond within 24 hours.
        </div>
      </div>
      <style>{'input::placeholder,textarea::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}

export default function EnterprisePage({ onXP }: { onXP?: (n: number) => void }) {
  const [activeTab, setActiveTab]     = useState<'sectors'|'plans'|'ip'|'contact'>('sectors')
  const [activeSector, setActiveSector] = useState<string|null>(null)
  const [showContact, setShowContact] = useState(false)

  if (showContact) return <ContactForm onClose={() => setShowContact(false)} />

  const sector = SECTORS.find(s => s.id === activeSector)

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: T.gold + 'CC', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>CLINIVERSE AI · ENTERPRISE</div>
        <div style={{ fontSize: 22, fontWeight: 900, color:'var(--text-primary,#0A1628)', letterSpacing: -0.5, lineHeight: 1.1 }}>
          Partner with <span style={{ color: T.gold }}>Cliniverse</span>
        </div>
        <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', marginTop: 4 }}>
          Hospitals · Universities · Pharma · Devices · Investors
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'Target MDs',  v: '50K+',  c: T.teal   },
          { l: 'Countries',   v: '28+',   c: T.blue   },
          { l: 'Modules',     v: '40+',   c: T.purple },
          { l: 'Languages',   v: 'EN·AR', c: T.gold   },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.glass, backdropFilter: 'blur(16px)', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: `1px solid ${s.c}18` }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button onClick={() => setShowContact(true)} style={{
        width: '100%', padding: '16px', borderRadius: 20, border: 'none', marginBottom: 20,
        background: `linear-gradient(135deg,${T.gold},#B8860B)`,
        color: 'var(--text-primary,#0A1628)', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: F,
        boxShadow: `0 8px 28px rgba(212,168,71,0.40)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        animation: 'bioGlow 3s ease-in-out infinite',
      }}>
        🤝 Request Enterprise Demo
      </button>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 4, marginBottom: 16, border: '1px solid rgba(255,255,255,0.10)' }}>
        {([
          ['sectors', '🏢 Sectors'],
          ['plans',   '💳 Plans'],
          ['ip',      '©️ Legal'],
          ['contact', '📩 Contact'],
        ] as [string,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id as any)} style={{ flex: 1, padding: '9px 4px', cursor: 'pointer', borderRadius: 12, fontFamily: F, fontWeight: 700, fontSize: 10, border: activeTab === id ? `1px solid ${T.gold}25` : '1px solid transparent', background: activeTab === id ? 'rgba(255,255,255,0.10)' : 'transparent', color: activeTab === id ? T.gold : T.muted, transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* ── SECTORS TAB ── */}
      {activeTab === 'sectors' && (
        <div>
          {activeSector && sector ? (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <button onClick={() => setActiveSector(null)} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.border}`, borderRadius: 12, padding: '9px 16px', color:'var(--text-secondary,rgba(10,22,40,0.55))', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, marginBottom: 16 }}>← All Sectors</button>

              <div style={{ background: `${sector.color}10`, border: `1.5px solid ${sector.color}30`, borderRadius: 22, padding: '20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle,${sector.color}15,transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ fontSize: 36, marginBottom: 10 }}>{sector.icon}</div>
                <div style={{ fontSize: 10, color: sector.color, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>{sector.tagline.toUpperCase()}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color:'var(--text-primary,#0A1628)', marginBottom: 4 }}>{sector.label}</div>
                <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>{sector.pricing}</div>
              </div>

              <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>WHAT YOU GET</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {sector.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${sector.color}15`, borderRadius: 14, padding: '12px 14px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: sector.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color:'var(--text-primary,#0A1628)', fontWeight: 600 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowContact(true)} style={{ width: '100%', padding: '15px', borderRadius: 18, border: 'none', background: `linear-gradient(135deg,${sector.color},${sector.color}CC)`, color: 'var(--text-primary,#0A1628)', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: `0 6px 24px ${sector.color}35` }}>
                🤝 Request {sector.label} Partnership
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SECTORS.map(s => (
                <div key={s.id} onClick={() => { setActiveSector(s.id); onXP?.(2) }} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${s.color}20`, borderRadius: 18, padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, borderRadius: '50%', background: `radial-gradient(circle,${s.color}08,transparent 70%)`, pointerEvents: 'none' }} />
                  <div style={{ width: 50, height: 50, borderRadius: 15, background: `${s.color}15`, border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color:'var(--text-primary,#0A1628)', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 2 }}>{s.tagline}</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{s.pricing}</div>
                  </div>
                  <span style={{ fontSize: 18, color: T.muted }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PLANS TAB ── */}
      {activeTab === 'plans' && (
        <div>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.popular ? `${plan.color}10` : T.glass,
              backdropFilter: 'blur(16px)',
              border: `${plan.popular ? '2' : '1'}px solid ${plan.color}${plan.popular ? '40' : '22'}`,
              borderRadius: 22, padding: '20px', marginBottom: 12,
              position: 'relative', overflow: 'hidden',
              animation: plan.popular ? 'bioGlow 3s ease-in-out infinite' : 'none',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: 14, right: 14, background: plan.color, borderRadius: 20, padding: '4px 12px', fontSize: 9, color: 'var(--text-primary,#0A1628)', fontWeight: 800 }}>MOST POPULAR</div>
              )}
              <div style={{ position: 'absolute', top: -25, right: -25, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle,${plan.color}12,transparent 70%)`, pointerEvents: 'none' }} />

              <div style={{ fontSize: 10, color: plan.color, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>{plan.name.toUpperCase()}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color:'var(--text-primary,#0A1628)' }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: T.muted }}>{plan.period}</span>
              </div>
              <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', marginBottom: 14 }}>{plan.desc}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: plan.color, fontSize: 12, fontWeight: 800 }}>✓</span>
                    <span style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setShowContact(true)} style={{ width: '100%', padding: '13px', borderRadius: 16, border: plan.popular ? 'none' : `1px solid ${plan.color}35`, background: plan.popular ? `linear-gradient(135deg,${plan.color},${plan.color}CC)` : `${plan.color}12`, color: plan.popular ? '#fff' : plan.color, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: F }}>
                {plan.cta}
              </button>
            </div>
          ))}

          <div style={{ background: T.glass2, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.6 }}>
              All plans include 30-day free trial · No credit card required
            </div>
          </div>
        </div>
      )}

      {/* ── IP / LEGAL TAB ── */}
      {activeTab === 'ip' && (
        <div>
          <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.gold}25`, borderRadius: 18, padding: '16px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>⚖️ INTELLECTUAL PROPERTY FRAMEWORK</div>
            <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.7 }}>
              Cliniverse AI maintains strict IP protection while enabling meaningful partnerships. Our framework is designed for the Saudi Vision 2030 digital health ecosystem.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {IP_TERMS.map((term, i) => (
              <div key={i} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${term.color}18`, borderRadius: 16, padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{term.icon}</span>
                  <div style={{ fontSize: 13, fontWeight: 800, color: term.color }}>{term.title}</div>
                </div>
                <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.65 }}>{term.desc}</div>
              </div>
            ))}
          </div>

          {/* Revenue share model */}
          <div style={{ background: `${T.blue}08`, border: `1px solid ${T.blue}22`, borderRadius: 18, padding: '16px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: T.blue, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>💰 REVENUE SHARE MODEL</div>
            {[
              { role: 'Core Platform', share: '70%', color: T.blue },
              { role: 'Content Partners', share: '20%', color: T.teal },
              { role: 'Co-developers', share: '10%', color: T.green },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color:'var(--text-primary,#0A1628)', fontWeight: 600 }}>{r.role}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: parseInt(r.share) * 1.5, height: 8, borderRadius: 4, background: r.color + '80' }} />
                  <span style={{ fontSize: 13, fontWeight: 900, color: r.color }}>{r.share}</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setShowContact(true)} style={{ width: '100%', padding: '14px', borderRadius: 18, border: 'none', background: `linear-gradient(135deg,${T.gold},#B8860B)`, color: 'var(--text-primary,#0A1628)', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F }}>
            📋 Request Full Legal Framework
          </button>
        </div>
      )}

      {/* ── CONTACT TAB ── */}
      {activeTab === 'contact' && (
        <div>
          <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.teal}25`, borderRadius: 18, padding: '20px', marginBottom: 16, textAlign: 'center', animation: 'bioGlow 3s ease-in-out infinite' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
            <div style={{ fontSize: 18, fontWeight: 900, color:'var(--text-primary,#0A1628)', marginBottom: 8 }}>Let's Build Together</div>
            <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.7, marginBottom: 20 }}>
              Whether you're a hospital, university, pharma company, or investor — we have a partnership model designed for you.
            </div>
            <button onClick={() => setShowContact(true)} style={{ width: '100%', padding: '15px', borderRadius: 18, border: 'none', background: `linear-gradient(135deg,${T.teal},${T.blue})`, color: 'var(--text-primary,#0A1628)', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: `0 6px 24px ${T.teal}35` }}>
              📩 Start Enterprise Inquiry
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📧', label: 'Email', value: 'enterprise@cliniverseai.com', color: T.blue },
              { icon: '🌐', label: 'Website', value: 'cliniverseai.com/enterprise', color: T.teal },
              { icon: '🇸🇦', label: 'HQ', value: 'Buraydah, Saudi Arabia', color: T.green },
              { icon: '⏱️', label: 'Response time', value: 'Within 24 hours', color: T.gold },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${item.color}15`, borderRadius: 14, padding: '12px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: `${item.color}15`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color:'var(--text-primary,#0A1628)', fontWeight: 700 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, background: `${T.gold}08`, border: `1px solid ${T.gold}18`, borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.6 }}>
              🇸🇦 Proudly built in Saudi Arabia · Vision 2030 aligned · ZATCA registered
            </div>
          </div>
        </div>
      )}

      <style>{BIO_CSS}</style>
    </div>
  )
}
