import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../../lib/clinicalMedia/licensedEchoAsset'
import styles from './clinical-media.module.css'

// Caption under the cine in the learner layout. The expanded cine hides the composition's own footer, and CC BY-SA
// requires the credit to stay with the media, so the credit is written here from the asset's rights record. Every value
// comes from that record; nothing is invented and nothing is measured.
export default function EchoCineCaption() {
  const { cine, rights } = A4C_NORMAL_CLINICAL_STUDIO_ASSET
  return (
    <p className={styles.learnerCaption}>
      <span>{cine.view} · source-labelled {cine.sourceLabel} · {cine.width}×{cine.height} · {cine.framesPerSecond} fps</span>
      <span>
        {rights.creator} · {rights.licenseId}
        {' '}<a href={rights.sourcePageUrl} rel="noreferrer" target="_blank">Source</a>
      </span>
    </p>
  )
}
