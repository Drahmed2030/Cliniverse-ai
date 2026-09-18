'use client'

import { useState, useEffect, useCallback, type KeyboardEvent } from 'react'
import { motion, useReducedMotion, type PanInfo } from 'framer-motion'
import {
  getOrbitCenter,
  getOrbitNeighbors,
  getOrbitBreadcrumbs,
  resolveOrbitContentRoute,
  type ClinicalOrbitNode,
  type OrbitNeighbor,
} from '../../lib/clinicalOrbit'

// Clinical Orbit v1 — entity-centered exploration prototype. Tap a
// neighbor to focus it; swipe or arrow keys cycle the highlighted
// neighbor; a compact breadcrumb (not a stack of Back buttons) returns to
// any earlier focus. See docs/CLINICAL_ORBIT_V1.md (Sections 8-9) for the
// product model and why this is plain React + framer-motion (already a
// dependency) rather than a graph library.

const ANCHOR_NODE_KEYS = [
  'condition:anterior_stemi_acs',
  'condition:atrial_fibrillation',
  'condition:heart_failure',
  'condition:severe_hyperkalemia',
  'condition:cardiac_arrest_acls',
]

const RELATION_LABELS: Record<string, string> = {
  related_to: 'related to',
  demonstrates: 'demonstrated by',
  diagnosed_by: 'diagnosed by',
  treated_by: 'treated by',
  measured_by: 'measured by',
  supported_by: 'supported by',
  prerequisite_for: 'prerequisite for',
  next_learning_step: 'next learning step',
  compares_with: 'compares with',
}

const RADIUS = 118

function neighborPosition(index: number, total: number) {
  const angle = (2 * Math.PI * index) / Math.max(total, 1) - Math.PI / 2
  return { x: Math.round(RADIUS * Math.cos(angle)), y: Math.round(RADIUS * Math.sin(angle)) }
}

const nodeButtonStyle = (active: boolean): React.CSSProperties => ({
  position: 'absolute',
  minWidth: 44,
  minHeight: 44,
  maxWidth: 108,
  padding: '8px 10px',
  borderRadius: 14,
  border: `1px solid ${active ? 'var(--cv-blue)' : 'var(--cv-border)'}`,
  background: active ? 'var(--cv-nav-selected)' : 'var(--cv-surface-elevated)',
  color: 'var(--cv-text)',
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1.25,
  cursor: 'pointer',
  boxShadow: 'var(--cv-shadow)',
  textAlign: 'center',
})

