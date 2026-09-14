import { wardCaseConnections } from '../../lib/ward/caseConnections'

export default function WardCaseConnections({ context }: { context: 'ward' | 'atlas' }) {
  return <section aria-labelledby={`${context}-evidence-title`} style={{ marginBlock: 20, padding: 20, border: '1px solid var(--cv-border)', borderRadius: 24, background: 'var(--cv-surface)', color: 'var(--cv-text)', overflowWrap: 'anywhere', minWidth: 0 }}>
    <h2 id={`${context}-evidence-title`}>Make your handover clear.</h2>
    <p>Practise explaining what the fictional Ward record supports. These reflections do not save answers or change your handover.</p>
    {wardCaseConnections.map(item => <details key={item.id} style={{ border: '1px solid var(--cv-border)', borderRadius: 18, padding: '8px 16px', marginTop: 12 }}>
      <summary style={{ minHeight: 48, paddingBlock: 12, cursor: 'pointer', fontWeight: 700 }}>{item.title}</summary>
      <h3>{item.question}</h3>
      <p>{item.explanation}</p>
      <p><strong>Try this wording: </strong>{item.handover}</p>
      <a href={`/labs/case-batch-preview#${item.caseId}/0`} target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '8px 12px', color: 'var(--cv-teal)', maxWidth: '100%' }}>Study the related case · new tab</a>
      <p style={{ color: 'var(--cv-text-secondary)' }}>Separate learning case; not an examination from the Ward patient. Your original tab stays open. Save any Ward changes before leaving.</p>
    </details>)}
  </section>
}
