# Cliniverse AI — Next Release Execution Roadmap v1

Status: active engineering plan on the isolated strategy branch

Apple release: version `1.0 (62)` remains separate and under review

Branch: `strategy/clinical-pathway-replay-v1`

## Operating rule

The next release is built as one measurable product journey, not a catalogue of disconnected tools:

`Replay → explain the gap → practise the gap → reassess → compile a human-owned closure brief`

No step in this roadmap authorizes a merge, Production promotion, database change, paid service, TestFlight build, IPA creation, or App Store submission.

## Stage 1 — Release isolation

**Objective:** protect the active Apple submission while future work continues.

**Exit evidence:**

- Apple `1.0 (62)` is absent from the strategy branch changes.
- the submitted release shell does not link to Pathway Replay;
- no Production or database dependency is introduced; and
- all demonstration data is explicitly fictional.

**State:** implemented; continuously tested.

## Stage 2 — Deterministic session contract

**Objective:** give the experience one validated state machine rather than independent screen state.

**Exit evidence:**

- later stages remain locked until prerequisite work passes;
- incorrect ECG attempts can retry without granting progress;
- only the configured synthetic answer key unlocks reassessment;
- malformed or mismatched stored state fails closed; and
- no model, network, or database call is required.

**State:** implemented; deterministic tests and production build passed.

## Stage 3 — Complete mobile journey

**Objective:** make progress, current position, locked steps and back navigation obvious on phone and tablet.

**Exit evidence:**

- four-step progress is visible on every screen;
- every enabled control has at least a 44-point interaction target;
- no KPI is hidden on mobile;
- the session can resume within the same browser tab; and
- the experience remains usable when browser storage is unavailable.

**State:** implemented; strategy Preview visual and accessibility verification pending.

## Stage 4 — Human-owned closure brief

**Objective:** produce the first coherent NeuraOps trust artifact from the completed loop.

**Exit evidence:**

- the brief includes case, pathway, rule, evidence, owner, training attempts and reassessment;
- unresolved evidence remains visible;
- the interface states that closure was not granted; and
- export, signature, clinical validation and external transmission remain disabled.

**State:** implemented; deterministic contract verified, strategy Preview browser gate pending.

## Stage 5 — Medical Operations Registry

**Objective:** make the second spark functional by linking every rule and lesson to a governed source record.

**Exit evidence:**

- each record has publisher, URL, version, jurisdiction, intended use and review status;
- a source can be superseded or expired without silently changing an earlier replay;
- licensing and attribution status are explicit; and
- no source becomes an executable clinical rule without human approval.

**State:** implemented for the first synthetic replay slice. The immutable source snapshot, lifecycle, rights, attribution, review, and clinical-authority gates are covered by deterministic tests and are visible in the replay and Closure Brief. External source approval remains intentionally pending.

## Stage 6 — Governed Gemini preparation

**Objective:** allow AI to draft synthetic educational material without becoming the clinical authority.

**Exit evidence:**

- one replacement, scoped Preview key passes the fixed stateless probe;
- obsolete or conflicting aliases are removed;
- prompt, model, source and output versions are recorded;
- outputs enter `draft-human-review-required`; and
- real-patient input, Production execution and autonomous decisions remain blocked.

**State:** blocked pending owner-controlled key rotation and successful Preview probe.

## Stage 7 — Cliniverse integration

**Objective:** place the validated journey inside the future app navigation and subscription contract.

**Exit evidence:**

- entitlement behavior is explicit and restore-safe;
- a free user can understand value without a dead end;
- a PRO user can complete the full learning loop;
- progress ownership and deletion behavior are documented; and
- no schema migration occurs without a separate backup, rollback and authorization gate.

**State:** pending Stages 2–6.

## Stage 8 — Product quality gate

**Objective:** verify the product as a bilingual, accessible, resilient mobile experience.

**Exit evidence:**

- English and Arabic/RTL content are reviewed;
- VoiceOver, keyboard, Dynamic Type, contrast and reduced-motion checks pass;
- offline, restart and failure paths are exercised;
- iPhone and iPad visual evidence passes; and
- deterministic tests, TypeScript, ESLint and the Next.js build pass.

**State:** pending.

## Stage 9 — TestFlight candidate

**Objective:** generate a signed candidate only after the product and governance gates pass.

**Exit evidence:**

- the exact candidate commit is frozen;
- native packaging, privacy manifest, icons, launch guard and StoreKit are inspected;
- clean-install purchase and restore tests pass on iPhone and iPad; and
- reviewer notes describe only behavior present in the binary and its Production backend.

**State:** HOLD; requires explicit authorization.

## Stage 10 — Release decision

**Objective:** decide whether evidence supports a later App Store version and an institutional pilot.

**Decision inputs:**

- clinical reviewer sign-off;
- privacy, security and claims review;
- at least five qualified institutional walkthroughs;
- repeated evidence of one high-value pathway problem; and
- explicit willingness to run a bounded pilot or paid discovery.

**State:** HOLD; Apple approval and market demand are separate decisions.

## Founder checkpoints

Founder action is required only for:

1. Gemini credential rotation or paid-provider decisions;
2. selection and clinical approval of external medical sources;
3. database, Production, TestFlight or App Store actions;
4. legal, privacy, institutional or commercial commitments; and
5. the final scope of the next public release.

All ordinary implementation, tests, internal documentation and Preview-only engineering remain within the authorized strategy branch.
