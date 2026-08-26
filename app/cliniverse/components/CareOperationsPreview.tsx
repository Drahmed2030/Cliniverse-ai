'use client'

const cases = [
  {
    id: 'SYN-1042',
    label: 'Post-discharge follow-up',
    state: 'Follow-up due',
    priority: 'Routine',
    reason: 'Medication reconciliation remains incomplete after discharge.',
    next: 'Confirm medications and symptoms with the care team.',
  },
  {
    id: 'SYN-2087',
    label: 'Cardiology review',
    state: 'Needs prioritization',
    priority: 'High',
    reason: 'New abnormal trend plus unresolved follow-up task.',
    next: 'Route context and related evidence for clinician review.',
  },
  {
    id: 'SYN-3104',
    label: 'Human escalation',
    state: 'Escalated',
    priority: 'Critical review',
    reason: 'Multiple attention signals require accountable human action.',
    next: 'Assign reviewer, preserve context, and track resolution.',
  },
]

export default function CareOperationsPreview() {
  return (
    <section className="cv-care-preview" aria-label="Synthetic care operations preview">
      <div className="cv-care-header">
        <div>
          <div className="cv-eyebrow">Care Operations · synthetic preview</div>
          <h2>From unresolved follow-up to accountable human action.</h2>
        </div>
        <span className="cv-chip cv-chip-accent">No real patient data</span>
      </div>

      <div className="cv-care-grid">
        {cases.map((item, index) => (
          <article key={item.id} className="cv-care-case no-card">
            <div className="cv-care-case-top">
              <span className="cv-step">{String(index + 1).padStart(2, '0')}</span>
              <span className={`cv-state ${item.priority === 'High' ? 'cv-state-priority' : ''} ${item.priority === 'Critical review' ? 'cv-state-human' : ''}`}>
                {item.priority}
              </span>
            </div>
            <div className="cv-care-id">{item.id}</div>
            <h3>{item.label}</h3>
            <div className="cv-care-state">{item.state}</div>
            <p>{item.reason}</p>
            <div className="cv-care-next">
              <span>Next accountable action</span>
              <strong>{item.next}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="cv-care-flow no-card">
        <div>
          <span>1</span>
          <strong>Follow-up</strong>
          <small>Capture unresolved work</small>
        </div>
        <div className="cv-flow-arrow" aria-hidden="true">→</div>
        <div>
          <span>2</span>
          <strong>Prioritize</strong>
          <small>Surface attention signals</small>
        </div>
        <div className="cv-flow-arrow" aria-hidden="true">→</div>
        <div>
          <span>3</span>
          <strong>Escalate</strong>
          <small>Route to a human owner</small>
        </div>
        <div className="cv-flow-arrow" aria-hidden="true">→</div>
        <div>
          <span>4</span>
          <strong>Resolve</strong>
          <small>Close the loop with auditability</small>
        </div>
      </div>
    </section>
  )
}
