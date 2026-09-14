'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../supabase'
import type { CasePreview } from '../../../content/medical/batch20'
import { caseCompletionKey, prepareCaseCompletion, validateCaseCompletion, createCaseCompletionRepository } from '../../lib/caseCompletion'
import type { LessonCompletion } from '../../lib/lessonCompletion'
import CaseBatchPreview from './CaseBatchPreview'

type Props = { cases: CasePreview[]; sources: Record<string, { title: string; url: string; scope: string }> }
type Repository = ReturnType<typeof createCaseCompletionRepository>

export default function AccountCaseBatchPreview(props: Props) {
  const [account, setAccount] = useState({ id: null as string | null, epoch: 0, ready: false })
  useEffect(() => {
    let active = true, revision = 0
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      revision++
      if (active) setAccount(previous => ({ id: session?.user.id ?? null, ready: true,
        epoch: previous.id === (session?.user.id ?? null) ? previous.epoch : previous.epoch + 1 }))
    })
    const start = revision
    const timer = setTimeout(() => {
      if (active && start === revision) { revision++; setAccount({ id: null, epoch: 0, ready: true }) }
    }, 15_000)
    void supabase.auth.getUser().then(({ data, error }) => {
      if (active && start === revision) setAccount({ id: error ? null : data.user?.id ?? null, epoch: 0, ready: true })
    }).catch(() => { if (active && start === revision) setAccount({ id: null, epoch: 0, ready: true }) }).finally(() => clearTimeout(timer))
    return () => { active = false; clearTimeout(timer); data.subscription.unsubscribe() }
  }, [])
  if (!account.ready) return <p role="status">Checking your learning account…</p>
  if (!account.id) return <><p role="status">Account saving unavailable. Sign in through the main app, then return here. You can read the cases without saving.</p><CaseBatchPreview key={`guest:${account.epoch}`} {...props} /></>
  return <OwnedCases key={`${account.id}:${account.epoch}`} {...props} owner={account.id} />
}

function OwnedCases({ owner, cases, sources }: Props & { owner: string }) {
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [message, setMessage] = useState('Restoring your case completions…')
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingCaseId, setSavingCaseId] = useState<string | undefined>()
  const [pending, setPending] = useState<LessonCompletion | null>(null)
  const [reload, setReload] = useState(0)
  const live = useRef(false), busy = useRef(false)
  const pendingRef = useRef<LessonCompletion | null>(null)
  const repo = useRef<Repository | null>(null)
  const catalog = useRef<Record<string, string>>({})
  const storageKey = `cliniverse:microcase:pending:${owner}`
  useEffect(() => {
    live.current = true
    let cancelled = false
    void (async () => {
      try {
        const keys = Object.fromEntries(await Promise.all(cases.map(async c => [c.id, await caseCompletionKey(c, sources)])))
        const repository = createCaseCompletionRepository(supabase, Object.values(keys))
        const rows = await repository.load(owner)
        if (cancelled) return
        catalog.current = keys; repo.current = repository
        setCompletedIds(cases.filter(c => rows.some(row => row.case_id === keys[c.id])).map(c => c.id))
        let restored: LessonCompletion | null = null
        try {
          const raw = sessionStorage.getItem(storageKey)
          if (raw) {
            const row = JSON.parse(raw) as LessonCompletion
            validateCaseCompletion(row, new Set(Object.values(keys)))
            if (row.user_id === owner) restored = row
          }
        } catch { /* No untrusted pending payload is submitted. */ }
        pendingRef.current = restored; setPending(restored)
        setFailed(false); setReady(true)
        setMessage(restored ? 'A previous save needs confirmation. Retry it before saving another case.' : 'Account completions restored. Review an explanation, then explicitly save.')
      } catch {
        if (!cancelled) { setFailed(true); setReady(false); setMessage('Progress could not be loaded. Retry loading; cases remain readable.') }
      }
    })()
    return () => { cancelled = true; live.current = false }
  }, [owner, cases, sources, storageKey, reload])

  async function persist(row: LessonCompletion): Promise<boolean> {
    try {
      await repo.current!.save(row)
      if (!live.current) return false
      const id = cases.find(c => catalog.current[c.id] === row.case_id)?.id
      if (id) setCompletedIds(ids => [...new Set([...ids, id])])
      pendingRef.current = null; setPending(null)
      try { sessionStorage.removeItem(storageKey) } catch { /* Same identity remains safe to retry. */ }
      setMessage('Saved to your account. This records text-exercise completion only.')
      return true
    } catch {
      if (live.current) setMessage('Save not confirmed. Keep this tab open and retry; the same completion will not be added twice.')
      return false
    } finally { busy.current = false; if (live.current) setSaving(false) }
  }
  async function complete(id: string, answer: number) {
    if (!live.current || !ready || busy.current || pendingRef.current || completedIds.includes(id)) return false
    const item = cases.find(c => c.id === id)
    if (!item) return false
    busy.current = true; setSavingCaseId(id); setSaving(true)
    try {
      const row = await prepareCaseCompletion(item, sources, { id: crypto.randomUUID(), owner, answer,
        explanationReviewed: true, completedAt: new Date().toISOString() })
      if (!live.current) { busy.current = false; return false }
      pendingRef.current = row; setPending(row)
      try { sessionStorage.setItem(storageKey, JSON.stringify(row)) } catch { /* In-memory retry remains available. */ }
      setMessage('Saving to your account…')
      return persist(row)
    } catch {
      busy.current = false
      if (live.current) { setSaving(false); setMessage('Completion could not be prepared. Review the question and try again.') }
      return false
    }
  }
  function retrySave() {
    if (!live.current || busy.current || !ready || !pendingRef.current) return
    busy.current = true; setSavingCaseId(pendingRef.current.case_id.split(':')[1]); setSaving(true); setMessage('Confirming the pending save…')
    void persist(pendingRef.current)
  }
  return <CaseBatchPreview cases={cases} sources={sources} accountProgress={{
    completedIds, message, saving, savingCaseId: saving ? savingCaseId : undefined, ready: ready && !pending,
    complete, retrySave: pending ? retrySave : undefined,
    retryLoad: failed ? () => { setFailed(false); setMessage('Retrying progress loading…'); setReload(n => n + 1) } : undefined,
  }} />
}
