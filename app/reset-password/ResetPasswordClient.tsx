'use client'

// Standalone recovery page. It deliberately imports nothing that creates the shared Supabase client: that
// client would read the recovery tokens from the URL and replace any stored session. See lib/passwordRecovery.ts.

import { useEffect, useRef, useState } from 'react'
import {
  completeRecovery,
  createRecoveryClient,
  MIN_PASSWORD_LENGTH,
  parseRecoveryHash,
  startRecovery,
  type RecoveryClient,
} from '../lib/passwordRecovery'
import { ensureNoStaleWorker } from '../lib/staleWorkerGuard'
import { NATIVE_SAFE_AREA_BOTTOM, NATIVE_SAFE_AREA_TOP } from '../lib/nativeSafeArea'

type View =
  | { name: 'checking' }
  | { name: 'invalid'; expired: boolean }
  | { name: 'blocked' }
  | { name: 'form'; maskedEmail: string }
  | { name: 'done'; sessionsEnded: boolean }

const T = { bg: '#050814', panel: 'rgba(15,23,42,.72)', text: '#F8FAFC', sub: '#A7B0C0', muted: '#6F7B91', border: 'rgba(148,163,184,.18)', blue: '#4F7CFF', violet: '#7567FF', danger: '#F87171', success: '#34D399' }

const MESSAGES = {
  too_short: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  mismatch: 'The two passwords do not match.',
  empty: 'Enter a new password.',
  rejected: 'This password could not be accepted. Choose a different one and try again.',
  error: 'Something went wrong. Check your connection and try again.',
}

export default function ResetPasswordClient() {
  const [view, setView] = useState<View>({ name: 'checking' })
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const client = useRef<RecoveryClient | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    void (async () => {
      // Before the tokens in the URL are read or used: make sure no older service worker controls this page.
      const guard = await ensureNoStaleWorker({
        serviceWorker: 'serviceWorker' in navigator ? navigator.serviceWorker : undefined,
        caches: 'caches' in window ? window.caches : undefined,
        location: window.location,
      })
      if (guard === 'reloading') return
      const link = parseRecoveryHash(window.location.hash)
      // Remove tokens from the address bar and history before anything else happens.
      window.history.replaceState(null, '', window.location.pathname)
      if (guard === 'blocked') { setView({ name: 'blocked' }); return }
      if (link.kind === 'invalid') { setView({ name: 'invalid', expired: link.reason === 'expired' }); return }
      client.current = createRecoveryClient()
      const result = await startRecovery(client.current, link)
      setView(result.status === 'ready' ? { name: 'form', maskedEmail: result.maskedEmail } : { name: 'invalid', expired: false })
    })()
  }, [])

  async function submit() {
    if (busy || !client.current) return
    setBusy(true)
    setError('')
    const result = await completeRecovery(client.current, password, confirmation)
    setBusy(false)
    if (result.status === 'done') { client.current = null; setPassword(''); setConfirmation(''); setView({ name: 'done', sessionsEnded: result.sessionsEnded }); return }
    setError(result.status === 'invalid_password' ? MESSAGES[result.reason] : MESSAGES[result.status])
  }

  return (
    <main style={{ minHeight: '100dvh', background: T.bg, color: T.text, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `calc(24px + ${NATIVE_SAFE_AREA_TOP}) 20px calc(24px + ${NATIVE_SAFE_AREA_BOTTOM})`, boxSizing: 'border-box' }} aria-labelledby="reset-title">
      <div style={{ width: '100%', maxWidth: 430, margin: '0 auto' }}>
        <div style={{ fontSize: 10, fontWeight: 850, letterSpacing: 1.15, color: T.blue, marginBottom: 10 }}>CLINIVERSE AI · BY NEURAOPS</div>
        <h1 id="reset-title" style={{ fontSize: 28, fontWeight: 850, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px' }}>Reset your password</h1>
        <div style={{ border: `1px solid ${T.border}`, background: T.panel, borderRadius: 24, padding: 16 }}>
          {view.name === 'checking' ? <p role="status" style={{ color: T.sub, margin: 0 }}>Checking your link…</p> : null}
          {view.name === 'invalid' ? (
            <div role="alert">
              <p style={{ margin: '0 0 10px', fontWeight: 700 }}>{view.expired ? 'This link has expired.' : 'This reset link is not valid or was already used.'}</p>
              <p style={{ margin: 0, color: T.sub, lineHeight: 1.5 }}>Open Cliniverse, choose Sign in, then “Forgot password?” to get a new link. Some email apps open links automatically, which can use them up.</p>
            </div>
          ) : null}
          {view.name === 'blocked' ? (
            <div role="alert">
              <p style={{ margin: '0 0 10px', fontWeight: 700 }}>We could not prepare this page safely.</p>
              <p style={{ margin: 0, color: T.sub, lineHeight: 1.5 }}>An older version of this site is still running in your browser. Close this tab, then open the link from your email again. If it happens again, clear this site's data in your browser settings or request a new link from the Cliniverse sign-in screen. Your link was not used.</p>
            </div>
          ) : null}
          {view.name === 'form' ? (
            <form onSubmit={event => { event.preventDefault(); void submit() }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0, color: T.sub, lineHeight: 1.5 }}>Set a new password for <strong style={{ color: T.text }}>{view.maskedEmail}</strong>. If this is not your account, close this page.</p>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 6 }}>New password</span>
                <input type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} style={inputStyle} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 6 }}>Confirm new password</span>
                <input type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} style={inputStyle} />
              </label>
              {error ? <div role="alert" style={{ fontSize: 12, color: T.danger, fontWeight: 650 }}>{error}</div> : null}
              <button type="submit" disabled={busy} style={{ minHeight: 50, border: 'none', borderRadius: 16, color: T.text, fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, ${T.blue}, ${T.violet})`, opacity: busy ? 0.55 : 1, cursor: 'pointer' }}>{busy ? '…' : 'Update password'}</button>
            </form>
          ) : null}
          {view.name === 'done' ? (
            <div role="status">
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: T.success }}>Your password was updated.</p>
              <p style={{ margin: 0, color: T.sub, lineHeight: 1.5 }}>
                {view.sessionsEnded
                  ? 'We revoked the saved sign-in on your other devices, so they cannot renew it. A device that is open right now may keep working briefly (typically up to an hour) until its current access expires. '
                  : 'We could not revoke your other sessions. If you think someone else may have access to your account, sign out from Me on each device and contact support. '}
                Return to the Cliniverse app and sign in with your new password.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

const inputStyle = { width: '100%', boxSizing: 'border-box', minHeight: 50, borderRadius: 14, border: `1px solid ${T.border}`, background: 'rgba(255,255,255,.045)', color: T.text, padding: '0 14px', fontSize: 16 } as const
