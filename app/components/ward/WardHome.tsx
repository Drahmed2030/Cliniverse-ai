'use client'

import { useState } from 'react'
import { DEPARTMENTS, MOCK_PATIENTS, MOCK_LIVE_EVENTS, MOCK_CENSUS } from '../../lib/ward'

const T = {
  teal: '#2DD4BF',
  tealD: '#0F766E',
  bg: '#080C16',
  white: '#111827',
  elevated: '#172033',
  text: '#F8FAFC',
  sub: '#CBD5E1',
  muted: '#94A3B8',
  border: 'rgba(148,163,184,0.20)',
  red: '#F87171',
  amber: '#FBBF24',
  green: '#34D399',
}

const EVENT_COLOR = {
  admitted: { bg: 'rgba(16,185,129,0.10)', color: '#10B981', label: 'ADMITTED' },
  discharged: { bg: 'rgba(100,116,139,0.10)', color: '#64748B', label: 'DISCHARGED' },
  transfer: { bg: 'rgba(245,158,11,0.10)', color: '#F59E0B', label: 'TRANSFER' },
  critical: { bg: 'rgba(239,68,68,0.10)', color: '#EF4444', label: 'CRITICAL' },
}

const PRIORITY_COLOR = {
  critical: { bg: 'rgba(239,68,68,0.10)', color: '#EF4444', label: 'CRITICAL' },
  urgent: { bg: 'rgba(245,158,11,0.10)', color: '#F59E0B', label: 'URGENT' },
  stable: { bg: 'rgba(16,185,129,0.10)', color: '#10B981', label: 'STABLE' },
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  awaiting_orders: 'Awaiting Orders',
  awaiting_consult: 'Awaiting Consult',
  ready_for_discharge: 'Ready — Discharge',
  in_treatment: 'In Treatment',
  workup_pending: 'Workup Pending',
  decision_needed: 'Decision Needed',
  discharged: 'Discharged',
}

interface WardHomeProps {
  onSelectPatient?: (id: string) => void
}

export default function WardHome({ onSelectPatient }: WardHomeProps) {
  const [selectedDept, setSelectedDept] = useState<string>('all')

  const visiblePatients = MOCK_PATIENTS.filter(
    patient => selectedDept === 'all' || patient.department === selectedDept,
  )
  const assigned = visiblePatients.filter(patient => patient.assignedToMe && patient.status !== 'discharged')

  return (
    <div style={{ background: T.bg, minHeight: 'calc(100dvh - 190px)', paddingBottom: 88, border: '1px solid ' + T.border, borderRadius: 24, overflow: 'hidden', boxShadow: '0 18px 46px rgba(0,0,0,0.28)' }}>
      <div style={{ background: 'radial-gradient(circle at 85% 15%, rgba(45,212,191,0.20), transparent 38%), linear-gradient(145deg, #0F2B2C 0%, #111827 58%, #172033 100%)', padding: '30px 20px 24px', borderBottom: '1px solid ' + T.border }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.72)', letterSpacing: 1, marginBottom: 4 }}>
              CLINIVERSE AI · CARE
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              Care Workflow Simulation
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 6 }}>
              Simulated cases · Human review · No real patient data
            </div>
          </div>
          <div style={{ background: 'rgba(45,212,191,0.10)', border: '1px solid rgba(45,212,191,0.34)', borderRadius: 20, padding: '5px 10px' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 0.8 }}>SIMULATION</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 20, background: 'rgba(8,12,22,0.46)', border: '1px solid ' + T.border, borderRadius: 16, padding: '12px 8px' }}>
          {[
            { label: 'Seen', value: MOCK_CENSUS.seen },
            { label: 'Assigned', value: MOCK_CENSUS.assigned },
            { label: 'Discharged', value: MOCK_CENSUS.discharged },
            { label: 'Consults', value: MOCK_CENSUS.consultsRequested },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{item.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.68)', fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <section style={{ marginBottom: 20 }} aria-labelledby="simulation-board-heading">
          <div id="simulation-board-heading" style={{ fontSize: 12, fontWeight: 700, color: T.sub, letterSpacing: 0.5, marginBottom: 10 }}>
            SIMULATION BOARD
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {MOCK_LIVE_EVENTS.map(event => {
              const style = EVENT_COLOR[event.type]
              return (
                <div key={event.id} style={{ background: style.bg, border: '1px solid ' + style.color + '30', borderRadius: 12, padding: '8px 12px', minWidth: 160, flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: style.color, letterSpacing: 1, marginBottom: 3 }}>{style.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>{event.label}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{event.time}</div>
                </div>
              )
            })}
          </div>
        </section>

        <section style={{ marginBottom: 20 }} aria-labelledby="department-heading">
          <div id="department-heading" style={{ fontSize: 12, fontWeight: 700, color: T.sub, letterSpacing: 0.5, marginBottom: 10 }}>
            DEPARTMENTS
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {[{ id: 'all', label: 'All', icon: '🏥' }, ...DEPARTMENTS].map(department => {
              const active = selectedDept === department.id
              return (
                <button
                  key={department.id}
                  type="button"
                  onClick={() => setSelectedDept(department.id)}
                  style={{ background: active ? T.tealD : T.elevated, border: '1px solid ' + (active ? T.teal : T.border), borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: active ? '#fff' : T.sub, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <span aria-hidden="true">{department.icon}</span> {department.label}
                </button>
              )
            })}
          </div>
        </section>

        <section style={{ marginBottom: 20 }} aria-labelledby="assigned-heading">
          <div id="assigned-heading" style={{ fontSize: 12, fontWeight: 700, color: T.sub, letterSpacing: 0.5, marginBottom: 10 }}>
            {'MY ASSIGNED SIMULATED CASES (' + assigned.length + ')'}
          </div>
          {assigned.map(patient => {
            const priority = PRIORITY_COLOR[patient.priority]
            return (
              <button
                key={patient.id}
                type="button"
                aria-label={`Open ${patient.name} simulated case`}
                onClick={() => onSelectPatient?.(patient.id)}
                style={{ width: '100%', textAlign: 'left', background: T.white, borderRadius: 16, border: '1px solid ' + T.border, borderLeft: '4px solid ' + priority.color, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', boxShadow: '0 10px 24px rgba(0,0,0,0.18)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{patient.name}</div>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: priority.bg, color: priority.color }}>{priority.label}</span>
                </div>
                <div style={{ fontSize: 12, color: T.sub, marginBottom: 6 }}>{patient.diagnosis}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: T.muted }}>{'Bed ' + patient.bed + ' · ' + patient.department.toUpperCase()}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: T.bg, border: '1px solid ' + T.border, color: T.sub }}>
                    {STATUS_LABEL[patient.status] || patient.status}
                  </span>
                </div>
              </button>
            )
          })}
          {assigned.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: T.muted, fontSize: 13, background: T.white, border: '1px dashed ' + T.border, borderRadius: 14 }}>
              No assigned simulated cases in this department.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
