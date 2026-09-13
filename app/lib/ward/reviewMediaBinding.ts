import type { ReviewRequestId } from './reviewWorklist'
// These examples are NOT the examinations of the synthetic referrals.
export const reviewMediaBindings = {
  'SIM-ECG-001': {
    href: '/labs/ecg-account-review', title: 'PTB-XL · Record 10',
    source: 'Reviewed PTB-XL record 10 PDF',
    instruction: 'Select cliniverse-record10-regenerated-review.pdf in the existing viewer. Its size and SHA-256 are checked before display; the file stays on your device.',
    availability: 'Local reviewed PDF required',
  },
  'SIM-ECHO-001': {
    href: '/labs/echo-account-review', title: 'Echo · Normal A4C example',
    source: 'CardioNetworks / ECHOpedia · source-labelled normal A4C',
    instruction: 'Open the existing A4C cine player. Source and license information are displayed with the media.',
    availability: 'Existing governed cine viewer',
  },
} as const satisfies Record<ReviewRequestId, { href: string; title: string; source: string; instruction: string; availability: string }>
