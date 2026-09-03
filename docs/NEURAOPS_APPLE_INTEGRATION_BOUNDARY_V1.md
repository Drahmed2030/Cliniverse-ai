# NeuraOps × Cliniverse AI — Apple Integration Boundary v1

## Product relationship

- **NeuraOps** is the company operating layer and governed intelligence architecture.
- **Cliniverse AI** is the customer-facing healthcare product distributed on Apple platforms.
- **Clinical Pathway Replay** is the first experience spark.
- **Medical Operations Registry** is the first trust spark.
- **Clinical Studio** compiles one reviewed content contract into an interactive lesson, deterministic ECG visual, bilingual media, assessment, and replay linkage.

NeuraOps therefore appears in Cliniverse as provenance, governance, orchestration, and enterprise operations—not as an App Store Connect platform record.

## Release lanes

| Lane | Current purpose | Allowed now | Explicitly blocked |
| --- | --- | --- | --- |
| Apple `1.0 (62)` | Resolve the active review | Standard EULA link, reply, same-build resubmission | New features, new IPA, Gemini, Add Platform |
| Strategy Preview | Validate the two sparks | Synthetic scenarios, Remotion media, deterministic ECG, stateless Gemini connectivity | Real patient data, clinical claims, Production provider calls |
| Later native release | Productize validated work | Only features that pass clinical, privacy, security, accessibility, localization and device gates | Shipping prototype claims or unreviewed AI output |

## Future reviewer description gate

The following product description is reserved for a later submitted binary and must not be used for build 62:

> NeuraOps is Cliniverse AI's governed operating layer. It connects versioned medical learning content, deterministic simulation media, pathway replay, and auditable AI-assisted preparation through explicit data-classification and human-review controls. It does not autonomously diagnose, prescribe, activate emergency pathways, or replace local clinical policy.

Before that statement is used in App Review metadata, the reviewer must be able to reproduce the exact flow in the submitted binary against the submitted production backend.

## Gemini gate

The Gemini adapter remains Preview-only and accepts one fixed synthetic, non-clinical probe. It:

- runs server-side;
- never exposes the API key to the client;
- rejects real-patient mode;
- sets `store=false` on every Interactions API request;
- discards provider response bodies from logs and client responses; and
- creates a versioned NeuraOps Trust Receipt.

Moving Gemini to Production requires a valid scoped key, cost controls, formal data classification, provider terms/privacy review for each launch region, evaluation evidence, a human-review workflow, and a separate Apple disclosure decision.

