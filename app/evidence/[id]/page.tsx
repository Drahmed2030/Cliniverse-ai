import DeepLinkResolver from '../../components/release/DeepLinkResolver'

export const metadata = { title: 'Evidence · Cliniverse AI' }

export default async function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DeepLinkResolver
      kicker="Cliniverse AI · Evidence"
      title="Evidence article"
      id={id}
      destinationHref="/?view=explore"
      destinationLabel="Open Explore"
    />
  )
}