export default function ClinicalOrbit() {
  const prefersReducedMotion = useReducedMotion()
  const [focusStack, setFocusStack] = useState<string[]>([])
  const [center, setCenter] = useState<ClinicalOrbitNode | null>(null)
  const [neighbors, setNeighbors] = useState<OrbitNeighbor[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<ClinicalOrbitNode[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showEvidence, setShowEvidence] = useState(false)
  const [routeFor, setRouteFor] = useState<Record<string, string | null>>({})

  const focusKey = focusStack[focusStack.length - 1] ?? null

  useEffect(() => {
    if (!focusKey) { setCenter(null); setNeighbors([]); setBreadcrumbs([]); return }
    let active = true
    setLoading(true)
    Promise.all([getOrbitCenter(focusKey), getOrbitNeighbors(focusKey), getOrbitBreadcrumbs(focusStack)]).then(
      ([centerNode, nbrs, crumbs]) => {
        if (!active) return
        setCenter(centerNode)
        setNeighbors(nbrs)
        setBreadcrumbs(crumbs)
        setSelectedIndex(0)
        setShowEvidence(false)
        setLoading(false)
      },
    )
    return () => { active = false }
    // focusStack is read for breadcrumbs only; focusKey alone determines center/neighbors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])

  useEffect(() => {
    let active = true
    Promise.all(neighbors.map(async n => [n.node.nodeKey, await resolveOrbitContentRoute(n.node)] as const)).then(entries => {
      if (!active) return
      setRouteFor(Object.fromEntries(entries))
    })
    return () => { active = false }
  }, [neighbors])

  const focus = useCallback((nodeKey: string) => setFocusStack(prev => [...prev, nodeKey]), [])
  const jumpTo = useCallback((index: number) => setFocusStack(prev => prev.slice(0, index + 1)), [])
  const selectAnchor = useCallback((nodeKey: string) => setFocusStack([nodeKey]), [])

  const cycle = useCallback((direction: 1 | -1) => {
    setNeighbors(current => {
      if (current.length === 0) return current
      setSelectedIndex(i => (i + direction + current.length) % current.length)
      return current
    })
  }, [])

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x < -40) cycle(1)
    else if (info.offset.x > 40) cycle(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') { cycle(1); event.preventDefault() }
    else if (event.key === 'ArrowLeft') { cycle(-1); event.preventDefault() }
    else if (event.key === 'Enter' || event.key === ' ') {
      const selected = neighbors[selectedIndex]
      if (selected) { focus(selected.node.nodeKey); event.preventDefault() }
    } else if (event.key === 'Backspace' || event.key === 'Escape') {
      if (focusStack.length > 1) { jumpTo(focusStack.length - 2); event.preventDefault() }
    }
  }

  const selected = neighbors[selectedIndex] ?? null
  const selectedRoute = selected ? routeFor[selected.node.nodeKey] : null

  return (
    <section aria-labelledby="clinical-orbit-title" style={{ padding: 16, borderRadius: 20, border: '1px solid var(--cv-border)', background: 'var(--cv-surface)' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: 'var(--cv-violet)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>CLINICAL ORBIT</div>
        <h2 id="clinical-orbit-title" style={{ margin: '4px 0 4px', fontSize: '1.15rem' }}>Explore a concept</h2>
        <p style={{ margin: 0, color: 'var(--cv-text-secondary)', fontSize: '0.85rem' }}>Tap a related concept to focus it. Swipe or use arrow keys to look through what's connected.</p>
      </div>

      {focusStack.length > 0 && (
        <nav aria-label="Clinical Orbit path" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          <button type="button" onClick={() => setFocusStack([])} style={breadcrumbStyle(false)}>Anchors</button>
          {breadcrumbs.map((node, i) => (
            <span key={node.nodeKey} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span aria-hidden="true" style={{ color: 'var(--cv-text-secondary)' }}>›</span>
              <button type="button" onClick={() => jumpTo(i)} aria-current={i === breadcrumbs.length - 1 ? 'true' : undefined} style={breadcrumbStyle(i === breadcrumbs.length - 1)}>
                {node.label}
              </button>
            </span>
          ))}
        </nav>
      )}

      {focusStack.length === 0 && (
        <div role="group" aria-label="Choose a starting concept" style={{ display: 'grid', gap: 8 }}>
          {ANCHOR_NODE_KEYS.map(key => (
            <AnchorButton key={key} nodeKey={key} onSelect={selectAnchor} />
          ))}
        </div>
      )}

      {focusStack.length > 0 && (
        <div onKeyDown={handleKeyDown} tabIndex={0} role="application" aria-roledescription="Clinical Orbit graph" aria-label={center ? `Focused on ${center.label}` : 'Loading'}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 380, height: 300, margin: '0 auto 16px' }}>
            <svg width="100%" height="100%" viewBox="-160 -150 320 300" aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              {neighbors.map((n, i) => {
                const { x, y } = neighborPosition(i, neighbors.length)
                return <line key={n.node.nodeKey} x1={0} y1={0} x2={x} y2={y} stroke="var(--cv-border)" strokeWidth={1.5} />
              })}
            </svg>

            {center && (
              <div
                aria-current="true"
                style={{
                  position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                  minWidth: 96, maxWidth: 140, padding: '12px 14px', borderRadius: 18,
                  background: 'linear-gradient(135deg, var(--cv-blue), var(--cv-violet))',
                  color: '#fff', fontWeight: 800, fontSize: 13, textAlign: 'center', boxShadow: 'var(--cv-shadow)',
                }}
              >
                {center.label}
              </div>
            )}

            {neighbors.map((n, i) => {
              const { x, y } = neighborPosition(i, neighbors.length)
              return (
                <button
                  key={n.node.nodeKey}
                  type="button"
                  onClick={() => { setSelectedIndex(i); focus(n.node.nodeKey) }}
                  onFocus={() => setSelectedIndex(i)}
                  aria-label={`${n.node.label}, ${RELATION_LABELS[n.edge.relation] ?? n.edge.relation} ${center?.label ?? ''}`}
                  style={{ ...nodeButtonStyle(i === selectedIndex), left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%,-50%)' }}
                >
                  {n.node.label}
                </button>
              )
            })}

            {!loading && neighbors.length === 0 && (
              <p style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', color: 'var(--cv-text-secondary)', fontSize: 12, textAlign: 'center', maxWidth: 260 }}>
                No connected content is available to show here yet.
              </p>
            )}
          </div>

          {selected && (
            <motion.div
              key={selected.node.nodeKey}
              drag={prefersReducedMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              style={{ padding: 16, borderRadius: 16, border: '1px solid var(--cv-border)', background: 'var(--cv-surface-elevated)' }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--cv-text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                {RELATION_LABELS[selected.edge.relation] ?? selected.edge.relation}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>{selected.node.label}</div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {neighbors.length > 1 && (
                  <>
                    <button type="button" onClick={() => cycle(-1)} style={smallButtonStyle} aria-label="Previous related concept">← Previous</button>
                    <button type="button" onClick={() => cycle(1)} style={smallButtonStyle} aria-label="Next related concept">Next →</button>
                  </>
                )}
                {selectedRoute && (
                  <a href={selectedRoute} style={{ ...smallButtonStyle, textDecoration: 'none', background: 'var(--cv-blue)', color: '#fff', borderColor: 'var(--cv-blue)' }}>
                    Open →
                  </a>
                )}
                <button type="button" onClick={() => setShowEvidence(v => !v)} style={smallButtonStyle} aria-expanded={showEvidence}>
                  {showEvidence ? 'Hide evidence' : 'Why connected?'}
                </button>
              </div>

              {showEvidence && (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: 'var(--cv-surface-subtle)', fontSize: 12, color: 'var(--cv-text-secondary)', lineHeight: 1.6 }}>
                  <div><strong>Source:</strong> {selected.edge.provenanceRef}</div>
                  <div><strong>Review status:</strong> {selected.edge.evidenceStatus.replace(/_/g, ' ')}</div>
                </div>
              )}

              <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: 'var(--cv-text-secondary)' }}>
                Swipe, use ← →, or the buttons above to look through what's connected. Educational relationships only — not clinical authority.
              </p>
            </motion.div>
          )}
        </div>
      )}
    </section>
  )
}

function AnchorButton({ nodeKey, onSelect }: { nodeKey: string; onSelect: (key: string) => void }) {
  const [label, setLabel] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    getOrbitCenter(nodeKey).then(node => { if (active) setLabel(node?.label ?? null) })
    return () => { active = false }
  }, [nodeKey])
  if (!label) return null
  return (
    <button
      type="button"
      onClick={() => onSelect(nodeKey)}
      style={{ minHeight: 48, padding: '12px 16px', borderRadius: 14, border: '1px solid var(--cv-border)', background: 'var(--cv-surface-elevated)', color: 'var(--cv-text)', textAlign: 'left', fontWeight: 700, cursor: 'pointer' }}
    >
      {label}
    </button>
  )
}

function breadcrumbStyle(active: boolean): React.CSSProperties {
  return {
    minHeight: 36,
    padding: '6px 12px',
    borderRadius: 999,
    border: `1px solid ${active ? 'var(--cv-blue)' : 'var(--cv-border)'}`,
    background: active ? 'var(--cv-nav-selected)' : 'var(--cv-surface-elevated)',
    color: 'var(--cv-text)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  }
}

const smallButtonStyle: React.CSSProperties = {
  minHeight: 40,
  padding: '8px 14px',
  borderRadius: 12,
  border: '1px solid var(--cv-border)',
  background: 'var(--cv-surface)',
  color: 'var(--cv-text)',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
}
