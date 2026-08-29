'use client'

import { useEffect, useState } from 'react'
import { getOwnEntitlement, type CliniverseEntitlement } from '../../lib/entitlements'
import { getCurrentUser } from '../../lib/identity'
import { getOwnProfile, updateOwnProfile } from '../../lib/profile'
import AccountSessionActions from '../auth/AccountSessionActions'

interface ProfileState {
  name: string
  email: string
}

const C = {
  panel: '#111827',
  elevated: '#172033',
  border: 'rgba(148,163,184,0.20)',
  text: '#F8FAFC',
  sub: '#94A3B8',
  blue: '#3B82F6',
  teal: '#14B8A6',
  danger: '#FCA5A5',
}

export default function MeAccountSummary() {
  const [profile, setProfile] = useState<ProfileState | null>(null)
  const [entitlement, setEntitlement] = useState<CliniverseEntitlement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      const [profileResult, entitlementResult, userResult] = await Promise.all([
        getOwnProfile(),
        getOwnEntitlement(),
        getCurrentUser(),
      ])

      if (!active) return

      if (profileResult.data) {
        setProfile({
          name: profileResult.data.name || '',
          email: userResult.data.user?.email || '',
        })
      }
      setEntitlement(entitlementResult)
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  async function saveProfile() {
    if (!profile || saving) return
    setSaving(true)
    setMessage('')

    const result = await updateOwnProfile({
      name: profile.name,
    })

    setSaving(false)
    if (result.error) {
      setMessage('Profile update failed. Please try again.')
      return
    }
    setMessage('Profile updated.')
  }

  if (loading) {
    return <div style={cardStyle}>Loading account…</div>
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <section style={cardStyle} aria-labelledby="profile-account-title">
        <div id="profile-account-title" style={{ fontSize: 16, fontWeight: 800 }}>Profile</div>
        <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>
          Authenticated professional metadata. Email ownership comes from the signed-in account.
        </div>

        {profile ? (
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            <ReadOnlyField label="Email" value={profile.email} />
            <EditableField label="Name" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} />
            <button type="button" onClick={saveProfile} disabled={saving} style={primaryButtonStyle}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
            {message ? <div role="status" style={{ fontSize: 11, color: message.includes('failed') ? C.danger : C.teal }}>{message}</div> : null}
          </div>
        ) : (
          <div style={{ color: C.danger, fontSize: 12, marginTop: 12 }}>Profile unavailable.</div>
        )}
      </section>

      <section style={cardStyle} aria-labelledby="plan-account-title">
        <div id="plan-account-title" style={{ fontSize: 16, fontWeight: 800 }}>Plan</div>
        <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>
          Read-only entitlement state. This screen cannot activate or upgrade itself.
        </div>
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: C.elevated }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'capitalize' }}>{entitlement?.tier ?? 'free'}</div>
          <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>
            Status: {entitlement?.status ?? 'unknown'} · Source: {entitlement?.source ?? 'none'}
          </div>
          {entitlement?.expiresAt ? <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>Expires: {new Date(entitlement.expiresAt).toLocaleDateString()}</div> : null}
        </div>
      </section>

      <section style={cardStyle} aria-labelledby="session-account-title">
        <div id="session-account-title" style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Account session</div>
        <AccountSessionActions />
      </section>
    </div>
  )
}

function EditableField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <div style={labelStyle}>{label}</div>
      <input value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
    </label>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label>
      <div style={labelStyle}>{label}</div>
      <input value={value} readOnly aria-readonly="true" style={{ ...inputStyle, opacity: 0.72 }} />
    </label>
  )
}

const cardStyle = {
  padding: 16,
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  background: C.panel,
  color: C.text,
} as const

const labelStyle = {
  fontSize: 10,
  fontWeight: 800,
  color: C.sub,
  marginBottom: 5,
  letterSpacing: 0.5,
} as const

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 12,
  border: `1px solid ${C.border}`,
  background: C.elevated,
  color: C.text,
  padding: '11px 12px',
  fontSize: 13,
  outline: 'none',
} as const

const primaryButtonStyle = {
  minHeight: 42,
  borderRadius: 12,
  border: 'none',
  background: C.blue,
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
} as const
