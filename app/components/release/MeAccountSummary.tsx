'use client'

import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import { getCurrentUser } from '../../lib/identity'
import { getOwnProfile, updateOwnProfile } from '../../lib/profile'
import { useCliniverseSubscription } from './SubscriptionPurchaseProvider'

// Identity and plan for Me. Layout and control styling lives in commercial-visual-system.css under
// [data-commercial-surface="me"]. Session actions and preferences are composed by MeHub.
export default function MeAccountSummary() {
  // name is null when no profile row could be read; email comes from Supabase Auth, never the profile row.
  const [name, setName] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [email, setEmail] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const {
    reviewerAccess,
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

      setEmail(userResult.data.user?.email || '')
      if (profileResult.data) {
        const saved = profileResult.data.name || ''
        setName(saved)
        setDraft(saved)
      }
      setProfileLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  async function saveProfile() {
    if (name === null || saving) return
    setSaving(true)
    setMessage('')

    const result = await updateOwnProfile({
      name: draft,
    })

    setSaving(false)
    if (result.error) {
      setMessage('Profile update failed. Please try again.')
      return
    }
    // Show what was persisted (the update trims the name), not what was typed.
    const saved = result.data?.name ?? draft.trim()
    setName(saved)
    setDraft(saved)
    setMessage('Profile updated.')
  }

  if (profileLoading || entitlementLoading) {
    return <div className="cv-me-loading" role="status">Loading account…</div>
  }

  // The saved profile name leads; the sign-in email stands in only when no name exists. Nothing is invented.
  const displayName = name?.trim() || email
  const initial = displayName.trim().charAt(0).toUpperCase()

  return (
    <>
      <section className="cv-me-identity" aria-label="Account">
        <span className="cv-me-avatar" aria-hidden="true">{initial || <UserRound size={22} />}</span>
        <div>
          {displayName ? <div className="cv-me-name">{displayName}</div> : null}
          {email && email !== displayName ? <div className="cv-me-email">{email}</div> : null}
          {name === null ? <div className="cv-me-note">Profile unavailable.</div> : null}
        </div>
      </section>
      {name !== null ? (
        <details className="cv-me-edit">
          <summary>Edit name</summary>
          <label className="cv-me-field">
            <span>Name</span>
            <input aria-label="Name" value={draft} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <p className="cv-me-note">Your sign-in email is read-only.</p>
          <button type="button" className="cv-me-save" onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {message ? <div role="status" className={message.includes('failed') ? 'cv-me-error' : 'cv-me-note'}>{message}</div> : null}
        </details>
      ) : null}

      <section className="cv-me-group" aria-labelledby="plan-account-title">
        <h2 id="plan-account-title" className="cv-me-group-title">Plan</h2>
        <ul className="cv-me-list">
          <li className="cv-me-item">
            <div className="cv-me-item-head">
              <span className="cv-me-item-title cv-me-plan-tier">{reviewerAccess ? 'Reviewer access' : entitlement ? entitlement.tier : 'Plan unavailable'}</span>
              {reviewerAccess ? <span className="cv-me-item-status">PRO features enabled for review</span> : entitlement ? <span className="cv-me-item-status">Status: {entitlement.status.replace('_', ' ')}</span> : null}
            </div>
            {!entitlement ? <div className="cv-me-item-text">Your subscription status could not be confirmed.</div> : null}
            {entitlement?.expiresAt ? <div className="cv-me-item-text">Expires: {new Date(entitlement.expiresAt).toLocaleDateString()}</div> : null}
            {primaryProduct ? (
              <div className="cv-me-item-text">
                {primaryProduct.displayName} · {primaryProduct.displayPrice} · {primaryProduct.subscriptionPeriod}
              </div>
            ) : null}
          </li>
          <li>
            <button type="button" className="cv-me-row" onClick={openPaywall}>
              <span>{reviewerAccess ? 'View Cliniverse PRO plans' : entitlement?.isPro ? 'View Cliniverse PRO plan' : 'Upgrade to Cliniverse PRO'}</span>
              <span className="cv-me-row-go" aria-hidden="true">→</span>
            </button>
          </li>
          {entitlement?.isPro ? (
            <li>
              <a
                className="cv-me-row"
                href="https://apps.apple.com/account/subscriptions"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Manage Apple subscription</span>
                <span className="cv-me-row-go" aria-hidden="true">↗</span>
              </a>
            </li>
          ) : null}
        </ul>
        <p className="cv-me-note">View available plans or restore an existing purchase in the iOS app.</p>
        {storeMessage ? <div role="status" aria-live="polite" className="cv-me-note">{storeMessage}</div> : null}
      </section>
    </>
  )
}
