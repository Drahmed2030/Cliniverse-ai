import { notFound } from 'next/navigation'
import CaseBatchPreview from '../../components/case-preview/CaseBatchPreview'
import { batch20, sourceRegistry } from '../../../content/medical/batch20'

export const metadata = { title: 'Cliniverse · Editorial case preview', robots: { index: false, follow: false } }

export default function CaseBatchPreviewPage() {
  // Local editorial preview only. Production and hosted previews use NODE_ENV=production.
  if (process.env.NODE_ENV !== 'development') notFound()
  return <CaseBatchPreview cases={batch20} sources={sourceRegistry} />
}
