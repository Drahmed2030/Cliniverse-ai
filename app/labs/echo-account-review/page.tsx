import { notFound } from 'next/navigation'
import EchoAccountReview from './EchoAccountReview'

export default function EchoAccountReviewPage() {
  if (process.env.VERCEL_ENV !== 'preview' && process.env.NODE_ENV !== 'development') notFound()
  return <EchoAccountReview />
}
