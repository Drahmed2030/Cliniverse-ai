'use client'

import { useState } from 'react'
import { signOut } from '../../lib/identity'

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
      <button
        type="button"
        onClick={handleSignOut}
        disabled={busy}
        style={{
          width: '100%',
          minHeight: 44,
          borderRadius: 14,
          border: '1px solid rgba(248,113,113,0.28)',
          background: 'rgba(248,113,113,0.08)',
          color: '#FCA5A5',
          fontWeight: 800,
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
      {error ? <div role="alert" style={{ marginTop: 8, color: '#FCA5A5', fontSize: 12 }}>{error}</div> : null}
    </div>
  )
}
