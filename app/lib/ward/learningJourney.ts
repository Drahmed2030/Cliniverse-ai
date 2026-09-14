/** Navigation guidance only: no scoring, entitlement or clinical-case binding. */
export const learningJourney = [
  {
    id: 'ecg',
    title: 'ECG · Rhythm recognition',
    href: '/labs/ecg-account-review',
    objective: 'Practise a structured reading of the tracing before answering the rhythm question.',
    prerequisite: 'Have the reviewed Record 10 PDF ready. The existing viewer checks the file before displaying it.',
    steps: [
      'Inspect the reviewed 12-lead tracing.',
      'Choose your answer, then review the explanation.',
      'Save only when the existing review and account checks allow it; wait for confirmation.',
    ],
  },
  {
    id: 'echo',
    title: 'Echo · A4C recognition',
    href: '/labs/echo-account-review',
    objective: 'Practise recognising the apical four-chamber view and its anatomical landmarks.',
    prerequisite: 'Uses the existing source-labelled A4C cine. Review-account access is required.',
    steps: [
      'Inspect the cine using the existing playback controls.',
      'Answer the view-recognition and landmark questions.',
      'Save the assessment attempts and wait for account confirmation.',
    ],
  },
] as const
