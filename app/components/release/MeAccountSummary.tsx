'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../lib/identity'
import { getOwnProfile, updateOwnProfile } from '../../lib/profile'
import AccountSessionActions from '../auth/AccountSessionActions'
import { useCliniverseSubscription } from './SubscriptionPurchaseProvider'

interface ProfileState {
  name: string
  email: string
}

const C = {
  panel: 'var(--cv-surface)',
  elevated: 'var(--cv-surface-elevated)',
  border: 'var(--cv-border)',
  text: 'var(--cv-text)',
  sub: 'var(--cv-text-secondary)',
  blue: 'var(--cv-blue)',
  teal: 'var(--cv-teal)',
  danger: '#b42318',
}

export default function MeAccountSummary() {
  const [profile, setProfile] = useState<ProfileState | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const {
    entitlement,
    entitlementLoading,
    products,
    openPaywall,
    storeMessage,
  } = useCliniverseSubscription()
  const primaryProduct = products[0]

  useEffect(() => {
    let active = true

    async function load() {
      const [profileResult, userResult] = await Promise.all([
        getOwnProfile(),
        getCurrentUser(),
      ])

      if (!active) return

      if (profileResult.data) {
        setProfile({
          name: profileResult.data.name || '',
          email: userResult.data.user?.email || '',
        })
      }
      setProfileLoading(false)
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

  if (profileLoading || entitlementLoading) {
    return <div style={cardStyle}>Loading account…</div>
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <section style={cardStyle} aria-labelledby="profile-account-title">
        <div id="profile-account-title" style={{ fontSize: '1rem', fontWeight: 800 }}>Profile</div>
        <div style={{ color: C.sub, fontSize: '0.82rem', marginTop: 4 }}>
          Authenticated professional metadata. Email ownership comes from the signed-in account.
        </div>

        {profile ? (
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            <ReadOnlyField label="Email" value={profile.email} />
            <EditableField label="Name" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} />
            <button type="button" onClick={saveProfile} disabled={saving} style={primaryButtonStyle}>
              {saving ? 'Saving…' : 'Save profile'}
            </button>
            {message ? <div role="status" style={{ fontSize: '0.82rem', color: message.includes('failed') ? C.danger : C.teal }}>{message}</div> : null}
          </div>
        ) : (
          <div style={{ color: C.danger, fontSize: '0.9rem', marginTop: 12 }}>Profile unavailable.</div>
        )}
      </section>

      <section style={cardStyle} aria-labelledby="plan-account-title">
        <div id="plan-account-title" style={{ fontSize: '1rem', fontWeight: 800 }}>Plan</div>
        <div style={{ color: C.sub, fontSize: '0.82rem', marginTop: 4 }}>
          App Store controls the localized price and renewal. Cliniverse activates PRO only after server verification.
        </div>
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: C.elevated }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'capitalize' }}>{entitlement?.tier ?? 'free'}</div>
          <div style={{ color: C.sub, fontSize: '0.82rem', marginTop: 4 }}>
            Status: {entitlement?.status ?? 'unknown'} · Source: {entitlement?.source ?? 'none'}
          </div>
          {entitlement?.expiresAt ? <div style={{ color: C.sub, fontSize: '0.82rem', marginTop: 4 }}>Expires: {new Date(entitlement.expiresAt).toLocaleDateString()}</div> : null}
          {primaryProduct ? (
            <div style={{ color: C.text, fontSize: '0.9rem', fontWeight: 800, marginTop: 10 }}>
              {primaryProduct.displayName} · {primaryProduct.displayPrice} · {primaryProduct.subscriptionPeriod}
            </div>
          ) : null}
        </div>
        <button type="button" onClick={openPaywall} style={{ ...primaryButtonStyle, width: '100%', marginTop: 10 }}>
          {entitlement?.isPro ? 'View Cliniverse PRO plan' : 'Upgrade to Cliniverse PRO'}
        </button>
        {entitlement?.isPro ? (
          <a
            href="https://apps.apple.com/account/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', color: C.blue, textAlign: 'center', fontSize: '0.82rem', fontWeight: 800, marginTop: 10 }}
          >
            Manage Apple subscription
          </a>
        ) : null}
        {storeMessage ? <div role="status" aria-live="polite" style={{ color: C.sub, fontSize: '0.82rem', lineHeight: 1.5, marginTop: 8 }}>{storeMessage}</div> : null}
      </section>

      <section style={cardStyle} aria-labelledby="session-account-title">
        <div id="session-account-title" style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 10 }}>Account session</div>
        <AccountSessionActions />
      </section>
    </div>
  )
}

function EditableField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <div style={labelStyle}>{label}</div>
      <input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
    </label>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label>
      <div style={labelStyle}>{label}</div>
      <input aria-label={label} value={value} readOnly aria-readonly="true" style={{ ...inputStyle, opacity: 0.72 }} />
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
  fontSize: '0.78rem',
  fontWeight: 800,
  color: C.sub,
  marginBottom: 5,
  letterSpacing: '0.04em',
} as const

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 12,
  border: `1px solid ${C.border}`,
  background: C.elevated,
  color: C.text,
  padding: '11px 12px',
  fontSize: '0.95rem',
  outline: 'none',
} as const

const primaryButtonStyle = {
  minHeight: 44,
  borderRadius: 12,
  border: `1px solid ${C.border}`,
  background: C.blue,
  color: '#FFFFFF',
  fontSize: '0.95rem',
  fontWeight: 800,
  cursor: 'pointer',
} as const
