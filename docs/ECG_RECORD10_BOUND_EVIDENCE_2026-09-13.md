# Record 10 — scoped reviewed-PDF evidence binding

This additive registry snapshot connects retained clinical/privacy evidence, reconstructed-renderer comparison and the user's prior device report. It leaves the historical HOLD events intact. The default generic/adaptive path is unchanged.

## Authority and device evidence

The user previously explicitly instructed: “تم قم بهم وفك ال hold” (complete the requirements and lift HOLD), and now authorized binding the evidence. The promotion event records this existing project-owner release authority, not a new AI clinical attestation.

Retained conversation evidence: the user supplied screenshots of all four PDF pages, confirmed zoom and rotation worked, identified iPhone XS Max, then supplied iOS 18.7.10. This is user-reported external PDF viewer evidence. The viewer application/version was not supplied; no embedded Cliniverse run, physical caliper accuracy or print result is inferred. The user also confirmed iPad operation, but model/OS are unspecified and are not used for the exact target here.

Device and release events are repository bindings dated 2026-09-13 at normalized midnight, not reconstructed timestamps of messages or device execution. No new clinical or privacy approval is generated. The accepted educational question remains record10-rhythm-v1 with the separately frozen sinus-rhythm rubric.

## Identities and scope

The reviewed PDF SHA is 237865bfb5092573904802afabf10d4b51f2c21af85ef27a49d5c8a839962fc5. The rebuilt PDF SHA is ab67724a9591c7c839ead90323d506d3a5087a33de3317a2c13d9138976eb983. They are not interchangeable. The new snapshot targets only the retained PDF on the reported iPhone configuration, for screen-based educational rhythm interpretation.

The reconstruction comparison is bound by its SHA and contains the four page comparisons, renderer and input hashes. Canonical content identity is independently derived by canonical_identity.py from verified inputs: sorted-key compact UTF-8 JSON, frame-major signed integer microvolts, named lead order, sample rates and sample counts for both resolutions. Under the validated gain/baseline profile each ADC unit equals one microvolt. No floating-point rounding, filtering or terminal repair occurs. It is a local content identity, not an official publisher digest.

The snapshot factory returns independent objects. Its target is not accepted from an assessment request. Future callers must verify the reviewed file and match the actual supported rendering route before using this snapshot; it must never be selected for another platform by default. Serving generic browser users requires separately supported target coverage.

## Observed result and remaining integration

The existing eligibility evaluator returns LEARNER_ELIGIBLE, integrityValid=true and deviceBaselineBound=true with no blockers for this exact snapshot. Replacing output SHA, canonical SHA, platform or renderer version produces HOLD. Revoking authority or removing device evidence also produces HOLD. The generic case snapshot remains HOLD.

Local validation: 22 tests passed, zero failed or skipped; TypeScript and targeted ESLint passed. The receipt is saved beside this report. This change does not write Supabase, enable an assessment API or claim an actual account save. Live route selection and persistence remain the next integration stage.
