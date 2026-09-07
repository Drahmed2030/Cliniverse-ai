# Echo Batch 01 — Human Clinical & Privacy Review Packet

Status: **pending human review**. This packet is an operational review artifact only. It does not authorize learner release, binary inclusion, diagnosis, certification, deployment, or Supabase changes.

## Purpose

Review the six intact Batch 01 pathology derivatives against the existing SHA-bound human-review contract. Every decision must apply to the exact derivative checksum listed below. If the artifact checksum differs, stop review and mark the case HOLD.

## Reviewer requirements

Clinical review must record reviewer name, qualifications, date, environment, and PASS/HOLD/REJECT decisions for: view confirmation, suitability of the source label as teaching context, teaching-focus support, motion sufficiency, anatomy/overlay acceptability, and acceptance of prohibited-claim boundaries.

Privacy/provenance review must record reviewer name, role, date, and PASS/HOLD/REJECT decisions for: no direct identifiers, no disallowed date/time, acceptance of residual annotations, provenance, and attribution plan.

A HOLD or REJECT fails closed. Empty reviewer identity/role/date/qualifications are invalid. Clinical and privacy review may be performed by different qualified reviewers. No automated system may self-attest either review.

## Review set

| Candidate | Exact derivative SHA256 | Teaching focus |
|---|---|---|
| echo-a4c-pericardial-effusion-e00674 | `ac4ae1abd4ba3a14f050a5e2222af0a8a46f910669934892eac2b6e1f89e7d1a` | Qualitative pericardial-space pattern recognition |
| echo-a4c-severe-hcm-mm0002 | `39f7d2930a1383c688723871887c02e75ddd932819a01b176bbc6e03cb6cf913` | Source-supported hypertrophic pattern recognition |
| echo-a4c-severe-ms-e00613 | `c9db61d29ae454e9967023aa0b2ce3e218b333b4b199f6394b8665199616f274` | Source-supported mitral stenosis pattern recognition |
| echo-a3c-severe-ar-e00234 | `13f3d791637cdc7e8704fd36fc98269b458afc0d472f03ca1349540b09ca91cc` | Source-supported aortic regurgitation pattern recognition |
| echo-psax-severe-as-e00261 | `1f2e57f80802dc0f13c1c8732d8b48f05b228e39cdcd408a91956a76877fb715` | Source-supported stenotic aortic valve pattern recognition |
| echo-a4c-arvd-e00299 | `2e83143bd1e969b4b53349687cc2371cc9896c54e7c2c475659c7bb1b767c97b` | Source-supported RV/cardiomyopathy pattern recognition |

## Clinical review form — repeat per candidate

- Candidate ID:
- Artifact SHA256 verified:
- Reviewer name:
- Reviewer qualifications:
- Review date:
- Review environment:
- View confirmed: PASS / HOLD / REJECT
- Source label suitable as teaching context: PASS / HOLD / REJECT
- Teaching focus supported: PASS / HOLD / REJECT
- Motion sufficient for teaching: PASS / HOLD / REJECT
- Anatomy and overlays acceptable: PASS / HOLD / REJECT
- Prohibited-claim boundaries accepted: PASS / HOLD / REJECT
- Notes:

## Privacy / provenance review form — repeat per candidate

- Candidate ID:
- Artifact SHA256 verified:
- Reviewer name:
- Reviewer role:
- Review date:
- No direct identifiers: PASS / HOLD / REJECT
- No disallowed acquisition date/time: PASS / HOLD / REJECT
- Residual annotations accepted: PASS / HOLD / REJECT
- Provenance accepted: PASS / HOLD / REJECT
- Attribution plan accepted: PASS / HOLD / REJECT
- Notes:

## Candidate-specific review reminders

**Pericardial effusion:** teaching is qualitative pericardial-space pattern recognition only. Do not infer tamponade, quantify size, infer hemodynamic compromise, or recommend treatment.

**Severe HCM:** teaching is source-supported hypertrophic pattern recognition only. Do not perform wall-thickness measurement, infer LVOT obstruction, genotype, prognosis, treatment, or independent diagnosis.

**Severe MS:** teaching is source-supported mitral stenosis pattern recognition only. Do not calculate valve area or gradients, infer hemodynamic severity from the cine, or recommend treatment.

**Severe AR:** teaching is source-supported aortic regurgitation pattern recognition only. Do not quantify vena contracta, pressure half-time, regurgitant volume, hemodynamic severity, or treatment.

**Severe AS:** teaching is source-supported stenotic aortic-valve pattern recognition only. Do not calculate valve area, gradients, velocity, or intervention need.

**ARVD/ARVC-labelled source:** teaching is source-supported RV/cardiomyopathy pattern recognition only. Do not establish an independent ARVC diagnosis, genetic inference, risk, prognosis, or treatment.

All six cases prohibit unsupported measurements, numerical EF, exclusion of alternative pathology, independent diagnosis from a single clip, and learner discrimination before specialist approval.

## Release boundary

Even when both human reviews clear a candidate, the current contract keeps:

- `binaryCommitEligible = false`
- `learnerReady = false`
- device playback pending
- post-review quality gate pending

This packet therefore closes only the human-review layer. It does not bypass the Echo Media Standard 2026, Clinical Review Contract, device matrix, Studio capability gates, or later release governance.

## Excluded holds

`echo-a4c-flail-mv-e00466` is not part of this six-case packet because specialist visibility review is required before transformation.

`echo-plax-vsd-rtl-e00832` is not part of this six-case packet because the current local derivative failed checksum/decode integrity and remains HOLD pending a separate controlled recovery pass.
