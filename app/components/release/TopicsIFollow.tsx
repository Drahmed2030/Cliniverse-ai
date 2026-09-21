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

// One preference row inside Me's Preferences list, disclosed on demand so the primary screen stays compact.
// The summary states the real selection; styling lives in commercial-visual-system.css under
// [data-commercial-surface="me"]. There is no single "learning focus" field, so the multi-topic model is shown as it is.
export default function TopicsIFollow() {
  const selected = useTopicsIFollow()

  function toggle(topic: ClinicianInterestTopic) {
    setSelection(selected.includes(topic) ? selected.filter(t => t !== topic) : [...selected, topic])
  }

  const selectedLabels = TOPIC_OPTIONS.filter(option => selected.includes(option.topic)).map(option => option.label)

  return (
    <details className="cv-me-disclosure">
      <summary>
        <span>
          <span id="topics-i-follow-title" className="cv-me-item-title">Topics I follow</span>
          <span className="cv-me-item-text">{selectedLabels.length ? selectedLabels.join(', ') : 'None selected'}</span>
        </span>
      </summary>
      <p className="cv-me-note">Helps tailor what you see across Learn and Explore. This does not send you any email or notification.</p>
      <div className="cv-me-choices" role="group" aria-labelledby="topics-i-follow-title">
        {TOPIC_OPTIONS.map(({ topic, label }) => (
          <button
            key={topic}
            type="button"
            className="cv-me-choice"
            aria-pressed={selected.includes(topic)}
            onClick={() => toggle(topic)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="cv-me-note">Applies to this browser or app on this device.</p>
    </details>
  )
}
