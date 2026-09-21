import EcgLearnerWorkspace from './EcgLearnerWorkspace'
import { evaluateEcgLearnerAvailability } from '../../lib/competency/ecgLearnerAvailability'

export const metadata = { title: 'ECG · Cliniverse AI' }
// The learner decision is evaluated on the server for every request; it is never cached or decided in the browser.
export const dynamic = 'force-dynamic'

export default function EcgLearnerPage() {
  return <EcgLearnerWorkspace availability={evaluateEcgLearnerAvailability()} />
}
