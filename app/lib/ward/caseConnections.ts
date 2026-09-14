/** Topic connections only. These are not matched examinations from the Ward patient. */
export const wardCaseConnections = [
  { id: 'ecg-source', caseId: 'anterior-stemi', title: 'ECG: report versus tracing',
    question: 'The Ward snapshot says evolving anterior changes. Have you personally reviewed a tracing?',
    explanation: 'The snapshot supplies an ECG summary, not the tracing. Attribute that description to the record. Do not document your own lead-by-lead interpretation without the examination.',
    handover: 'The supplied record describes evolving anterior ECG changes; the tracing is not included in this snapshot.' },
  { id: 'echo-evidence', caseId: 'echo-quality', title: 'Echo: state what is missing',
    question: 'Does the post-PCI label establish an ejection fraction or an Echo finding?',
    explanation: 'No Echo report, measurements or cine are supplied in this Ward snapshot. Keep ventricular function unconfirmed here rather than inventing a value or borrowing one from a learning example.',
    handover: 'Echo findings and an ejection fraction are not supplied in this snapshot.' },
  { id: 'separate-examples', caseId: 'a4c-orientation', title: 'Media: keep examples separate',
    question: 'Can a normal A4C teaching clip be added to this patient’s handover as their examination?',
    explanation: 'The A4C clip is a separate, source-labelled educational example. A topic link does not establish patient identity or a matched study. It cannot supply missing findings for the Ward record.',
    handover: 'The linked learning clip is a separate example and is not this fictional patient’s examination.' },
] as const
