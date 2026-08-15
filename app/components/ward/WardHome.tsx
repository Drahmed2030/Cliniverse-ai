'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
const MedFeedScreen = dynamic(() => import('../MedFeed'), { ssr: false })
const CodeLabHub = dynamic(() => import('./CodeLabHub'), { ssr: false })
import {
  DEPARTMENTS, MOCK_PATIENTS, MOCK_LIVE_EVENTS, MOCK_CENSUS
} from '../../lib/ward'

const T = {
  teal:   '#0D9488',
  tealD:  '#0F766E',
  bg:     '#F8FAFC',
  white:  '#FFFFFF',
  text:   '#0F172A',
  sub:    '#475569',
  muted:  '#94A3B8',
  border: '#E2E8F0',
  red:    '#EF4444',
  amber:  '#F59E0B',
  green:  '#10B981',
}

const LIVE_COLOR = {
  admitted:   { bg: 'rgba(16,185,129,0.10)',  color: '#10B981', label: 'ADMITTED'   },
  discharged: { bg: 'rgba(100,116,139,0.10)', color: '#64748B', label: 'DISCHARGED' },
  transfer:   { bg: 'rgba(245,158,11,0.10)',  color: '#F59E0B', label: 'TRANSFER'   },
  critical:   { bg: 'rgba(239,68,68,0.10)',   color: '#EF4444', label: 'CRITICAL'   },
}

const PRIORITY_COLOR = {
  critical: { bg: 'rgba(239,68,68,0.10)',  color: '#EF4444', label: 'CRITICAL' },
  urgent:   { bg: 'rgba(245,158,11,0.10)', color: '#F59E0B', label: 'URGENT'   },
  stable:   { bg: 'rgba(16,185,129,0.10)', color: '#10B981', label: 'STABLE'   },
}

const STATUS_LABEL: Record<string, string> = {
  active:               'Active',
  awaiting_orders:      'Awaiting Orders',
  awaiting_consult:     'Awaiting Consult',
  ready_for_discharge:  'Ready — Discharge',
  in_treatment:         'In Treatment',
  workup_pending:       'Workup Pending',
  decision_needed:      'Decision Needed',
  discharged:           'Discharged',
}

export default function WardHome({ onSelectPatient }: { onSelectPatient?: (id: string) => void }) {
  const [showMedFeed, setShowMedFeed] = React.useState(false);
  const [showCodeLab, setShowCodeLab] = React.useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('all')

  const assigned = MOCK_PATIENTS.filter(p => p.assignedToMe && p.status !== 'discharged')

  if (showMedFeed) return (
    <MedFeedScreen
      isPro={isPro}
      onUpgrade={onUpgrade}
      onBack={() => setShowMedFeed(false)}
    />
  );

  if (showCodeLab) return (
    <CodeLabHub
      isPro={isPro}
      onUpgrade={onUpgrade}
      onBack={() => setShowCodeLab(false)}
    />
  );

  return (
    <div style={{ background: T.bg, minHeight: '100vh', paddingBottom: 100 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0D9488, #0F766E)',
        padding: '48px 20px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 4 }}>
              CLINIVERSE
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              Virtual Hospital
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
              AI-generated · Practice safely · No real data
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 20, padding: '4px 12px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80' }}/>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>LIVE</span>
          </div>
        </div>

        {/* Census strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          gap: 8, marginTop: 20,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 16, padding: '12px 8px',
        }}>
          {[
            { label: 'Seen',       value: MOCK_CENSUS.seen },
            { label: 'Assigned',   value: MOCK_CENSUS.assigned },
            { label: 'Discharged', value: MOCK_CENSUS.discharged },
            { label: 'Consults',   value: MOCK_CENSUS.consultsRequested },
          ].map(c => (
            <div key={c.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{c.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Live Board */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, letterSpacing: 0.5, marginBottom: 10 }}>
            LIVE BOARD
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {MOCK_LIVE_EVENTS.map(ev => {
              const c = LIVE_COLOR[ev.type]
              return (
                <div key={ev.id} style={{
                  background: c.bg,
                  border: '1px solid ' + c.color + '30',
                  borderRadius: 12, padding: '8px 12px',
                  minWidth: 160, flexShrink: 0,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: c.color, letterSpacing: 1, marginBottom: 3 }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.3 }}>
                    {ev.label}
                  </div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{ev.time}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Department Chips */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, letterSpacing: 0.5, marginBottom: 10 }}>
            DEPARTMENTS
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {[{ id: 'all', label: 'All', icon: '🏥' }, ...DEPARTMENTS].map(d => {
              const active = selectedDept === d.id
              return (
                <button key={d.id} onClick={() => setSelectedDept(d.id)} style={{
                  background: active ? T.teal : T.white,
                  border: '1px solid ' + (active ? T.teal : T.border),
                  borderRadius: 20, padding: '7px 14px',
                  fontSize: 12, fontWeight: 700,
                  color: active ? '#fff' : T.sub,
                  cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span>{d.icon}</span> {d.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* My Assigned Cases */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.sub, letterSpacing: 0.5, marginBottom: 10 }}>
            {'MY ASSIGNED CASES (' + assigned.length + ')'}
          </div>
          {assigned.map(p => {
            const pr = PRIORITY_COLOR[p.priority]
            return (
              <div key={p.id} onClick={() => onSelectPatient && onSelectPatient(p.id)} style={{
                background: T.white, borderRadius: 16,
                border: '1px solid ' + T.border,
                borderLeft: '4px solid ' + pr.color,
                padding: '14px 16px', marginBottom: 10,
                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.name}</div>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '3px 8px',
                    borderRadius: 99, background: pr.bg, color: pr.color,
                  }}>{pr.label}</span>
                </div>
                <div style={{ fontSize: 12, color: T.sub, marginBottom: 6 }}>{p.diagnosis}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: T.muted }}>{'Bed ' + p.bed + ' · ' + p.department.toUpperCase()}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px',
                    borderRadius: 99, background: T.bg,
                    border: '1px solid ' + T.border, color: T.sub,
                  }}>{STATUS_LABEL[p.status] || p.status}</span>
                </div>
              </div>
            )
          })}
          {assigned.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: T.muted, fontSize: 13 }}>
              No assigned cases
            </div>
          )}
        </div>

      </div>

        {/* Signal + Code Lab entry */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 20 }}>
          <button
            onClick={() => setShowMedFeed(true)}
            style={{
              flex: 1, background: '#0F172A',
              border: 'none', borderRadius: 14,
              padding: '14px 12px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
            }}
          >
            <span style={{ fontSize: 18 }}>📡</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>Signal</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>Latest evidence</span>
          </button>
          <button
            onClick={() => setShowCodeLab(true)}
            style={{
              flex: 1, background: '#0B1220',
              border: 'none', borderRadius: 14,
              padding: '14px 12px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
            }}
          >
            <span style={{ fontSize: 18 }}>🔴</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>Code Lab</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>BLS · ACLS drills</span>
          </button>
        </div>
      <style>{('@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}')}</style>
    </div>
  )
}
