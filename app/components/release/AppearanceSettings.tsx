'use client'

import { useSyncExternalStore } from 'react'

type Appearance = 'system' | 'light' | 'dark'
const key = 'cliniverse.appearance.v1'
const eventName = 'cliniverse-appearance-change'
let sessionPreference: Appearance | null = null
const valid = (value: unknown): value is Appearance => value === 'system' || value === 'light' || value === 'dark'
function snapshot(): Appearance {
  if (sessionPreference) return sessionPreference
  try { const value = localStorage.getItem(key); return valid(value) ? value : 'system' } catch { return 'system' }
}
function subscribe(notify: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) { sessionPreference = null; notify() }
  }
  window.addEventListener(eventName, notify)
  window.addEventListener('storage', storage)
  return () => { window.removeEventListener(eventName, notify); window.removeEventListener('storage', storage) }
}
function setAppearance(value: Appearance) {
  sessionPreference = value
  try { localStorage.setItem(key, value) } catch { /* Keep the choice for this session when storage is unavailable. */ }
  window.dispatchEvent(new Event(eventName))
}
export function useAppearance() {
  return useSyncExternalStore(subscribe, snapshot, () => 'system' as Appearance)
}
export default function AppearanceSettings() {
  const appearance = useAppearance()
  return <section aria-labelledby="appearance-title" style={{ padding: 16, marginBottom: 12, borderRadius: 18, border: '1px solid var(--cv-border)', background: 'var(--cv-surface)', color: 'var(--cv-text)' }}>
    <h2 id="appearance-title" style={{ fontSize: '1rem', margin: '0 0 8px' }}>Appearance</h2>
    <p style={{ color: 'var(--cv-text-secondary)', margin: '0 0 12px' }}>Choose your display. System follows your device’s light or dark setting.</p>
    <div role="group" aria-label="Appearance" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {(['system', 'light', 'dark'] as const).map(value => <button key={value} type="button" aria-pressed={appearance === value} onClick={() => setAppearance(value)} style={{ minHeight: 44, flex: '1 1 100px', padding: '10px 16px', borderRadius: 12, border: `1px solid ${appearance === value ? 'var(--cv-teal)' : 'var(--cv-border)'}`, background: appearance === value ? 'var(--cv-nav-selected)' : 'var(--cv-surface-elevated)', color: 'var(--cv-text)', cursor: 'pointer', fontWeight: 600 }}>{value === 'system' ? 'System' : value === 'light' ? 'Light' : 'Dark'}</button>)}
    </div>
    <p style={{ color: 'var(--cv-text-secondary)', fontSize: '0.85rem', marginBottom: 0 }}>Applies to this browser or app on this device.</p>
  </section>
}
