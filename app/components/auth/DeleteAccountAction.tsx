'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { ACCOUNT_DELETION_WORD, isDeletionConfirmed } from '../../lib/account-deletion-confirmation.mjs'
import { ACCOUNT_DELETED_NOTICE } from '../../lib/account-deletion-notice'
import { getCurrentSession, signOut } from '../../lib/identity'

export default function DeleteAccountAction() {
  const dialog = useRef<HTMLDialogElement>(null)
  const account = useRef<string | null>(null)
  const title = useId()
  const description = useId()
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function open() {
    account.current = null
    setConfirmation('')
    setError('')
    try {
      const { data, error } = await getCurrentSession()
      if (error || !data.session) {
        setError('Sign in to delete your account.')
        return
      }
      account.current = data.session.user.id
      dialog.current?.showModal()
      setIsOpen(true)
    } catch {
      setError('Unable to restore your session.')
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !isDeletionConfirmed(confirmation)) return

    setBusy(true)
    setError('')
    try {
      const { data, error } = await getCurrentSession()
      if (error || !data.session || data.session.user.id !== account.current) {
        setError('Your session changed. Close this dialog and sign in again.')
        setBusy(false)
        return
      }
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + data.session.access_token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation }),
        cache: 'no-store',
        redirect: 'error',
      })

      if (response.status !== 204) {
        setError(response.status === 401 ? 'Sign in again to delete your account.' : 'Unable to delete your account. Please try again.')
        setBusy(false)
        return
      }
    } catch {
      setError('Unable to confirm account deletion. Please try again.')
      setBusy(false)
      return
    }

    // Auth already removed the account. Discard this device's state even if
    // the provider can no longer complete sign-out with the deleted identity.
    await signOut().catch(() => undefined)
    await Promise.allSettled([
      Promise.resolve().then(() => window.localStorage.clear()),
      Promise.resolve().then(() => window.sessionStorage.clear()),
      Promise.resolve().then(async () => {
        if (!('caches' in window)) return
        const keys = await window.caches.keys()
        await Promise.all(keys.filter(key => key.startsWith('cliniverse-')).map(key => window.caches.delete(key)))
      }),
    ])
    try {
      window.sessionStorage.setItem(ACCOUNT_DELETED_NOTICE, '1')
    } catch {
      // The account was deleted even if this device cannot store the notice.
    }
    window.location.replace('/')
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button type="button" onClick={open} disabled={busy} style={dangerButton}>
        Delete account
      </button>
      {error && !isOpen ? <p role="alert">{error}</p> : null}
      <dialog
        ref={dialog}
        aria-labelledby={title}
        aria-describedby={description}
        onClose={() => { setIsOpen(false); setError('') }}
        onCancel={event => { if (busy) event.preventDefault() }}
        style={{ width: 'min(420px, calc(100vw - 32px))', border: '1px solid #64748B', borderRadius: 16, padding: 20, background: '#111827', color: '#F8FAFC' }}
      >
        <form onSubmit={submit}>
          <h2 id={title}>Permanently delete your account?</h2>
          <p id={description}>This deletes your sign-in account, Cliniverse profile, saved learning progress and in-app subscription record. If you have a store subscription, manage or cancel it separately through the store.</p>
          <label style={{ display: 'grid', gap: 6, marginBlock: 12 }}>
            Type {ACCOUNT_DELETION_WORD} to confirm
            <input
              value={confirmation}
              onChange={event => setConfirmation(event.target.value)}
              disabled={busy}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              style={{ minHeight: 44, padding: 8, color: '#111827', background: '#F8FAFC', borderRadius: 6 }}
            />
          </label>
          {error ? <p role="alert" style={{ color: '#FCA5A5' }}>{error}</p> : null}
          <button type="button" onClick={() => dialog.current?.close()} disabled={busy} style={{ minHeight: 44, marginBottom: 8, paddingInline: 12, border: '1px solid #94A3B8', borderRadius: 8 }}>Cancel</button>
          <button type="submit" disabled={busy || !isDeletionConfirmed(confirmation)} style={dangerButton}>
            {busy ? 'Deleting account…' : 'Permanently delete account'}
          </button>
        </form>
      </dialog>
    </div>
  )
}

const dangerButton = {
  width: '100%',
  minHeight: 44,
  borderRadius: 12,
  border: '1px solid #B95252',
  background: '#3B1924',
  color: '#FECACA',
  fontWeight: 800,
}
