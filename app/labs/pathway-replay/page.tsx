import type { Metadata } from 'next'
import { runPathwayReplay, STEMI_REPLAY_DEMO } from '../../lib/cardiology/pathwayReplayAgents.ts'
import PathwayReplayExperience from './PathwayReplayExperience'

export const metadata: Metadata = {
  title: 'Pathway Replay Intelligence · Cliniverse AI',
  description: 'A synthetic, governed clinical pathway replay with a tamper-evident event/receipt trail.',
}

const report = runPathwayReplay(STEMI_REPLAY_DEMO)

export default function PathwayReplayPage() {
  return (
    <PathwayReplayExperience
      report={report}
      labels={{
        back: 'Back to Cliniverse',
        humanReview: 'Human review required',
        disclaimer: 'Training workspace · Licensed ECHO preview and synthetic pathway/ECG · No patient decisions',
      }}
    />
  )
}
