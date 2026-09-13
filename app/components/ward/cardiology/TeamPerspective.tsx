'use client'

import type { NexusCase } from '../../../lib/cardiology/nexusCore'
import { teamPerspective } from '../../../lib/cardiology/teamPerspective'
import { CARDIOLOGY_COLORS as C, compactButtonStyle, panelStyle } from './styles'

export default function TeamPerspective({ current, previous, onRole }: {
  current: NexusCase
  previous: NexusCase | null
  onRole: (role: 'cardiology' | 'coordination') => void
}) {
  const reports = teamPerspective(current)
  const priorReports = previous ? teamPerspective(previous) : null
  return <section aria-labelledby="team-perspective-title" style={{ ...panelStyle, marginBottom: 12 }}>
    <h4 id="team-perspective-title">One case · Two perspectives</h4>
    <p>Practise reviewing and coordinating the same fictional referral. No ECG or Echo examination is attached to this case.</p>
    <p style={{ color: C.sub }}>Handover challenge: the examination has not arrived. Identify the missing information and responsible colleague; do not treat this exercise as examination review.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 12 }}>
      {reports.map((report, index) => <article key={report.role} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
        <h5>{report.title}</h5>
        <p>{report.task}</p>
        <button type="button" onClick={() => onRole(report.role)} style={{ ...compactButtonStyle, minHeight: 44 }}>Practise as {report.title}</button>
        <p>{report.recorded.length} recorded actions in this attempt</p>
        <ul>{report.recorded.map(event => <li key={event.id}>{event.type}</li>)}</ul>
        <p>{report.pending.length ? `Not yet recorded: ${report.pending.join(', ')}` : 'Expected simulation events recorded.'}</p>
        {priorReports && <p>Previous attempt: {priorReports[index].recorded.length} actions; {priorReports[index].pending.length} expected events not recorded.</p>}
      </article>)}
    </div>
    <p style={{ color: C.sub }}>Compare responsibilities and event order, then use Replay a decision to try again. Counts describe the simulation ledger, not clinical quality or a competency score. Session only.</p>
  </section>
}
