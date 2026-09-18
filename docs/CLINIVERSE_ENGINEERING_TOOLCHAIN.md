# Cliniverse Engineering Toolchain — Build-with-Claude Evaluation Set

*Governance document. Records which agentic/tooling capabilities are worth evaluating for this repo, and the rules any such tool must operate under. Nothing in this document installs, enables, or grants permission to any tool — evaluation and promotion are separate, later, explicit steps.*

**Tool names may change.** Vendor names, plugin names, and specific skill/MCP-server identities listed below are illustrative of a *capability*, not a commitment to a specific product. The durable requirement is the capability and the gate it must pass — not which vendor currently provides it. When a named tool is superseded, replace the name, keep the gate.

---

## Trial capabilities

Capabilities worth evaluating now, against real Cliniverse surfaces, before any promotion decision:

- **Frontend visual/design review capability** — a tool that can render an actual page and assess layout/spacing/contrast/hierarchy against Cliniverse's existing dark-studio design language (`commercial-visual-system.css`, and the newer per-surface CSS Modules noted in `docs/CLINIVERSE_PLATFORM_STATE_V1_2.md` §G). Evaluate against a Labs surface first (e.g. Resuscitation Hub, Operations Console), never a production-gated PRO surface, until trusted.
- **Real-browser/webapp testing capability** — Playwright is already a repo dependency (`@playwright/test`, `@axe-core/playwright`) and was used directly in Batch 10's visual QA gate (production build, 5 required viewports, a real CSS overflow bug found and fixed). The durable capability this repo needs is "can drive a real browser against a real build and report what a human would actually see" — keep using what's already installed before evaluating a replacement.
- **Accessibility review capability** — `@axe-core/playwright` is already installed and was run in Batch 10's gate (2 moderate violations found, both attributable to a throwaway test harness page, not the product). Any accessibility tool must run against the product's real markup, not a synthetic fixture, to be trusted.
- **API/interface-design review capability** — a tool that reviews a new API route or exported TypeScript contract (e.g. `operationalCore.ts`'s shape, a new `/api/*` route) for consistency with existing patterns (server-proxy discipline, no client-side vendor secrets, fail-closed defaults) before it ships.

## Future capabilities

Not evaluated yet; recorded so they aren't forgotten or re-proposed from scratch later:

- **API security audit** — a tool that checks a new or changed API route for the class of bug Batch 8 found by hand (`DrugInteractionChecker.tsx` calling `https://api.anthropic.com/v1/messages` directly from client code with no auth header). Would need to run against source, not a live endpoint, since no external network access exists in most agent sandboxes for this repo.
- **DB optimization / admin review** — a tool for reviewing Supabase migrations/query patterns. Must never itself hold write access to production; advisory-only, same as every other tool in this document.
- **Custom Cliniverse institutional-integration skill** — a purpose-built skill encoding this repo's own institutional-mode boundary (Section F of the platform-state doc) so an agent cannot accidentally treat Cardio Nexus Core, QAPAS-DIRECT, or any FHIR/DICOM boundary as more real than it is. Build this only once a real institutional pilot is scoped — building it speculatively risks it going stale exactly like the nav contract and Batch 6 status did in CLAUDE.md before this reconciliation.
- **MCP builder for controlled future integrations** — for when a real external system (a named hospital's FHIR endpoint, a real Echo AI vendor) needs a governed connector. The connector must be built behind the adapter boundaries already established (`echoAiAdapter.ts`, `fhirMappingBoundary.ts`) — an MCP server is a transport, not a bypass of those contracts.

---

## Rules — apply to every tool in this document, trial or future, without exception

- **Tools are advisory unless explicitly promoted.** A trial-capability tool's output is a suggestion an engineer or Claude reviews — never an auto-applied change, never a merge gate, until a human explicitly promotes it past trial status.
- **Never install blindly.** Before adding any dependency, package, plugin, or MCP server: inspect its source (or at minimum its published permissions/scopes), check its maintenance status (last release, open critical issues), and confirm it doesn't require broader access than the specific capability needs.
- **Inspect source, permissions, and maintenance status first** — this applies even to a tool from a trusted-sounding vendor. "Advisory" and "audited before install" are not substitutes for each other.
- **No tool may bypass existing Cliniverse governance.** A visual-review tool cannot promote `review_required` content to `visible`. A DB tool cannot flip an RLS policy. A security-audit tool cannot itself fix a finding without going through the same review a human engineer's fix would — see CLAUDE.md's own engineering contract for what "fixed" requires (targeted test → full test → typecheck → build → commit → push, staging before production).
- **No auto `git add`.** Every commit stages named files explicitly — this repo's own batch discipline (see recent commit history) never uses `git add .`/`git add -A`, and no tool is exempted from that rule.
- **No auto deploy.** No tool triggers a Vercel promotion, a Codemagic build, or any other deploy action on its own initiative.
- **No production DB mutation.** Every Supabase-touching change goes to staging first, gets explicitly verified there, and only then gets an explicit, separate production-promotion decision — a tool never shortcuts this sequence, no matter how confident its own self-check is.
- **No broad MCP permissions by default.** Any MCP server this repo ever connects must be scoped to the minimum capability it needs (e.g. read-only staging inspection, not a blanket Supabase admin key). Broaden only with an explicit, reviewed decision.
- **No clinical authority granted to a community skill.** A third-party skill, plugin, or model may summarize, format, or explain governed content — it may never become the source of a dosing rule, an interaction rule, a diagnosis, a competency certification, or an autonomous operational escalation. This is the same boundary CLAUDE.md's "Clinical AI" principle states for Claude itself, and it applies identically to any other tool added to this toolchain.

---

## Status

No tool in this document has been installed as a result of writing it. This is a governance/evaluation record only — see the accompanying commit for confirmation that no `package.json`, `mcp` config, or plugin manifest was changed alongside it.
