# A4C learning and remediation — review packet v1

Status: DRAFT — HUMAN CLINICAL REVIEW PENDING

Prepared: 2026-09-05. Language: English. Education-only, Preview-only.
This packet records existing lesson content for review; it is not clinical approval, certification, or a regulatory determination.

## Exact review target

Repository: Drahmed2030/Cliniverse-ai.
Branch: feat/echo-a4c-quality-gates-v1.
Base local commit: 3bd4d883ee03db9b73221d01b61321210b005ee3.
The remediation additions belong to the local change set containing this packet, not the base commit or the previously published Preview. Resolve the packet's containing commit with `git log -1 --format=%H -- docs/ECHO_A4C_CLINICAL_REVIEW_PACK_V1.md`; file hashes below identify the exact reviewed source snapshot.

| File | SHA-256 at packet preparation |
|---|---|
| app/components/clinical-media/EchoA4cLesson.tsx | b959a3bd5cfa8730264ade8b83adb1f021a5a33851b58cb3e0dad8758721365d |
| app/lib/codelab/echoA4cCasePack.ts | 7348c23abc7d42bba5d50248b03249ae57a930aa4fa894b176c2e0d9236d97e3 |
| app/lib/codelab/echoA4cTrainingActivity.ts | 053e8a51456bb7083c97c6d415b99649cd28366c29c048b1354748f100b69fed |
| app/lib/codelab/echoA4cRemediation.ts | 47a451c87400f50aa16809661b20212fcbbbd35d33ba8bb27f2656e433796e8f |

Any change to these files requires checking the packet for drift before signing off. Record the final commit at review time.

## Objective and limits

Recognize the A4C view signature and supporting landmarks in the supplied cine, while preserving the boundary between recognition and diagnosis. The learner audience and prerequisite knowledge still require reviewer confirmation.

No EF calculation, quantitative measurement, pathology exclusion, diagnosis, treatment, patient decisions, or certification is assessed. The source label “normal” is attribution, not an independent clinical finding by Cliniverse.

## Media and provenance

Review the actual [local cine](../public/clinical-media/echo/a4c-normal-cardionetworks-v1.mp4), not only a still or its filename.

- Source record: https://commons.wikimedia.org/wiki/File:A4C_normal_(CardioNetworks_ECHOpedia).webm
- Creator recorded in code: CardioNetworks / Vdbilt.
- License recorded in code: CC BY-SA 3.0; https://creativecommons.org/licenses/by-sa/3.0/deed.en
- Derivative SHA-256 recorded in code: 89e311b8a841a2a6813d4c5ba470aede46ba85780d42b2124330fc01846c783c.
- Recorded changes: date/time masking, VP8 WebM to H.264 MP4 conversion, removal of container metadata and audio tracks.
- Source/rights and privacy records were inherited from the existing asset manifest, not independently re-audited while preparing this packet.
- Existing status: source-rights-reviewed-clinical-copy-review-required.

## Current learner notes — review all wording

1. Both atria and ventricles appear in one apical plane with the atrioventricular valve planes and septa.
2. Track chamber and valve motion across the cine. Screen-side convention alone is not a reliable view identifier.
3. This 0.98-second source loop is not sufficient for EF, chamber measurements or exclusion of pathology.

Reviewer task: verify visible landmarks and suitability of the actual media; confirm or correct each statement. Add the clinical reference, edition/date and relevant section supporting the teaching wording. A media-license page is not sufficient evidence for clinical teaching claims.

## Current assessment and answer key

Key version: echo-a4c-answer-key-v1. “Keyed” below means configured in code, NOT clinically approved.

| Question | Options, with current key |
|---|---|
| Which view signature is demonstrated in the cine? | Apical four-chamber (A4C) **[keyed]**; Parasternal long-axis (PLAX); Subcostal IVC view |
| Which landmark set supports A4C recognition? | Four chambers, AV valve planes and septa **[keyed]**; Aortic arch only; Coronary arteries only |
| What is the safe conclusion from this short learning loop? | Use the source-labelled normal cine for view recognition only **[keyed]**; Calculate ejection fraction from this loop; Exclude all structural pathology |

