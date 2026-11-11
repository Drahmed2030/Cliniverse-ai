'use client'

import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import AuthScreen from '../AuthScreen'
import { getCurrentSession, subscribeToAuthState } from '../../lib/identity'
import { ensureOwnProfile } from '../../lib/profile'
import { ACCOUNT_DELETED_NOTICE } from '../../lib/account-deletion-notice'

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'guest'; user: null }
  | { status: 'signed_out'; user: null }
  | { status: 'signed_in'; user: User }
  | { status: 'error'; user: null; message: string }

interface AuthGateProps {
  children: (user: User) => ReactNode
  guest?: ReactNode
  allowGuest?: boolean
  locale?: 'en' | 'ar'
}

export default function AuthGate({ children, guest = null, allowGuest = true, locale = 'en' }: AuthGateProps) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

  const [accountDeleted, setAccountDeleted] = useState(false)
  const [deletionLocale, setDeletionLocale] = useState(locale)

  useEffect(() => {
    let active = true

    async function restore() {
      const { data, error } = await getCurrentSession()
      if (!active) return
      if (error) return setState({ status: 'error', user: null, message: 'Unable to restore your session.' })
      const user = data.session?.user ?? null
      if (!user) {
        try {
          const notice = window.sessionStorage.getItem(ACCOUNT_DELETED_NOTICE)
          setAccountDeleted(notice === '1' || notice === 'en' || notice === 'ar')
          setDeletionLocale(notice === 'ar' ? 'ar' : locale)
          window.sessionStorage.removeItem(ACCOUNT_DELETED_NOTICE)
        } catch {
          // Storage can be unavailable in private or embedded browsing contexts.
        }
        return setState({ status: 'signed_out', user: null })
      }
      setAccountDeleted(false)
      const profileResult = await ensureOwnProfile()
      if (!active) return
      if (profileResult.error) return setState({ status: 'error', user: null, message: 'Unable to prepare your profile.' })
      setState({ status: 'signed_in', user })
    }

    restore()
    const { data } = subscribeToAuthState(async (_event, session) => {
      if (!active) return
      const user = session?.user ?? null
      if (!user) return setState({ status: 'signed_out', user: null })
      setAccountDeleted(false)
      const profileResult = await ensureOwnProfile()
      if (!active) return
      if (profileResult.error) return setState({ status: 'error', user: null, message: 'Unable to prepare your profile.' })
      setState({ status: 'signed_in', user })
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [locale])

  if (state.status === 'loading') return <GateStatus title="Restoring your session" detail="Preparing Cliniverse securely…" />
  if (state.status === 'error') return <GateStatus title="Account unavailable" detail={state.message} />
  if (state.status === 'guest') return <>{guest}</>
  if (state.status === 'signed_in') return <>{children(state.user)}</>

  return <>
    {accountDeleted ? <div role="status" lang={deletionLocale} dir={deletionLocale === 'ar' ? 'rtl' : 'ltr'} style={{ padding: 12, background: '#111827', color: '#F8FAFC', textAlign: 'center' }}>{deletionLocale === 'ar' ? 'تم حذف حسابك في Cliniverse.' : 'Your Cliniverse account was deleted.'}</div> : null}
    <AuthScreen locale={locale} allowGuest={allowGuest} onComplete={(payload) => { if (payload?.method === 'guest') setState({ status: 'guest', user: null }) }} />
  </>
}

function GateStatus({ title, detail }: { title: string; detail: string }) {
  return <main style={{ minHeight: '100dvh', background: '#080C16', color: '#F8FAFC', display: 'grid', placeItems: 'center', padding: 24 }}><div role="status" aria-live="polite" style={{ maxWidth: 420, width: '100%', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 20, background: '#111827', padding: 20 }}><div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div><div style={{ marginTop: 7, color: '#94A3B8', fontSize: 13, lineHeight: 1.6 }}>{detail}</div></div></main>
}
