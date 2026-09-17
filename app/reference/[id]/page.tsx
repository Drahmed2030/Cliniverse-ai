import DeepLinkResolver from '../../components/release/DeepLinkResolver'

export const metadata = { title: 'Reference · Cliniverse AI' }

export default async function ReferencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DeepLinkResolver
      kicker="Cliniverse AI · Reference"
      title="Clinical reference"
      id={id}
      destinationHref="/?view=explore"
      destinationLabel="Open Explore"
    />
  )
}
