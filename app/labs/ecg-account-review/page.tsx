import { notFound } from 'next/navigation'
import EcgAccountReview from './EcgAccountReview'

export default function EcgAccountReviewPage() {
  if (process.env.VERCEL_ENV !== 'preview' && process.env.NODE_ENV !== 'development') notFound()
  return <EcgAccountReview />
}
