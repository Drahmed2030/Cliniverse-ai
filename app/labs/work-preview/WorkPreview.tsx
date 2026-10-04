'use client'
import { useMemo, useState } from 'react'
import WorkReviewWorkspace from '../../components/work/WorkReviewWorkspace'
import { createSyntheticGateway } from '../../lib/work/syntheticGateway'
import type { Scenario } from '../../lib/work/syntheticGateway'
import styles from '../../components/work/workReview.module.css'
const scenarios: Scenario[] = ['happy', 'stale', 'revoked', 'timeout-after-commit', 'malformed', 'reassigned']
export default function WorkPreview() {
  const [scenario, setScenario] = useState<Scenario>('happy')
  const gateway = useMemo(() => createSyntheticGateway(Date.now, scenario), [scenario])
  return <main className={styles.preview}>
    <div className={styles.controls}><p>Synthetic preview · No patient data</p><label htmlFor="work-scenario">Scenario</label>
      <select id="work-scenario" value={scenario} onChange={event => { const value = event.target.value as Scenario; if (scenarios.includes(value)) setScenario(value) }}>{scenarios.map(value => <option key={value} value={value}>{value}</option>)}</select>
      <p>Changing the scenario resets this synthetic exercise.</p>
    </div>
    <WorkReviewWorkspace gateway={gateway} />
  </main>
}
