'use client'

import { useState } from 'react'
import type { CardiologyCase, CardiologyPathway } from '../../../lib/cardiology'
import { caseStatusLabels, pathwayLabels, priorityLabels } from './labels'
import { CARDIOLOGY_COLORS as C, compactButtonStyle, fieldStyle, labelStyle, panelStyle } from './styles'

type CensusFilter = 'all' | CardiologyPathway

interface ChestPainCensusProps {
  cases: CardiologyCase[]
  onCycleStatus: (caseId: string) => void
}

export default function ChestPainCensus({ cases, onCycleStatus }: ChestPainCensusProps) {
  const [filter, setFilter] = useState<CensusFilter>('all')
  const visibleCases = filter === 'all' ? cases : cases.filter(item => item.pathway === filter)

  return (
    <section aria-labelledby="census-title">
      <div style={{ ...panelStyle, marginBottom: 12 }}>
        <div style={{ color: C.blue, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>OPERATIONAL CENSUS</div>
        <h3 id="census-title" style={{ margin: '8px 0 6px', fontSize: 20 }}>Chest Pain & STEMI Census</h3>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.6 }}>
        Tracks fictional pathway ownership and workflow state only. It does not diagnose, triage, recommend treatment, or calculate risk.
        </p>
      </div>

      <label htmlFor="census-filter" style={labelStyle}>Filter simulated pathway</label>
      <select id="census-filter" value={filter} onChange={event => setFilter(event.target.value as CensusFilter)} style={{ ...fieldStyle, marginBottom: 12 }}>
        <option value="all">All pathways</option>
        <option value="chest-pain">Chest Pain</option>
        <option value="stemi">STEMI</option>
        <option value="post-procedure">Post-procedure</option>
      </select>

      <div style={{ display: 'grid', gap: 10 }}>
        {visibleCases.map(item => (
          <article key={item.id} style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900 }}>{item.id}</div>
                <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>{item.location} · {item.shiftOwner}</div>
              </div>
              <div style={{ color: item.priority === 'time-sensitive' ? C.gold : C.teal, fontSize: 10, fontWeight: 900 }}>{priorityLabels[item.priority]}</div>
            </div>
            <div style={{ marginTop: 12, color: C.text, fontSize: 13, lineHeight: 1.55 }}>{item.summary}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <div>
                <div style={{ color: C.blue, fontSize: 11, fontWeight: 900 }}>{pathwayLabels[item.pathway]}</div>
                <div style={{ color: C.sub, fontSize: 10, marginTop: 3 }}>{caseStatusLabels[item.status]} · {item.lastUpdated}</div>
              </div>
              <button type="button" onClick={() => onCycleStatus(item.id)} style={{ ...compactButtonStyle, color: C.teal, padding: '9px 10px', fontSize: 11 }}>
                Advance status
              </button>
            </div>
          </article>
        ))}
      </div>
      <div aria-live="polite" style={{ marginTop: 12, color: C.sub, fontSize: 11 }}>{visibleCases.length} fictional case{visibleCases.length === 1 ? '' : 's'} shown.</div>
    </section>
  )
}
