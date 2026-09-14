import { notFound } from 'next/navigation'
import CaseBatchPreview from '../../components/case-preview/CaseBatchPreview'
import AccountCaseBatchPreview from '../../components/case-preview/AccountCaseBatchPreview'
import { batch20, sourceRegistry } from '../../../content/medical/batch20'

export const metadata = { title: 'Cliniverse · Editorial case preview', robots: { index: false, follow: false } }

export default function CaseBatchPreviewPage() {
  // Approved protected QA branch only; never enable on a production deployment.
  // Deployment protection must remain enabled. Do not promote this QA artifact.
  const cloudAccountQA = process.env.VERCEL_ENV === 'preview' &&
    process.env.VERCEL_GIT_COMMIT_REF === 'qa/case-batch20-cloud'
  if (process.env.NODE_ENV !== 'development' && !cloudAccountQA) notFound()
  if (cloudAccountQA || process.env.CASE_ACCOUNT_PREVIEW_ENABLED === 'true') return <AccountCaseBatchPreview cases={batch20} sources={sourceRegistry} />
  return <CaseBatchPreview cases={batch20} sources={sourceRegistry} />
}
