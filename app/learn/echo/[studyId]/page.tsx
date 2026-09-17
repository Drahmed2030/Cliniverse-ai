import DeepLinkResolver from '../../../components/release/DeepLinkResolver'

export const metadata = { title: 'Echo study · Cliniverse AI' }

export default async function EchoStudyDeepLinkPage({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = await params
  return (
    <DeepLinkResolver
      kicker="Cliniverse AI · Learn · Echo"
      title="Echo study"
      id={studyId}
      destinationHref="/?view=learn"
      destinationLabel="Open Learn"
    />
  )
}
