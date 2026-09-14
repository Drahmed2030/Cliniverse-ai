import { wardCaseConnections } from '../../lib/ward/caseConnections'

export default function WardCaseConnections({ context }: { context: 'ward' | 'atlas' }) {
  return <section key={context} aria-labelledby={`${context}-evidence-title`} style={{ marginBlock: 20, padding: 20, border: '1px solid var(--cv-border)', borderRadius: 24, background: 'var(--cv-surface)', color: 'var(--cv-text)', overflowWrap: 'anywhere', minWidth: 0 }}>
    <h2 id={`${context}-evidence-title`}>Make your handover clear.</h2>
    <p>Decide what the fictional record supports, then compare your reasoning with an example. Your notes stay only in this page and are not saved to your account or handover.</p>
    {wardCaseConnections.map(item => <details key={item.id} style={{ border: '1px solid var(--cv-border)', borderRadius: 18, padding: '8px 16px', marginTop: 12 }}>
      <summary style={{ minHeight: 48, paddingBlock: 12, cursor: 'pointer', fontWeight: 700 }}>{item.title}</summary>
      <h3>{item.question}</h3>
      <label htmlFor={`${context}-${item.id}-reasoning`} style={{ display: 'block', fontWeight: 600, marginBlock: 8 }}>Your reasoning (optional)</label>
      <p id={`${context}-${item.id}-hint`}>What is supported, what is missing, and what would you check next? Use this fictional case only.</p>
      <textarea id={`${context}-${item.id}-reasoning`} aria-describedby={`${context}-${item.id}-hint`}
        rows={3} maxLength={600} autoComplete="off" spellCheck={false}
        style={{ display: 'block', width: '100%', boxSizing: 'border-box', minHeight: 96, resize: 'vertical', padding: 12, borderRadius: 12, border: '1px solid var(--cv-border)', background: 'var(--cv-surface)', color: 'var(--cv-text)', font: 'inherit' }} />
      <details style={{ marginBlock: 12 }}>
        <summary style={{ minHeight: 48, paddingBlock: 12, cursor: 'pointer', fontWeight: 700 }}>Compare with the example</summary>
        <p>{item.explanation}</p>
        <p><strong>Try this wording: </strong>{item.handover}</p>
        <p>Compare the example with your reasoning. You can revise your note above; no score is assigned.</p>
      </details>
      <a href={`/labs/case-batch-preview#${item.caseId}/0`} target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '8px 12px', color: 'var(--cv-teal)', maxWidth: '100%' }}>Study the related case · new tab</a>
      <p style={{ color: 'var(--cv-text-secondary)' }}>Separate learning case; not an examination from the Ward patient. Your original tab stays open. Save any Ward changes before leaving.</p>
    </details>)}
  </section>
}
