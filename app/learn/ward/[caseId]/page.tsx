import DeepLinkResolver from '../../../components/release/DeepLinkResolver'

export const metadata = { title: 'Ward case · Cliniverse AI' }

export default async function WardCaseDeepLinkPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params
  return (
    <DeepLinkResolver
      kicker="Cliniverse AI · Learn · Ward"
      title="Ward case"
      id={caseId}
      destinationHref="/?view=learn"
      destinationLabel="Open Learn"
    />
  )
}
