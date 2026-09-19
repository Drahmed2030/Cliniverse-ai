'use client'

import { useSyncExternalStore } from 'react'
import { updateInterestPreferences } from '../../lib/engagement/client'
import type { ClinicianInterestTopic } from '../../lib/engagement/interests'

// A curated subset of the full taxonomy (app/lib/engagement/interests.ts) for
// this minimal preference surface — not every approved topic needs a toggle
// here yet. Selections persist to this browser/device only via localStorage,
// mirroring AppearanceSettings.tsx, until a Supabase table for durable
// cross-device sync is reviewed and applied (see
// docs/ENGAGEMENT_PRIVACY_BOUNDARY_V1.md's "Required Supabase schema").
const TOPIC_OPTIONS: Array<{ topic: ClinicianInterestTopic; label: string }> = [
  { topic: 'heart_failure', label: 'Heart Failure' },
  { topic: 'hypertension', label: 'Hypertension' },
  { topic: 'ecg', label: 'ECG' },
  { topic: 'echo', label: 'Echo' },
  { topic: 'arrhythmia', label: 'Arrhythmias' },
  { topic: 'new_evidence', label: 'New Evidence' },
  { topic: 'clinical_trials', label: 'Clinical Trials' },
]

const key = 'cliniverse.topics-i-follow.v1'
const eventName = 'cliniverse-topics-change'
let sessionSelection: ClinicianInterestTopic[] | null = null

function isTopic(value: unknown): value is ClinicianInterestTopic {
  return typeof value === 'string' && TOPIC_OPTIONS.some(option => option.topic === value)
}

const EMPTY: ClinicianInterestTopic[] = []
let cachedRaw: string | null | undefined
let cachedValue: ClinicianInterestTopic[] = EMPTY

function snapshot(): ClinicianInterestTopic[] {
  if (sessionSelection) return sessionSelection
  try {
    const raw = localStorage.getItem(key)
    if (raw !== cachedRaw) {
      cachedRaw = raw
      const parsed = raw ? JSON.parse(raw) : []
      cachedValue = Array.isArray(parsed) ? parsed.filter(isTopic) : EMPTY
    }
    return cachedValue
  } catch {
    return EMPTY
  }
}

function subscribe(notify: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) { sessionSelection = null; notify() }
  }
  window.addEventListener(eventName, notify)
  window.addEventListener('storage', storage)
  return () => { window.removeEventListener(eventName, notify); window.removeEventListener('storage', storage) }
}

function setSelection(next: ClinicianInterestTopic[]) {
  sessionSelection = next
  try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* Keep the choice for this session when storage is unavailable. */ }
  window.dispatchEvent(new Event(eventName))
  // Routed through the provider-agnostic engagement layer (Noop by default —
  // see docs/ENGAGEMENT_PRIVACY_BOUNDARY_V1.md). Never blocks the UI on
  // failure; errors are swallowed inside updateInterestPreferences itself.
  void updateInterestPreferences(next.map(topic => ({ topic, source: 'explicit' as const })))
}

function useTopicsIFollow() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY)
}

export default function TopicsIFollow() {
  const selected = useTopicsIFollow()

  function toggle(topic: ClinicianInterestTopic) {
    setSelection(selected.includes(topic) ? selected.filter(t => t !== topic) : [...selected, topic])
  }

  return (
    <section aria-labelledby="topics-i-follow-title" style={{ padding: 16, marginBottom: 12, borderRadius: 18, border: '1px solid var(--cv-border)', background: 'var(--cv-surface)', color: 'var(--cv-text)' }}>
      <h2 id="topics-i-follow-title" style={{ fontSize: '1rem', margin: '0 0 8px' }}>Topics I follow</h2>
      <p style={{ color: 'var(--cv-text-secondary)', margin: '0 0 12px' }}>Helps tailor what you see across Learn and Explore. This does not send you any email or notification.</p>
      <div role="group" aria-label="Topics I follow" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TOPIC_OPTIONS.map(({ topic, label }) => (
          <button
            key={topic}
            type="button"
            aria-pressed={selected.includes(topic)}
            onClick={() => toggle(topic)}
            style={{
              minHeight: 44,
              padding: '10px 16px',
              borderRadius: 12,
              border: `1px solid ${selected.includes(topic) ? 'var(--cv-teal)' : 'var(--cv-border)'}`,
              background: selected.includes(topic) ? 'var(--cv-nav-selected)' : 'var(--cv-surface-elevated)',
              color: 'var(--cv-text)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p style={{ color: 'var(--cv-text-secondary)', fontSize: '0.85rem', marginTop: 12, marginBottom: 0 }}>Applies to this browser or app on this device.</p>
    </section>
  )
}
