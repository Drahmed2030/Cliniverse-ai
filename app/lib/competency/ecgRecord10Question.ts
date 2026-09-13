/** Public presentation of the explicitly accepted question, 13 September 2026. */
export const ECG_RECORD10_QUESTION = {
  id: 'record10-rhythm-v1', version: '1.0.0',
  prompt: 'What rhythm is shown?',
  skillId: 'sinus-rhythm-recognition',
  options: [
    { id: 'sinus', label: 'Sinus rhythm' },
    { id: 'af', label: 'Atrial fibrillation' },
    { id: 'flutter', label: 'Atrial flutter' },
    { id: 'undetermined', label: 'Unable to determine' },
  ],
} as const
