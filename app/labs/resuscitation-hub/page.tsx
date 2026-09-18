import type { Metadata } from 'next'
import ResuscitationHub from './ResuscitationHub'

export const metadata: Metadata = {
  title: 'Resuscitation Hub · Cliniverse AI',
  description: 'Learn, practice, simulate, replay and track resuscitation competency — governed BLS/ACLS curriculum, Code Lab drills, and a declarative-manifest simulation engine with Rapid Replay.',
}

export default function ResuscitationHubPage() {
  return <ResuscitationHub />
}
