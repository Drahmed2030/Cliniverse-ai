'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../supabase'
import { BLS_LESSONS } from '../../lib/codelab/blsLessons'
import { ACLS_LESSONS } from '../../lib/codelab/aclsLessons'
import { createLessonCompletionRepository, validateLessonCompletion, type LessonCompletion } from '../../lib/lessonCompletion'
import CodeLabHub from './CodeLabHub'

const lessons = [...BLS_LESSONS, ...ACLS_LESSONS]
const repository = createLessonCompletionRepository(supabase)
type Props = { isPro: boolean; onUpgrade: () => void; onBack: () => void }
type Catalog = Record<string, string>

async function makeCatalog(): Promise<Catalog> {
  return Object.fromEntries(await Promise.all(lessons.map(async lesson => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(lesson)))
    const version = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
    return [lesson.id, `codelab:${lesson.id}:${version}`]
  })))
}

export default function AccountCodeLab(props: Props) {
  const [account, setAccount] = useState<{ id: string | null; epoch: number; ready: boolean }>({ id: null, epoch: 0, ready: false })
  useEffect(() => {
    let active = true
    let revision = 0
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      revision++
      if (active) setAccount(previous => ({ id: session?.user.id ?? null, ready: true,
        epoch: previous.id === (session?.user.id ?? null) ? previous.epoch : previous.epoch + 1 }))
    })
    const start = revision
    void supabase.auth.getUser().then(({ data, error }) => {
      if (active && start === revision) setAccount({ id: error ? null : data.user?.id ?? null, epoch: 0, ready: true })
    }).catch(() => { if (active && start === revision) setAccount({ id: null, epoch: 0, ready: true }) })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [])
  if (!account.ready) return <p role="status">Checking your learning account…</p>
  if (!account.id) return <><p role="status">Sign in to save completed lessons. Guest progress lasts while Code Lab is open.</p><CodeLabHub key={`guest:${account.epoch}`} {...props} progressMode="session" /></>
  return <OwnedCodeLab key={`${account.id}:${account.epoch}`} {...props} owner={account.id} />
}

function OwnedCodeLab({ owner, ...props }: Props & { owner: string }) {
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [results, setResults] = useState<LessonCompletion[]>([])
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [message, setMessage] = useState('Restoring completed lessons…')
  const [saving, setSaving] = useState(false)
  const [pending, setPending] = useState<LessonCompletion | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [reload, setReload] = useState(0)
  const [playerEpoch, setPlayerEpoch] = useState(0)
  const live = useRef(false)
  const busy = useRef(false)
  const pendingRef = useRef<LessonCompletion | null>(null)
  const storageKey = `cliniverse:codelab:pending:${owner}`

  useEffect(() => {
    live.current = true
    let cancelled = false
    void (async () => {
      try {
        const nextCatalog = await makeCatalog()
        const rows = await repository.load(owner, Object.values(nextCatalog))
        if (cancelled) return
        setCatalog(nextCatalog)
        setResults(rows.filter(row => lessons.some(lesson => nextCatalog[lesson.id] === row.case_id && row.errors <= Math.floor(lesson.mcqs.length / 2))))
        setCompletedIds(lessons.filter(lesson => rows.some(row => row.case_id === nextCatalog[lesson.id] && row.errors <= Math.floor(lesson.mcqs.length / 2))).map(lesson => lesson.id))
        setLoadFailed(false)
        let restored: LessonCompletion | null = null
        try {
          const raw = sessionStorage.getItem(storageKey)
          if (raw) {
            const row = JSON.parse(raw) as LessonCompletion
            validateLessonCompletion(row)
            const lesson = lessons.find(item => nextCatalog[item.id] === row.case_id)
            if (row.user_id === owner && lesson && row.errors <= Math.floor(lesson.mcqs.length / 2)) restored = row
          }
        } catch { /* Storage may be unavailable. Account history remains authoritative. */ }
        pendingRef.current = restored
        setPending(restored)
        setMessage(restored ? 'A previous save needs confirmation. Retry saving before completing another lesson.' : 'Completed lessons restored from your account. Completion is not a clinical competency certification.')
      } catch {
        if (!cancelled) { setLoadFailed(true); setMessage('Account progress is unavailable. Retry loading to enable saving; you can still read lessons.') }
      }
    })()
    return () => { cancelled = true; live.current = false }
  }, [owner, storageKey, reload])

  async function persist(row: LessonCompletion): Promise<boolean> {
    if (busy.current) return false
    busy.current = true
    setSaving(true)
    setMessage('Saving to your account…')
    try {
      await repository.save(row)
      if (!live.current) return false
      const lesson = lessons.find(item => catalog?.[item.id] === row.case_id)
      if (lesson) setCompletedIds(ids => [...new Set([...ids, lesson.id])])
      setResults(rows => [row, ...rows.filter(previous => previous.case_id !== row.case_id)])
      pendingRef.current = null
      setPending(null)
      try { sessionStorage.removeItem(storageKey) } catch { /* Retry is idempotent even if cleanup fails. */ }
      setMessage('Saved to your account. You can return to this result later.')
      return true
    } catch {
      if (live.current) setMessage('Save could not be confirmed. Retry saving; the same completion will not be added twice. Keep this tab open until saved.')
      return false
    } finally {
      busy.current = false
      if (live.current) setSaving(false)
    }
  }

  async function complete(lessonId: string, errors: number) {
    const lesson = lessons.find(item => item.id === lessonId)
    if (!catalog || loadFailed || !lesson || !Number.isInteger(errors) || errors < 0 || errors > Math.floor(lesson.mcqs.length / 2)) return false
    if (busy.current) return false
    if (pendingRef.current) {
      setMessage('Retry the pending save above before completing another lesson.')
      return false
    }
    const row: LessonCompletion = { id: crypto.randomUUID(), user_id: owner, case_id: catalog[lessonId], errors, xp_earned: 0, completed_at: new Date().toISOString() }
    pendingRef.current = row
    setPending(row)
    try { sessionStorage.setItem(storageKey, JSON.stringify(row)) } catch { /* In-memory retry remains available. */ }
    return persist(row)
  }

  return <>
    <p role="status" aria-live="polite">{message}</p>
    {loadFailed && <button type="button" onClick={() => setReload(value => value + 1)}>Retry loading progress</button>}
    {pending && <button type="button" disabled={saving} onClick={() => { void persist(pending).then(saved => { if (saved && live.current) setPlayerEpoch(value => value + 1) }) }}>{saving ? 'Saving…' : 'Retry saving completion'}</button>}
    {results.length > 0 && <details><summary>Saved lesson results</summary><ul>{results.map(row => {
      const lesson = lessons.find(item => catalog?.[item.id] === row.case_id)
      return lesson ? <li key={row.id}>{lesson.title}: {lesson.mcqs.length - row.errors}/{lesson.mcqs.length} knowledge-check answers correct</li> : null
    })}</ul></details>}
    <CodeLabHub key={playerEpoch} {...props} progressMode="session" accountProgress={{ completedIds, complete, saving, ready: Boolean(catalog) && !loadFailed && !pending }} />
  </>
}
