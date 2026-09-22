'use client'

import { useState } from 'react'
import { deleteCurrentAccount, signOut } from '../../lib/identity'
import { useCliniverseSubscription } from '../release/SubscriptionPurchaseProvider'

export default function DeleteAccountAction() {
  const { entitlement } = useCliniverseSubscription()
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (busy || confirmation !== 'DELETE') return
    setBusy(true)
    setError('')

    const result = await deleteCurrentAccount()
    if (result.error || !result.data?.deleted) {
      setError('Account deletion could not be completed. Please try again.')
      setBusy(false)
      return
    }

    try {
      await signOut()
    } catch {
      // The account is already deleted server-side; local cleanup below is authoritative.
    }

    if (typeof window !== 'undefined') {
      window.localStorage.clear()
      window.sessionStorage.clear()
      window.location.replace('/')
    }
  }

  if (!open) {
    return (
      <button type="button" className="cv-me-row cv-me-delete" onClick={() => setOpen(true)}>
        <span>Delete account</span>
        <span className="cv-me-row-go" aria-hidden="true">→</span>
      </button>
    )
  }

  return (
    <section className="cv-me-delete-panel" aria-labelledby="delete-account-title">
      <h3 id="delete-account-title">Permanently delete account?</h3>
      <p>
        This permanently deletes your Cliniverse account and associated learning data. This action cannot be undone.
      </p>
      <p>
        Deleting your Cliniverse account does not cancel an App Store subscription.
        {entitlement?.isPro ? (
          <> <a href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">Manage Apple subscription ↗</a></>
        ) : null}
      </p>
      <label className="cv-me-field">
        <span>Type DELETE to confirm</span>
        <input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
      </label>
      <div className="cv-me-delete-actions">
        <button type="button" className="cv-me-delete-cancel" onClick={() => { setOpen(false); setConfirmation(''); setError('') }} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="cv-me-delete-confirm" onClick={handleDelete} disabled={busy || confirmation !== 'DELETE'}>
          {busy ? 'Deleting…' : 'Permanently delete'}
        </button>
      </div>
      {error ? <div role="alert" className="cv-me-error">{error}</div> : null}
    </section>
  )
}
