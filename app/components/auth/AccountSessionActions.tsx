'use client'

import { useState } from 'react'
import { signOut } from '../../lib/identity'

// Styling lives in commercial-visual-system.css under [data-commercial-surface="me"] (.cv-me-signout).
export default function AccountSessionActions() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSignOut() {
    if (busy) return
    setBusy(true)
    setError('')
    const { error: signOutError } = await signOut()
    if (signOutError) {
      setError('Unable to sign out. Please try again.')
      setBusy(false)
      return
    }
    setBusy(false)
  }

  return (
    <div>
      <button type="button" className="cv-me-row cv-me-signout" onClick={handleSignOut} disabled={busy}>
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
      {error ? <div role="alert" className="cv-me-error">{error}</div> : null}
    </div>
  )
}
