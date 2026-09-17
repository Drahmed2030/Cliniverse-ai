import DeepLinkResolver from '../../../components/release/DeepLinkResolver'

export const metadata = { title: 'ECG case · Cliniverse AI' }

export default async function EcgCaseDeepLinkPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  return (
    <DeepLinkResolver
      kicker="Cliniverse AI · Learn · ECG"
      title="ECG case"
      id={caseId}
      destinationHref="/?view=learn"
      destinationLabel="Open Learn"
    />
  )
}
