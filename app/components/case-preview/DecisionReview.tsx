'use client'
import { useEffect, useRef, useState } from 'react'
import type { CasePreview } from '../../../content/medical/batch20'
import { decisionReviewDraft as draft, parseDecisionObservation, type DecisionObservation } from '../../../content/medical/decisionReview'
import styles from './casePreview.module.css'

export default function DecisionReview({ lesson }: { lesson: CasePreview }) {
  const [before, setBefore] = useState<DecisionObservation | null>(null)
  const [after, setAfter] = useState<DecisionObservation | null>(null)
  const [error, setError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const step = after ? 2 : before ? 1 : 0
  useEffect(() => { if (heading.current?.closest('details')?.open) heading.current.focus() }, [step])
  if (lesson.id !== draft.caseId) return null
  return <details className={styles.review}>
    <summary>Try a decision review · optional draft</summary>
    <p>New exercise awaiting medical review. Fictional text only; no additional imaging is supplied. Entries stay in this page, are cleared when you leave this case stage or refresh, and do not save completion or award points.</p>
    <h3 ref={heading} tabIndex={-1}>{['Your initial decision', 'Review the additional note', 'Compare your decisions'][step]}</h3>
    {before && <p><strong>Initial choice: </strong>{lesson.options[before.decision]} · Confidence: {before.confidence}%</p>}
    {step > 0 && <p>{draft.update}</p>}
    {!after ? <form key={step} onSubmit={event => {
      event.preventDefault()
      const observation = parseDecisionObservation(new FormData(event.currentTarget), lesson.options.length)
      if (!observation) { setError('Choose an option, enter confidence from 0 to 100, and explain your evidence (up to 600 characters).'); return }
      setError('')
      if (!before) setBefore(observation)
      else setAfter(observation)
    }}>
      {before && <p>{draft.prompt} Keeping or changing your decision both require a reason.</p>}
      <fieldset><legend>{lesson.question}</legend>
        {lesson.options.map((option, index) => <label className={styles.option} key={option}>
          <input required type="radio" name="decision" value={index} /><span>{option}</span>
        </label>)}
      </fieldset>
      <label htmlFor={`decision-confidence-${step}`}>Confidence in this decision (0–100%)</label>
      <input className={styles.practiceInput} id={`decision-confidence-${step}`} name="confidence" type="number" min={0} max={100} step={1} required inputMode="numeric" />
      <label htmlFor={`decision-evidence-${step}`}>{before ? 'Why keep or change your decision?' : 'Which evidence supports your decision, and what is missing?'}</label>
      <textarea className={styles.practiceInput} id={`decision-evidence-${step}`} name="evidence" rows={3} required maxLength={600} autoComplete="off" />
      {error && <p role="alert">{error}</p>}
      <button className={styles.primary} type="submit">{before ? 'Compare decisions' : 'Commit decision and reveal note'}</button>
    </form> : <>
      <p><strong>Revised choice: </strong>{lesson.options[after.decision]} · Confidence: {after.confidence}%</p>
      <p><strong>Your initial reasoning: </strong>{before?.evidence}</p>
      <p><strong>Your revised reasoning: </strong>{after.evidence}</p>
      <p><strong>Suggested answer from the existing case: </strong>{lesson.options[lesson.answer]}</p>
      <p>{lesson.explanation}</p>
      <p>The additional note repeats the observation; it does not supply the missing measurements. Compare the evidence behind each choice, not simply whether you changed your answer. These two confidence entries do not establish calibration or competence.</p>
      <label htmlFor="decision-reflection">{draft.reflection}</label>
      <textarea className={styles.practiceInput} id="decision-reflection" rows={3} maxLength={600} autoComplete="off" />
      <p>Optional reflection only. No automated assessment is made of your written reasoning.</p>
      <button type="button" onClick={() => { setBefore(null); setAfter(null); setError('') }}>Start a new review</button>
    </>}
  </details>
}
