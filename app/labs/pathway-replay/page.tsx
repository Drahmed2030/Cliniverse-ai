import type { Metadata } from 'next'
import { runPathwayReplay, STEMI_REPLAY_DEMO } from '../../lib/cardiology/pathwayReplayAgents'
import PathwayReplayExperience from './PathwayReplayExperience'

export const metadata: Metadata = {
  title: 'Clinical Pathway Replay · Cliniverse AI',
  description: 'A synthetic, governed clinical pathway replay prototype.',
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
