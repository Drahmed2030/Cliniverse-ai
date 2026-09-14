import ReleaseApp from './components/ReleaseApp'

export default function Page() {
  return <ReleaseApp reviewPreview={process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development'}
    caseLibraryPreview={process.env.NODE_ENV === 'development' || (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF === 'qa/case-batch20-cloud')} />
}
