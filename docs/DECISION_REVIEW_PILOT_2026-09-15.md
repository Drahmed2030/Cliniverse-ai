# One-case decision review prototype

Base: `470b3783d8943e8dfd4c988781461d4b24657a12`, `qa/case-batch20-cloud`.

The existing AS case remains unchanged. Its existing objective, question, options and
explanation are passed to an optional component in Explore, not a replacement case player.
No additional imaging, measurements, referral case or treatment advice is introduced.

## Interaction

1. Select an existing answer; explicitly enter confidence in that decision (0–100),
   and write the supporting/missing evidence (1–600 characters after whitespace validation).
2. Reveal a newly authored fictional note repeating restricted opening but still supplying
   no Doppler or flow context. Commit a second decision, confidence and reason.
3. Compare both observations with the existing suggested answer and explanation; optionally
   write a question to ask in a future case. Restart clears observations and returns focus.

The repeated note tests whether learners distinguish repetition from additional evidence.
Keeping a decision is allowed. No score, cognitive-bias label, confidence calibration,
competency claim or AI assessment is generated. This interaction alone does not establish
learning or transfer. A separate transfer case and rubric remain pending.

## Review and privacy scope

The update, prompt, comparison guidance and reflection are NEW DRAFTS awaiting medical
review. They are not covered by the owner's frozen batch20 text confirmation. The interface
states this before the exercise. Original source-case bytes and media bindings are preserved.

Observations are memory-only, not account completion. Leaving Explore, switching cases or
refreshing clears the exercise. The component has no API, storage or save callback. It is
only mounted within the existing case preview route/access restrictions. Do not promote
this draft to production based on engineering tests.

## Verification

Local focused tests: 13 PASS / 0 FAIL / 0 SKIP, including validation of every option,
confidence endpoints, empty/fractional/out-of-range values and acceptance of unchanged
decisions. Full typecheck and targeted ESLint PASS. React/Next.js checks preserved client
boundaries and serializable case data; no new dependency is required.

Browser coverage added at 375 (dark), 768 and 1280 (light): incomplete forms cannot reveal
the note, commit/reveal/recommit/compare, focus, restart, case isolation, no outbound writes,
overflow and Axe. Cloud execution pending at commit time. No new media was activated,
no database migration was applied, and no production merge/deployment was performed.
