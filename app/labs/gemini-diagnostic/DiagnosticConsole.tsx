'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  CircleGauge,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  RotateCw,
  ShieldCheck,
} from 'lucide-react'
import styles from './gemini-diagnostic.module.css'

type Readiness = {
  provider: string
  model: string
  configured: boolean
  enabled: boolean
  environmentAllowed: boolean
  dataMode: string
  providerStorage: string
  probe: string
}

type ProbeResult = {
  ok: boolean
  code: string
  provider: string
  model: string
  dataMode: string
  providerStorage: string
  latencyMs: number
  markerMatched: boolean
  providerStatus?: number
  diagnosticReason?: string
}

type TrustReceipt = {
  schemaVersion: number
  receiptId: string
  correlationId: string
  traceId: string
  completedAt: string
  provider: string
  model: string
  policyVersion: string
  templateVersion: string
  inputContractHash: string
  endpointContractHash: string
  dataClassification: string
  providerStorage: string
  humanReviewRequired: boolean
  resultCode: string
  latencyMs: number
  markerMatched: boolean
  providerStatus?: number
  diagnosticReason?: string
}

type ProbeResponse = { result: ProbeResult; receipt: TrustReceipt }
type Phase = 'checking' | 'idle' | 'running' | 'success' | 'error'

function isReadiness(value: unknown): value is Readiness {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Readiness>
  return typeof candidate.model === 'string'
    && typeof candidate.configured === 'boolean'
    && typeof candidate.enabled === 'boolean'
    && typeof candidate.environmentAllowed === 'boolean'
}

function isProbeResponse(value: unknown): value is ProbeResponse {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ProbeResponse>
  return Boolean(candidate.result && candidate.receipt && typeof candidate.receipt.receiptId === 'string')
}

