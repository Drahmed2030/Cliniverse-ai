import { notFound } from 'next/navigation'
import WorkPreview from './WorkPreview'

export const metadata = { title: 'Cliniverse Work — Synthetic preview', robots: { index: false, follow: false } }
export default function WorkPreviewPage() {
  // Development-only. Production builds, including hosted preview builds, return 404.
  if (process.env.NODE_ENV !== 'development') notFound()
  return <WorkPreview />
}
