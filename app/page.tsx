import ReleaseApp from './components/ReleaseApp'

export default function Page() {
  return <ReleaseApp reviewPreview={process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development'} />
}
