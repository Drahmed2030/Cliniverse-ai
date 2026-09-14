'use client'
import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CasePreview } from '../../../content/medical/batch20'
import { mediaForCase, mediaGap, caseMediaLinks } from '../../../content/medical/caseMedia'
import styles from './casePreview.module.css'

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback)
  window.addEventListener('hashchange', callback)
  return () => { window.removeEventListener('popstate', callback); window.removeEventListener('hashchange', callback) }
}
const snapshot = () => window.location.hash
const serverSnapshot = () => ''
function navigate(hash: string) {
  window.history.pushState(null, '', `${window.location.pathname}${hash}`)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export default function CaseBatchPreview({ cases, sources }: {
  cases: CasePreview[]
  sources: Record<string, { title: string; url: string; scope: string }>
}) {
  const hash = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const [filter, setFilter] = useState('All')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const heading = useRef<HTMLHeadingElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const help = useRef<HTMLButtonElement>(null)
  const lastOpened = useRef<string | null>(null)
  const parts = hash.replace(/^#/, '').split('/')
  const active = cases.find(item => item.id === parts[0])
  const media = active ? mediaForCase(active.id) : undefined
  const requestedStep = Number(parts[1] || 0)
  const step = active && requestedStep === 2 && submitted[active.id] ? 2 : requestedStep >= 1 ? 1 : 0
  const visible = cases.filter(item => filter === 'All' || item.track === filter)

  useEffect(() => {
    dialog.current?.close()
    if (!hash && lastOpened.current) {
      document.getElementById(`open-${lastOpened.current}`)?.focus()
    } else if (hash) {
      heading.current?.focus()
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [hash])

  function closeHelp() { dialog.current?.close(); help.current?.focus() }
  function go(next: number) { if (active) navigate(`#${active.id}/${next}`) }

  return <main className={styles.root}>
    <div className={styles.container}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">Cliniverse <span>Learning studio</span></Link>
        <button ref={help} type="button" onClick={() => dialog.current?.showModal()}>How this works</button>
      </header>
      <aside className={styles.notice} aria-label="Editorial status">Editorial preview · Medical review of {cases.filter(item => item.clinicalReview === 'user-confirmed').length} text cases confirmed by the project owner. {caseMediaLinks.length} supplementary media link available; remaining cases await matched media. Session answers are not saved to your account.</aside>
      {!active ? <>
        <p className={styles.eyebrow}>ECG / ECHO / CLINICAL REASONING</p>
        <h1 ref={heading} tabIndex={-1}>One case. A clearer way to think.</h1>
        <p className={styles.intro}>Explore the case, make a choice, then unpack the reasoning. Each draft connects a clinical skill with an explanation and a patient conversation.</p>
        <div className={styles.filters} role="group" aria-label="Filter cases">
          {['All','ECG','Echo','Integrated'].map(name => <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>{name}</button>)}
        </div>
        <p role="status">{visible.length} of {cases.length} drafts shown</p>
        <div className={styles.grid}>
          {visible.map(item => <article key={item.id} className={styles.card}>
            <p className={styles.eyebrow}>{item.track} · DRAFT</p>
            <h2>{item.title}</h2><p>{item.objective}</p>
            <button id={`open-${item.id}`} type="button" className={styles.primary} onClick={() => { lastOpened.current = item.id; navigate(`#${item.id}/0`) }}>Explore draft<span className={styles.srOnly}>: {item.title}</span></button>
          </article>)}
        </div>
      </> : <article className={styles.lesson}>
        <button type="button" onClick={() => step === 0 ? navigate('') : go(step - 1)}>{step === 0 ? '← Back to cases' : '← Previous step'}</button>
        <p className={styles.eyebrow}>{active.track} · EDITORIAL DRAFT</p>
        <h1 ref={heading} tabIndex={-1}>{active.title}</h1>
        <ol className={styles.steps} aria-label="Case stages">
          {['Explore','Decide','Explain'].map((label,index) => <li key={label} aria-current={step === index ? 'step' : undefined}>{index + 1}. {label}</li>)}
        </ol>
        <section className={styles.panel} aria-labelledby="lesson-section">
          {step === 0 ? <>
            <h2 id="lesson-section">The case</h2><p>{active.scenario}</p>
            <h3>Your learning goal</h3><p>{active.objective}</p>
            <p className={styles.secondary}>Written scenario only. No clinical image or tracing is represented by this text.</p>
            <aside aria-label="Case media" className={styles.media}>
              <h3>Related media</h3>
              {media ? <>
                <p>{media.purpose}</p>
                <p id="media-prerequisite">{media.prerequisite}</p>
                <a href={media.href} target="_blank" rel="noopener noreferrer" aria-describedby="media-prerequisite">{media.title} · new tab</a>
                <p>{media.creator} · <a href={media.licenseUrl} target="_blank" rel="noopener noreferrer">{media.licenseId} · new tab</a> · <a href={media.sourceUrl} target="_blank" rel="noopener noreferrer">Original source · new tab</a></p>
              </> : <p>{mediaGap(active.id)}</p>}
            </aside>
            <button type="button" className={styles.primary} onClick={() => go(1)}>Continue to question</button>
          </> : step === 1 ? <>
            <h2 id="lesson-section">Make your choice</h2>
            <details><summary>Revisit the scenario</summary><p>{active.scenario}</p></details>
            <fieldset><legend>{active.question}</legend>
              {active.options.map((option,index) => <label key={option} className={styles.option}>
                <input type="radio" name={active.id} value={index} checked={answers[active.id] === index} onChange={() => { setAnswers(current => ({ ...current, [active.id]: index })); setSubmitted(current => ({ ...current, [active.id]: false })) }} />
                <span>{option}</span>
              </label>)}
            </fieldset>
            <p className={styles.secondary}>Choose one option to reveal the draft explanation.</p>
            <button type="button" className={styles.primary} disabled={answers[active.id] === undefined} onClick={() => { setSubmitted(current => ({ ...current, [active.id]: true })); go(2) }}>Review explanation</button>
          </> : <>
            <h2 id="lesson-section">Understand the reasoning</h2>
            <p><strong>Your choice: </strong>{active.options[answers[active.id]]}</p>
            <p><strong>Draft answer: </strong>{active.options[active.answer]}</p>
            <p>{active.explanation}</p>
            <h3>Explain it to the patient</h3><p>{active.communication}</p>
            <h3>Sources for editorial review</h3>
            <p className={styles.secondary}>The project owner confirmed medical review of this text. The source audit scope is recorded below; media review and release readiness are tracked separately.</p>
            <ul className={styles.sources}>{active.sourceIds.map(id => <li key={id}><a href={sources[id].url} target="_blank" rel="noopener noreferrer">{sources[id].title} · opens new tab</a><p>{sources[id].scope}</p></li>)}</ul>
            <div className={styles.actions}><button type="button" onClick={() => go(1)}>Revisit question</button><button type="button" className={styles.primary} onClick={() => navigate('')}>Back to cases</button></div>
          </>}
        </section>
      </article>}
      <footer className={styles.footer}>Cliniverse · Educational design preview · No clinical service or competency certification</footer>
    </div>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="help-title" onCancel={event => { event.preventDefault(); closeHelp() }}>
      <button type="button" onClick={closeHelp}>Close explanation</button>
      <h2 id="help-title">A focused case journey</h2>
      <ol><li>Explore the scenario and its learning goal.</li><li>Choose an answer. You can revisit the scenario without leaving the question.</li><li>Read the draft reasoning and open the source separately.</li></ol>
      <p>Previous step and browser Back preserve your answers during this session. Returning to the list keeps your filter. Refreshing clears answers.</p>
      <p>Medical review of the text was confirmed by the project owner. Available media links reuse existing viewers and preserve their access checks. Most cases still need matching media. This preview does not record account progress or replace Ward, Code Lab, BLS or ACLS.</p>
    </dialog>
  </main>
}
