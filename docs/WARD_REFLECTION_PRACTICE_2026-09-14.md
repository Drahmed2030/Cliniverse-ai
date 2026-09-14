# Ward and Atlas: reason before revealing

## Problem and change

The three existing supplementary topics immediately exposed their explanations. Learners
could read the answer without first articulating what the fictional record supports.
The same topics now offer an optional, labelled reasoning field followed by a native
"Compare with the example" disclosure. The original explanations and suggested handover
wording are unchanged. Learners can revise their note after comparing it with the example.

This is an educational interaction hypothesis, not measured evidence of improved learning.
No new clinical scenario, treatment recommendation, diagnosis or medical approval is added.

## Boundaries

- Notes are limited to 600 characters and remain in the current page DOM only.
- No AI request, scoring, localStorage, database write or account progress update is added.
- Switching component context remounts the section so Ward notes do not become Atlas notes.
- Existing source links retain their separate-tab behavior and preview access boundaries.
- Persisted Ward content versions, account checkpoints and media bindings are untouched.
- Native labels, textareas and disclosure controls preserve keyboard operation without
  custom modal, focus trap or JavaScript state. Mobile textareas fit the containing width.

## Verification

Local: 30 Ward/Atlas tests PASS, 0 FAIL, 0 SKIP. Full `tsc --noEmit` PASS;
targeted ESLint PASS. The existing browser scenario now checks the initially hidden example,
note entry, retention after collapse/reopen, reveal, unrelated empty note, related-case
navigation and absence of network writes. Existing overflow/Axe checks remain.

Cloud browser result pending at commit time. Intended matrix: 375/768/1280, light/dark.
No production merge or deployment. No claim of a complete release or clinical media closure.

The previous local media-readiness package is included in this QA push so GitHub retains
the exact evidence needed for the next media task. The prior UI report's existing local
cloud-result appendix is preserved in the same push.
