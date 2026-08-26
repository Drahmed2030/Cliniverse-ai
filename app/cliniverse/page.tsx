'use client'

import { useMemo, useState } from 'react'
import CareOperationsPreview from './components/CareOperationsPreview'

const sections = [
  {
    id: 'home',
    label: 'Home',
    eyebrow: 'Command center',
    title: 'One calm surface for healthcare workflow intelligence.',
    copy: 'A simplified NeuraOps shell for Cliniverse: operational follow-up, prioritization, evidence, human escalation, tools, and simulation — without deleting the deeper capabilities already built.',
  },
  {
    id: 'care',
    label: 'Care Operations',
    eyebrow: 'Operational workflow',
    title: 'Follow-up → Prioritization → Human Escalation',
    copy: 'This becomes the primary operational wedge. Existing patient-journey, ward-state, evidence, and handover capabilities can be routed here after security hardening.',
  },
  {
    id: 'intelligence',
    label: 'Clinical Intelligence',
    eyebrow: 'Evidence + context',
    title: 'Bring evidence into the workflow, not into another chatbot.',
    copy: 'Oracle, evidence retrieval, similar-case matching, and guideline context live here as decision-support capabilities. They are not presented as autonomous clinical authority.',
  },
  {
    id: 'tools',
    label: 'Clinical Tools',
    eyebrow: 'Capability library',
    title: 'Preserve useful tools without cluttering the primary workflow.',
    copy: 'Calculators, medication tools, FHIR utilities, documentation helpers, and specialty modules remain accessible as a curated capability library.',
  },
  {
    id: 'academy',
    label: 'Academy',
    eyebrow: 'Education + simulation',
    title: 'Keep the learning engine as a separate acquisition and retention layer.',
    copy: 'Virtual Ward simulation, cases, MCQs, Code Blue, BLS/ACLS, diagnostic challenges, and teaching modules remain valuable — but they no longer define the core operational product.',
  },
]

const capabilityGroups = [
  {
    title: 'Care Operations',
    accent: 'teal',
    items: ['Patient Journey', 'Virtual Ward state engine', 'Shift Handover', 'Follow-up queue', 'Human escalation'],
  },
  {
    title: 'Clinical Intelligence',
    accent: 'blue',
    items: ['Clinical Oracle', 'PubMed / FDA evidence', 'Clinical Nexus', 'Similar-case matching', 'Related evidence'],
  },
  {
    title: 'Clinical Tools',
    accent: 'violet',
    items: ['FHIR sandbox', 'Drug interaction', 'Risk calculators', 'Renal dosing', 'Documentation helpers'],
  },
  {
    title: 'Academy',
    accent: 'gold',
    items: ['Virtual Ward simulation', 'Code Blue', 'BLS / ACLS', 'Clinical cases', 'MCQ / exam modules'],
  },
]

export default function CliniverseShellPreview() {
  const [active, setActive] = useState('home')
  const current = useMemo(() => sections.find((section) => section.id === active) || sections[0], [active])

  return (
    <main className="cv-shell no-shell">
      <aside className="cv-sidebar" aria-label="Cliniverse primary navigation">
        <div className="cv-brand">
          <div className="cv-mark" aria-hidden="true">N</div>
          <div>
            <div className="cv-company">NeuraOps</div>
            <div className="cv-product">Cliniverse AI</div>
          </div>
        </div>

        <div className="cv-nav-label">Healthcare Intelligence</div>
        <nav className="cv-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`cv-nav-item no-focusable ${active === section.id ? 'is-active' : ''}`}
              onClick={() => setActive(section.id)}
              type="button"
            >
              <span>{section.label}</span>
              <span className="cv-nav-dot" aria-hidden="true" />
            </button>
          ))}
        </nav>

        <div className="cv-sidebar-footer">
          <span className="cv-status-dot" aria-hidden="true" />
          <span>Preview shell · no live patient data</span>
        </div>
      </aside>

      <section className="cv-main">
        <header className="cv-topbar">
          <div>
            <div className="cv-kicker">Cliniverse AI · by NeuraOps</div>
            <div className="cv-page-title">{current.label}</div>
          </div>
          <div className="cv-top-actions">
            <span className="cv-chip">Human-in-the-loop</span>
            <span className="cv-chip cv-chip-accent">Phase 1 preview</span>
          </div>
        </header>

        <div className="cv-content">
          <section className="cv-hero no-card">
            <div className="cv-eyebrow">{current.eyebrow}</div>
            <h1>{current.title}</h1>
            <p>{current.copy}</p>
            <div className="cv-hero-actions">
              <button className="no-primary-action cv-primary" type="button" onClick={() => setActive('care')}>Review care workflow</button>
              <button className="cv-secondary-action no-focusable" type="button" onClick={() => setActive('tools')}>Explore capabilities</button>
            </div>
          </section>

          <section className="cv-operation-grid" aria-label="Primary healthcare workflow">
            <article className="cv-operation-card no-card">
              <span className="cv-step">01</span>
              <div>
                <h2>Follow-up</h2>
                <p>Capture unresolved tasks, longitudinal context, and items that need another touch.</p>
              </div>
              <span className="cv-state">Operational layer</span>
            </article>
            <article className="cv-operation-card no-card">
              <span className="cv-step">02</span>
              <div>
                <h2>Prioritization</h2>
                <p>Surface attention signals and context while keeping clinical judgment with the human team.</p>
              </div>
              <span className="cv-state cv-state-priority">Priority signal</span>
            </article>
            <article className="cv-operation-card no-card">
              <span className="cv-step">03</span>
              <div>
                <h2>Human Escalation</h2>
                <p>Route the right case, reason, evidence, and next-step context to an accountable human.</p>
              </div>
              <span className="cv-state cv-state-human">Human review</span>
            </article>
          </section>

          {active === 'care' ? <CareOperationsPreview /> : null}

          <section className="cv-section-heading">
            <div>
              <div className="cv-eyebrow">Capability extraction</div>
              <h2>Deep platform, simple navigation.</h2>
            </div>
            <p>Existing features are reorganized into clear product domains rather than removed.</p>
          </section>

          <section className="cv-capability-grid">
            {capabilityGroups.map((group) => (
              <article key={group.title} className={`cv-capability-card no-card accent-${group.accent}`}>
                <div className="cv-capability-head">
                  <span className="cv-capability-signal" aria-hidden="true" />
                  <h3>{group.title}</h3>
                </div>
                <ul>
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </section>

          <section className="cv-safety no-card">
            <div>
              <div className="cv-eyebrow">Deployment guardrail</div>
              <h2>Designed for healthcare workflows. Not cleared for real patient data yet.</h2>
            </div>
            <p>Authentication, authorization, data isolation, auditability, secret remediation, and clinical validation remain mandatory gates before any production healthcare deployment.</p>
          </section>
        </div>
      </section>
    </main>
  )
}
