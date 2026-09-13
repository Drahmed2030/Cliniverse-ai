# Record 10 review workspace

Preview/development route: /labs/ecg-account-review. Production returns notFound.
AuthGate and the existing confirmed reviewer access check restrict the normal review flow to the same audience as Echo. The locally selected PDF is never uploaded and no patient data or PDF bytes are added to the repository.

The browser checks exact size (557798 bytes) and SHA-256 (237865bfb5092573904802afabf10d4b51f2c21af85ef27a49d5c8a839962fc5) before creating a PDF object URL. Replacing the file or leaving the review invalidates pending work and revokes the URL. The separate-viewer link handles browsers without embedded PDF support. This is the existing PDF output displayed through the browser PDF viewer, not a new waveform renderer.

Draft assessment: one single-choice rhythm-recognition question, proposed weight 1. The displayed reference is sinus rhythm, taken from the existing ECG Record 10 Human Clinical Attestation v1. The question, options and weighting remain a review draft; no approved rubric, score, learner promotion, or persisted assessment is created. The terminal 106 ms caveat remains visible.

Validation: actual recovered PDF accepted; a one-byte mutation rejected; truncated PDF rejected (three direct checks). Automated negative tests additionally reject wrong length and equal-length substituted bytes. TypeScript and targeted lint pass. Browser checks must be recorded separately after preview deployment.

Remaining: review the concrete draft question, close the exact renderer-evidence binding for the intended assessment output, install the approved rubric and authorized registry decision, then connect submitEcgAnswers with the authenticated endpoint and verify live persistence/retry/Progress/xAPI. This workspace unblocks inspection; it does not close those gates automatically.
