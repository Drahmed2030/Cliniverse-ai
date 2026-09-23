'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { confirmEmailToken } from '../../lib/identity'
import { parseEmailConfirmationRequest } from '../../lib/authConfirmation'
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_LEFT,
  NATIVE_SAFE_AREA_RIGHT,
  NATIVE_SAFE_AREA_TOP,
} from '../../lib/nativeSafeArea'

type State = 'checking' | 'confirmed' | 'error'

const C = {
  bg: 'var(--cv-bg)',
  panel: 'var(--cv-surface)',
  border: 'var(--cv-border)',
  text: 'var(--cv-text)',
  sub: 'var(--cv-text-secondary)',
  blue: 'var(--cv-blue)',
}

export default function AuthConfirmPage() {
  const [state, setState] = useState<State>('checking')

  useEffect(() => {
    let active = true
    const request = parseEmailConfirmationRequest(window.location.search)
    if (request.state !== 'ready') {
      setState('error')
      return () => { active = false }
    }

    void (async () => {
      try {
        const { data, error } = await confirmEmailToken(request.tokenHash)
        if (!active) return
        if (error || !data.user || !data.session) {
          setState('error')
          return
        }
        setState('confirmed')
      } catch {
        if (active) setState('error')
      }
    })()

    return () => { active = false }
  }, [])

  return (
    <main
      data-commercial-shell
      aria-labelledby="auth-confirm-title"
      style={{
        minHeight: '100dvh',
        background: C.bg,
        color: C.text,
        display: 'grid',
        placeItems: 'center',
        paddingTop: `max(28px, ${NATIVE_SAFE_AREA_TOP})`,
        paddingRight: `max(20px, ${NATIVE_SAFE_AREA_RIGHT})`,
        paddingBottom: `max(28px, ${NATIVE_SAFE_AREA_BOTTOM})`,
        paddingLeft: `max(20px, ${NATIVE_SAFE_AREA_LEFT})`,
      }}
    >
      <section style={{ width: '100%', maxWidth: 440, border: `1px solid ${C.border}`, borderRadius: 24, background: C.panel, padding: 24 }}>
        <p style={{ margin: '0 0 10px', color: C.blue, fontSize: 12, fontWeight: 800, letterSpacing: '.08em' }}>CLINIVERSE AI</p>
        {state === 'checking' ? (
          <>
            <h1 id="auth-confirm-title" style={{ margin: '0 0 10px' }}>Confirming your email…</h1>
            <p role="status" style={{ margin: 0, color: C.sub, lineHeight: 1.6 }}>Please keep this page open for a moment.</p>
          </>
        ) : state === 'confirmed' ? (
          <>
            <h1 id="auth-confirm-title" style={{ margin: '0 0 10px' }}>Email confirmed</h1>
            <p role="status" style={{ margin: '0 0 20px', color: C.sub, lineHeight: 1.6 }}>Your Cliniverse account is ready.</p>
            <Link href="/" style={{ display: 'inline-flex', minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, padding: '0 18px', background: C.blue, color: 'white', fontWeight: 800, textDecoration: 'none' }}>Continue to Cliniverse</Link>
          </>
        ) : (
          <>
            <h1 id="auth-confirm-title" style={{ margin: '0 0 10px' }}>Confirmation link unavailable</h1>
            <p role="alert" style={{ margin: '0 0 20px', color: C.sub, lineHeight: 1.6 }}>This link is invalid, incomplete, or has expired. Return to Cliniverse and sign in or request a new confirmation email.</p>
            <Link href="/" style={{ display: 'inline-flex', minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, padding: '0 18px', border: `1px solid ${C.border}`, color: C.text, fontWeight: 800, textDecoration: 'none' }}>Return to Cliniverse</Link>
          </>
        )}
      </section>
    </main>
  )
}
