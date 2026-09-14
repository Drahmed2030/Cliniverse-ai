import { notFound } from 'next/navigation'
import Link from 'next/link'
import EchoAccountReview from './EchoAccountReview'

export default async function EchoAccountReviewPage({ searchParams }: {
  searchParams: Promise<{ from?: string | string[] }>
}) {
  if (process.env.VERCEL_ENV !== 'preview' && process.env.NODE_ENV !== 'development') notFound()
  const { from } = await searchParams
  const casePreviewAvailable = process.env.NODE_ENV === 'development' ||
    (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF === 'qa/case-batch20-cloud')
  // Accept a known case identity, never a caller-supplied return URL.
  return <>
    {casePreviewAvailable && from === 'a4c-orientation' ? <nav aria-label="Case return" style={{ padding: '16px 24px' }}>
      <Link href="/labs/case-batch-preview#a4c-orientation/0" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '8px 12px' }}>Return to A4C orientation case</Link>
    </nav> : null}
    <EchoAccountReview />
  </>
}