Current corrective feedback:

- View identity: “Review Note 01: identify the complete apical four-chamber view signature.”
- Landmarks: “Review Note 01: both atria and ventricles, AV valve planes and septa support recognition. Review Note 02: screen-side convention alone is not a reliable identifier.”
- Scope: “Review Note 03: this short source loop supports view recognition only, not EF measurement or exclusion of pathology.”

The feedback is skill-level, not a separate explanation of every distractor. Reviewer must assess ambiguity, correctness and instructional usefulness of all distractors, and request any missing explanations. No newly generated clinical rationale is approved by this packet.

## Learning evidence and its limits

The local addition stores each submitted answer snapshot and score in component state, and shows missed-skill feedback. Restart clears the history. No patient data or AI provider calls are added.

The v2 completion receipt embeds submitted answer snapshots and displays their scores. The parser continues to accept v1 receipts. History must match the attempt count and terminate at the first passing attempt. Receipt IDs are deterministic consistency checks, NOT signatures or proof against deliberate fabrication. Same-case improvement is not evidence of transfer or clinical competence.

The review-plan addition suggests days 1/3/7 after completion when recorded mistakes exist, otherwise days 3/7/14. These are unvalidated product defaults, not evidence-based optimal intervals. Legacy receipts without history do not imply first-attempt success. UTC dates are frozen at completion; reminders, cross-session import and automatic adherence tracking are not implemented. Session state is cleared on restart or leaving. A user-initiated JSON download contains the receipt and plan; browser download behavior, including native iOS, remains to be verified.

New-case assessment: BLOCKED. No distinct reviewed second case is available in this packet. Activation requires a distinct licensed asset, suitable difficulty, the same narrow objective, a versioned answer key and explicit human review. Reordering answers is not a new-case test.

## Technical evidence and remaining checks

- Baseline before review-plan addition: 189/189 local tests and 20/20 CI browser tests passed (remote 0b10f794f7f49e573c09bd542916e7953f09a8db).
- Review-plan browser verification passed: 20/20 tests in CI run 33981827145, remote commit 2f3c31536756c7ea926e6a323fbf089a32dcb69c. Chromium viewport tests do not establish native iOS download behavior.
- Case-pack extraction: 194/194 local tests, TypeScript and targeted ESLint passed. Browser verification of this extraction remains pending; previous CI evidence applies to its baseline only.
- Test incorrect submission, targeted feedback, corrected submission, preserved first-attempt snapshot and restart clearing.
- Test keyboard navigation, screen-reader feedback, phone/iPad layout and reduced motion.
- Confirm the final receipt remains explicitly non-certifying and does not claim new-case transfer.
- No Push, Production, TestFlight or Cloudflare action is authorized by review completion alone.

## Case-data extraction record — 2026-09-06

The lesson now reads its title, objective, three teaching notes, questions and corrective feedback from `echoA4cCasePack.ts`. The pack references the existing licensed asset and training activity, preserving the answer key and receipt formats. Structural validation rejects missing or duplicate questions, invalid options and key coverage mismatches; it does not validate clinical correctness.

This is the first extraction, not a generic multi-case player. Assessment state, review scheduling, receipt generation and navigation remain A4C-specific. No second case is registered. Next: verify this refactor in Preview, then prepare a distinct licensed case with provenance and a human-reviewed key before enabling new-case assessment. Content remains English, education-only and Preview-only.

## Human review record — leave blank until actually reviewed

| Field | Value |
|---|---|
| Reviewer name | PENDING |
| Relevant ECHO experience / role | PENDING |
| Intended learner audience and prerequisites | PENDING |
| Author/self-review or independent review | PENDING |
| Review date | PENDING |
| Reviewed commit and file hashes | PENDING |
| Clinical references and exact supporting sections | PENDING |
| Media and landmarks decision | PENDING |
| Questions, distractors and feedback decision | PENDING |
| Corrections required | PENDING |
| Final decision: accept / revise / reject | PENDING |

Acceptance is limited to the named educational content version. Record actual reviewer feedback without inferring consent from a general instruction to continue development.
