# Clinical Pathway Replay Storyboard and Gates v1

Status: **PLANNING ONLY - NO RELEASE OR DATABASE AUTHORITY**

## Experience principle

The experience tells one story, not a catalogue of modules:

> See the pathway. Find the gap. Practise the gap. Prove the change.

The first screen prioritizes the pathway, time, exception and next action. It does not begin with a grid of product cards.

## Seven-screen storyboard

### 1. Replay Home

Purpose: establish the case, pathway version, fictional-data status and current readiness state.

Visible elements:

- `STEMI Replay` title;
- persistent `Fictional simulation` label;
- pathway version and review status;
- one primary action: `Open pathway replay`;
- concise safety boundary;
- no fake live monitoring language.

### 2. Pathway Timeline

Purpose: deliver the hero moment.

Visible elements:

- ordered event rail from referral or first contact to procedure milestone;
- actual fictional time, configured target and interval for each relevant segment;
- status expressed with icon, label and color;
- missing or conflicting timestamps shown in place, not hidden;
- keyboard and screen-reader equivalent list;
- reduced-motion static state.

Interaction:

- selecting an event opens its owner, source, timestamp provenance and rule;
- selecting a delayed segment opens the gap explanation.

### 3. Gap Explanation

Purpose: explain rather than merely score.

Visible elements:

- `What happened`;
- `Why it was flagged`;
- `Rule and configured threshold`;
- `Evidence available / missing`;
- `Accountable role`;
- `Human review required`;
- primary action: `Practise this gap`.

The system may suggest a draft operational delay category. A human owns the final classification.

### 4. Targeted Shift

Purpose: let one user practise the specific transition or handover failure.

Visible elements:

- a three-to-five-minute fictional decision sequence;
- source-linked rationale revealed only after response;
- confidence entry separated from correctness;
- no diagnosis, dosing or treatment authority.

### 5. Nexus Team Simulation

Purpose: test ownership, communication and sequence across roles.

Visible elements:

- Case Huddle;
- Nursing Lens;
- Medication Safety;
- Safety Review;
- role-specific prompts and a shared debrief;
- explicit fictional-data confirmation.

### 6. Reassessment

Purpose: compare the same configured competency before and after training.

Visible elements:

- before/after interval and completeness values;
- changed, unchanged and not-measured labels;
- outstanding safety gates;
- explanation of what evidence is insufficient;
- no causal claim about patient outcome.

### 7. Closure Brief

Purpose: provide a reviewable management artifact.

Visible elements:

- gap, owner and status;
- protocol and version;
- synthetic evidence used;
- training completed;
- reassessment result;
- reviewer decision;
- open limitations and next review date.

The prototype displays this brief in-app. Export, signatures and external transmission remain out of scope until separately approved.

## Visual rules

- Preserve the frozen NeuraOps / Cliniverse brand family.
- Use the existing dark navy foundation with restrained blue, violet and clinical teal.
- Use semantic green, amber and red only for status; never rely on color alone.
- Prefer an event rail plus compact bullet-chart comparisons over decorative gauges.
- Display the number, target and status text beside every chart.
- Maintain 44 by 44 point minimum touch targets and visible focus states.
- Respect safe areas, Dynamic Type or scalable text, reduced motion and high contrast.
- Keep the primary action singular on each screen.
- Use Lucide or existing SVG icons; no emoji icons.
- Avoid glass effects behind dense clinical text unless contrast remains at least 4.5:1.

## Synthetic demonstration contract

The demonstration dataset is committed as explicitly fictional, versioned source data. It must contain:

- one normal journey;
- one delayed journey;
- one missing timestamp;
- one conflicting timestamp;
- one unauthorized transition attempt;
- one critical safety gate failure;
- one completed training and reassessment example.

No values from photographed clinical forms, real audits, screenshots, production databases or institutional reports may be copied into the seed dataset.

## Backup and recovery gate

Backups are not implemented by this planning document. Before any future server persistence, integration, or database migration, the following evidence is mandatory:

1. documented systems and data inventory;
2. data classification and owner for each store;
3. encrypted automated backup with defined retention;
4. an isolated restore test, not only proof that a backup job ran;
5. recovery point and recovery time objectives;
6. tenant and environment separation;
7. export path for customer-owned content and learning records;
8. rollback plan for schema and content changes;
9. incident recovery owners and communication path;
10. quarterly restore evidence for any production institutional service.

The Apple binary, Git repository, production deployment, secrets, database, content registry and future institutional tenant data require separate backup and recovery controls. A Git repository alone is not a complete backup plan.

## Release isolation gate

The current App Store submission remains frozen while it is under review. This strategy branch must not:

- change the submitted binary or App Store metadata;
- cancel or replace the submission;
- merge into the release branch;
- promote a deployment;
- create or apply a database migration;
- enable real-data collection;
- reuse reviewer credentials in code or documentation.

## Commercial proof gate

Before building institutional integrations, complete five structured buyer conversations. Record:

- the pathway and operational pain;
- frequency and consequence of the problem;
- the current paper or software workaround;
- the accountable executive and daily user;
- the budget owner and purchasing route;
- acceptable pilot data boundary;
- the result required to continue;
- explicit willingness to review or pilot the prototype.

Advance to a pilot only when one problem, one buyer, one bounded workflow and one measurable success criterion are confirmed. Interest, praise and free trials are not purchase evidence.

## First build decision gate

Implementation may begin after approval of:

1. this product contract and storyboard;
2. the working public capability name;
3. the fictional STEMI event schema and configured demonstration rules;
4. the exact component composition boundary;
5. the acceptance tests for all seven screens;
6. confirmation that the Apple submission remains unaffected.

The recommended first implementation is a local, network-free Replay prototype using the existing deterministic Cardio Nexus engine. It should not require Supabase, a model provider, a hospital system, or new paid infrastructure.