function readableCode(code: string): string {
  return code.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

function shortHash(value: string): string {
  return `${value.slice(0, 12)}…${value.slice(-8)}`
}

async function requestReadiness(signal?: AbortSignal): Promise<Readiness> {
  const response = await fetch('/api/labs/gemini/health', { cache: 'no-store', signal })
  const payload: unknown = await response.json()
  if (!response.ok || !isReadiness(payload)) {
    throw new Error('The gateway readiness contract could not be verified.')
  }
  return payload
}

export default function DiagnosticConsole() {
  const tokenId = useId()
  const alertRef = useRef<HTMLDivElement>(null)
  const [readiness, setReadiness] = useState<Readiness | null>(null)
  const [token, setToken] = useState('')
  const [phase, setPhase] = useState<Phase>('checking')
  const [error, setError] = useState<string | null>(null)
  const [probe, setProbe] = useState<ProbeResponse | null>(null)

  async function refreshReadiness(signal?: AbortSignal) {
    setPhase('checking')
    setError(null)
    try {
      setReadiness(await requestReadiness(signal))
      setPhase('idle')
    } catch (reason) {
      if (reason instanceof Error && reason.name === 'AbortError') return
      setPhase('error')
      setError(reason instanceof Error ? reason.message : 'The readiness check failed.')
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void requestReadiness(controller.signal)
      .then(payload => {
        setReadiness(payload)
        setPhase('idle')
      })
      .catch(reason => {
        if (reason instanceof Error && reason.name === 'AbortError') return
        setPhase('error')
        setError(reason instanceof Error ? reason.message : 'The readiness check failed.')
      })
    return () => controller.abort()
  }, [])

  async function runProbe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const diagnosticToken = token.trim()
    if (!diagnosticToken) {
      setError('Enter the Preview diagnostic token to run the fixed probe.')
      setPhase('error')
      requestAnimationFrame(() => alertRef.current?.focus())
      return
    }

    setPhase('running')
    setError(null)
    setProbe(null)

    try {
      const response = await fetch('/api/labs/gemini/health', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${diagnosticToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ mode: 'fixed-synthetic-probe' }),
        cache: 'no-store',
      })
      setToken('')
      const payload: unknown = await response.json()

      if (isProbeResponse(payload)) {
        setProbe(payload)
        setPhase(payload.result.ok ? 'success' : 'error')
        if (!payload.result.ok) {
          setError(`Provider diagnostic: ${readableCode(payload.result.code)}${payload.result.providerStatus ? ` (Google HTTP ${payload.result.providerStatus})` : ''}.`)
        }
        return
      }

      if (!response.ok) {
        const code = payload && typeof payload === 'object' && 'code' in payload
          ? String((payload as { code: unknown }).code)
          : `http-${response.status}`
        throw new Error(`Probe stopped safely: ${readableCode(code)}.`)
      }
      throw new Error('The probe response did not match the governed receipt contract.')
    } catch (reason) {
      setToken('')
      setPhase('error')
      setError(reason instanceof Error ? reason.message : 'The probe stopped safely.')
      requestAnimationFrame(() => alertRef.current?.focus())
    }
  }

  const readyToRun = Boolean(readiness?.configured && readiness.enabled && readiness.environmentAllowed)

  return (
    <div className={styles.consoleGrid}>
      <section className={styles.controlPanel} aria-labelledby="control-title">
        <div className={styles.panelHeading}>
          <div>
            <p className={styles.eyebrow}>GATEWAY READINESS</p>
            <h2 id="control-title">Controlled verification</h2>
          </div>
          <button className={styles.iconButton} type="button" onClick={() => void refreshReadiness()} disabled={phase === 'checking' || phase === 'running'} aria-label="Refresh gateway readiness">
            <RotateCw aria-hidden="true" size={18} />
          </button>
        </div>

        <div className={styles.readinessGrid} aria-live="polite" aria-busy={phase === 'checking'}>
          <StatusItem label="Preview boundary" value={readiness?.environmentAllowed} checking={phase === 'checking'} />
          <StatusItem label="Server configuration" value={readiness?.configured} checking={phase === 'checking'} />
          <StatusItem label="Gateway enabled" value={readiness?.enabled} checking={phase === 'checking'} />
        </div>

        <div className={styles.contractCard}>
          <div><Activity aria-hidden="true" size={18} /><strong>Fixed probe contract</strong></div>
          <dl>
            <div><dt>Provider</dt><dd>{readiness?.provider ?? 'Checking'}</dd></div>
            <div><dt>Model</dt><dd>{readiness?.model ?? 'Checking'}</dd></div>
            <div><dt>Data mode</dt><dd>Synthetic, non-clinical</dd></div>
            <div><dt>Provider storage</dt><dd>{readiness?.providerStorage === 'disabled' ? 'Disabled (stateless)' : 'Checking'}</dd></div>
            <div><dt>Prompt input</dt><dd>Locked by policy</dd></div>
          </dl>
        </div>

        <form className={styles.form} onSubmit={runProbe} noValidate>
          <label htmlFor={tokenId}><KeyRound aria-hidden="true" size={17} />Preview diagnostic token</label>
          <input
            id={tokenId}
            type="password"
            value={token}
            onChange={event => setToken(event.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-describedby={`${tokenId}-help`}
            aria-invalid={Boolean(error && !token)}
            placeholder="Paste the secret value"
            disabled={phase === 'running'}
          />
          <p id={`${tokenId}-help`} className={styles.helper}>
            Held only in this tab’s memory and cleared immediately after the request.
          </p>

          {error && (
            <div className={styles.alert} role="alert" tabIndex={-1} ref={alertRef}>
              <CircleAlert aria-hidden="true" size={18} /><span>{error}</span>
            </div>
          )}

          <button className={styles.runButton} type="submit" disabled={!readyToRun || phase === 'running' || phase === 'checking'}>
            {phase === 'running' ? <LoaderCircle className={styles.spinner} aria-hidden="true" size={19} /> : <ShieldCheck aria-hidden="true" size={19} />}
            {phase === 'running' ? 'Verifying boundary…' : 'Run one synthetic probe'}
          </button>
        </form>
      </section>

      <section className={styles.receiptPanel} aria-labelledby="receipt-title" aria-live="polite">
        <div className={styles.panelHeading}>
          <div>
            <p className={styles.eyebrow}>TRUST RECEIPT</p>
            <h2 id="receipt-title">Machine-verifiable evidence</h2>
          </div>
          <ReceiptState phase={phase} hasReceipt={Boolean(probe)} />
        </div>

        {!probe ? (
          <div className={styles.emptyReceipt}>
            <LockKeyhole aria-hidden="true" size={32} />
            <h3>No probe has run in this session.</h3>
            <p>A successful or safely failed provider call will create a versioned receipt without storing the prompt, response, or secret.</p>
          </div>
        ) : (
          <div className={styles.receipt}>
            <div className={probe.result.ok ? styles.resultSuccess : styles.resultFailure}>
              {probe.result.ok ? <CheckCircle2 aria-hidden="true" size={24} /> : <CircleAlert aria-hidden="true" size={24} />}
              <span><small>RESULT</small><strong>{readableCode(probe.result.code)}</strong></span>
              <em>{probe.result.latencyMs} ms</em>
            </div>
            <dl className={styles.receiptFacts}>
              <ReceiptRow label="Receipt ID" value={probe.receipt.receiptId} />
              <ReceiptRow label="Completed" value={new Date(probe.receipt.completedAt).toLocaleString()} />
              <ReceiptRow label="Policy" value={probe.receipt.policyVersion} />
              <ReceiptRow label="Template" value={probe.receipt.templateVersion} />
              <ReceiptRow label="Classification" value={probe.receipt.dataClassification} />
              <ReceiptRow label="Provider storage" value={probe.receipt.providerStorage === 'disabled' ? 'Disabled (store=false)' : probe.receipt.providerStorage} />
              <ReceiptRow label="Human review" value={probe.receipt.humanReviewRequired ? 'Required' : 'Not recorded'} />
              {probe.receipt.diagnosticReason && <ReceiptRow label="Safe diagnostic" value={readableCode(probe.receipt.diagnosticReason)} />}
              <ReceiptRow label="Input contract" value={shortHash(probe.receipt.inputContractHash)} mono />
              <ReceiptRow label="Endpoint contract" value={shortHash(probe.receipt.endpointContractHash)} mono />
              <ReceiptRow label="Correlation" value={probe.receipt.correlationId} mono />
            </dl>
            <p className={styles.receiptFootnote}>Schema v{probe.receipt.schemaVersion} · Response content intentionally excluded</p>
          </div>
        )}
      </section>
    </div>
  )
}

function StatusItem({ label, value, checking }: { label: string; value?: boolean; checking: boolean }) {
  const state = checking || value == null ? 'Checking' : value ? 'Ready' : 'Blocked'
  return (
    <div className={styles.statusItem} data-state={state.toLowerCase()}>
      {checking || value == null
        ? <LoaderCircle className={styles.spinner} aria-hidden="true" size={18} />
        : value ? <CheckCircle2 aria-hidden="true" size={18} /> : <CircleAlert aria-hidden="true" size={18} />}
      <span><strong>{label}</strong><small>{state}</small></span>
    </div>
  )
}

function ReceiptState({ phase, hasReceipt }: { phase: Phase; hasReceipt: boolean }) {
  const label = phase === 'running' ? 'Creating' : hasReceipt ? 'Recorded' : 'Awaiting probe'
  return <span className={styles.receiptState}><CircleGauge aria-hidden="true" size={15} />{label}</span>
}

function ReceiptRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><dt>{label}</dt><dd className={mono ? styles.mono : undefined}>{value}</dd></div>
}
