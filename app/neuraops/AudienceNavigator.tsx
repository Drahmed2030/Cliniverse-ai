'use client'

import { useState } from 'react'
import { ArrowRight, Building2, Handshake, Stethoscope } from 'lucide-react'
import styles from './neuraops.module.css'

type AudienceId = 'clinician' | 'hospital' | 'partner'

const journeys = {
  clinician: {
    icon: Stethoscope,
    label: 'Clinician',
    title: 'See the pathway, not another dashboard.',
    detail: 'Replay a fictional pathway, understand the operational gap, and move directly into targeted training.',
    outcome: 'Clarity in under three minutes',
  },
  hospital: {
    icon: Building2,
    label: 'Hospital',
    title: 'Turn pathway evidence into a governed improvement loop.',
    detail: 'Inspect event integrity, measure configured KPIs, assign human review, and retain a traceable closure state.',
    outcome: 'A pilot-ready operational conversation',
  },
  partner: {
    icon: Handshake,
    label: 'Strategic partner',
    title: 'Evaluate one bounded product before platform expansion.',
    detail: 'Review the product contract, safety boundaries, evidence registry, and measurable pilot gates without speculative claims.',
    outcome: 'A defensible diligence starting point',
  },
} as const

export default function AudienceNavigator() {
  const [active, setActive] = useState<AudienceId>('hospital')
  const journey = journeys[active]
  const Icon = journey.icon

  return (
    <section className={styles.navigator} aria-labelledby="journey-title">
      <div className={styles.sectionLead}>
        <p className={styles.eyebrow}>PROGRESSIVE ONBOARDING</p>
        <h2 id="journey-title">Enter NeuraOps through the outcome that matters to you.</h2>
        <p>No registration and no patient information. Choose a perspective to reveal only the relevant path.</p>
      </div>

      <div className={styles.audienceTabs} role="group" aria-label="Choose your NeuraOps perspective">
        {(Object.keys(journeys) as AudienceId[]).map(id => {
          const ItemIcon = journeys[id].icon
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active === id}
              className={active === id ? styles.audienceTabActive : styles.audienceTab}
              onClick={() => setActive(id)}
            >
              <ItemIcon aria-hidden="true" size={18} />
              {journeys[id].label}
            </button>
          )
        })}
      </div>

      <div className={styles.audiencePanel} id="audience-panel" aria-live="polite">
        <div className={styles.audienceIcon}><Icon aria-hidden="true" size={28} /></div>
        <div>
          <span>01 · Choose perspective</span>
          <h3>{journey.title}</h3>
          <p>{journey.detail}</p>
        </div>
        <div className={styles.outcome}>
          <span>Expected first value</span>
          <strong>{journey.outcome}</strong>
          <a href="#two-sparks">See the two-product thesis <ArrowRight aria-hidden="true" size={16} /></a>
        </div>
      </div>
    </section>
  )
}
