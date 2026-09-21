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
// One preference row inside Me's Preferences list; styling lives in commercial-visual-system.css under
// [data-commercial-surface="me"]. The selected option is marked by weight and a check mark, not colour alone.
export default function AppearanceSettings() {
  const appearance = useAppearance()
  return <div className="cv-me-pref">
    <h3 id="appearance-title" className="cv-me-item-title">Appearance</h3>
    <div className="cv-me-choices" role="group" aria-labelledby="appearance-title">
      {(['system', 'light', 'dark'] as const).map(value => <button key={value} type="button" className="cv-me-choice" aria-pressed={appearance === value} onClick={() => setAppearance(value)}>{value === 'system' ? 'System' : value === 'light' ? 'Light' : 'Dark'}</button>)}
    </div>
    <p className="cv-me-note">System follows your device’s light or dark setting. Applies to this browser or app on this device.</p>
  </div>
}
