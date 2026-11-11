'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { isDeletionConfirmed } from '../../lib/account-deletion-confirmation.mjs'
import { ACCOUNT_DELETED_NOTICE } from '../../lib/account-deletion-notice'
import { getCurrentSession, signOut } from '../../lib/identity'

const copy = {
  en: {
    button: 'Delete account',
    title: 'Permanently delete your account?',
    description: 'This deletes your sign-in account, Cliniverse profile, saved learning progress and in-app subscription record. If you have a store subscription, manage or cancel it separately through the store.',
    label: 'Type DELETE to confirm',
    cancel: 'Cancel',
    submit: 'Permanently delete account',
    busy: 'Deleting account…',
    signIn: 'Sign in to delete your account.',
    restore: 'Unable to restore your session.',
    changed: 'Your session changed. Close this dialog and sign in again.',
    unauthorized: 'Sign in again to delete your account.',
    unavailable: 'Account deletion is temporarily unavailable.',
    failed: 'Unable to delete your account. Please try again.',
    uncertain: 'Unable to confirm account deletion. Please try again.',
  },
  ar: {
    button: 'حذف الحساب',
    title: 'هل تريد حذف حسابك نهائيًا؟',
    description: 'سيُحذف حساب تسجيل الدخول وملفك في Cliniverse وتقدمك التعليمي المحفوظ وسجل اشتراكك داخل التطبيق. إذا كان لديك اشتراك عبر المتجر، فعليك إدارته أو إلغاؤه من المتجر بشكل منفصل.',
    label: 'اكتب حذف للتأكيد',
    cancel: 'إلغاء',
    submit: 'حذف الحساب نهائيًا',
    busy: 'جارٍ حذف الحساب…',
    signIn: 'سجّل الدخول لحذف حسابك.',
    restore: 'تعذّر استعادة جلسة تسجيل الدخول.',
    changed: 'تغيّرت جلستك. أغلق هذه النافذة وسجّل الدخول مجددًا.',
    unauthorized: 'سجّل الدخول مجددًا لحذف حسابك.',
    unavailable: 'حذف الحساب غير متاح مؤقتًا.',
    failed: 'تعذّر حذف حسابك. حاول مجددًا.',
    uncertain: 'تعذّر تأكيد حذف الحساب. حاول مجددًا.',
  },
}

export default function DeleteAccountAction({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  const text = copy[locale]
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
        setError(text.signIn)
        return
      }
      account.current = data.session.user.id
      dialog.current?.showModal()
      setIsOpen(true)
    } catch {
      setError(text.restore)
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
        setError(text.changed)
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
        setError(response.status === 401 ? text.unauthorized : response.status === 503 ? text.unavailable : text.failed)
        setBusy(false)
        return
      }
    } catch {
      setError(text.uncertain)
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
      window.sessionStorage.setItem(ACCOUNT_DELETED_NOTICE, locale)
    } catch {
      // The account was deleted even if this device cannot store the notice.
    }
    window.location.replace('/')
  }

  return (
    <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} style={{ marginTop: 10 }}>
      <button type="button" onClick={open} disabled={busy} style={dangerButton}>
        {text.button}
      </button>
      {error && !isOpen ? <p role="alert">{error}</p> : null}
      <dialog
        ref={dialog}
        lang={locale}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        aria-labelledby={title}
        aria-describedby={description}
        onClose={() => { setIsOpen(false); setError('') }}
        onCancel={event => { if (busy) event.preventDefault() }}
        style={{ width: 'min(420px, calc(100vw - 32px))', border: '1px solid #64748B', borderRadius: 16, padding: 20, background: '#111827', color: '#F8FAFC' }}
      >
        <form onSubmit={submit}>
          <h2 id={title}>{text.title}</h2>
          <p id={description}>{text.description}</p>
          <label style={{ display: 'grid', gap: 6, marginBlock: 12 }}>
            {text.label}
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
          <button type="button" onClick={() => dialog.current?.close()} disabled={busy} style={{ minHeight: 44, marginBottom: 8, paddingInline: 12, border: '1px solid #94A3B8', borderRadius: 8 }}>{text.cancel}</button>
          <button type="submit" disabled={busy || !isDeletionConfirmed(confirmation)} style={dangerButton}>
            {busy ? text.busy : text.submit}
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
