# Engagement Privacy Boundary v1

Status: **FOUNDATION ONLY — no messaging is live.** This document governs the Cliniverse Evidence & Engagement foundation (`app/lib/engagement/*`) added in v1.2 Batch 2.5. It is a boundary contract, not a feature announcement.

## What this layer is for

A provider-agnostic foundation for future professional-learning personalization — helping a clinician see more of the cardiology topics they already engage with inside Cliniverse. It is not, and must never become, a general marketing or advertising system.

## Hard boundaries

- **No PHI.** No patient-identifiable or patient-derived data may pass through any engagement event, interest signal, or digest item. The event contract (`app/lib/engagement/events.ts`) rejects known-sensitive property keys and scans string values for clinical/patient-identifying language as a second layer of defense — this is enforcement, not merely a policy statement, and both layers must be kept in sync with this document.
- **No patient targeting.** This layer identifies and personalizes for the authenticated *clinician* account only. It must never be extended to target, segment, or message patients.
- **No inference of the user's own medical conditions.** The interest taxonomy (`app/lib/engagement/interests.ts`) is a fixed, closed list of professional-learning topics (e.g. `heart_failure`, `ecg`, `guidelines`). It is a taxonomy of what a clinician studies, not a health record of the clinician themselves.
- **No sensitive-trait inference.** No component of this layer may derive, store, or act on psychological traits, political or religious affiliation, or any other sensitive personal attribute. Behavioral interest signals are limited to which *approved topic* a learning interaction relates to, with an explicit `source: 'behavioral'` and `confidence` field, never a free-form inference.
- **Professional-learning personalization only.** Every interest signal, event, and digest item exists to answer "what cardiology content is this clinician likely to find useful," nothing broader.

## Before any future messaging goes live

- **Explicit opt-out required first.** No automated message (email, push, or otherwise) may be sent to any user before an explicit, discoverable opt-out mechanism exists and is verified working.
- **Providers must be approved before integration.** `EngagementProvider` is currently implemented only by `NoopEngagementProvider` (default) and `DevLoggerEngagementProvider` (development-only, redacts sensitive values, never transmits). No vendor (Customer.io, PostHog, Braze, OneSignal, or any other) may be wired in without a separate, explicit approval — commercial, security, and data-processing review — recorded in its own dated document before integration begins.
- **Unsubscribe controls are required**, not optional, on any live channel — every future email or push implementation must ship its unsubscribe/opt-out path in the same release that ships the sending capability, not after.
- **Automated campaigns must be auditable.** Any future send must be traceable to a specific triggering event or schedule, the exact content sent, and the recipient's consent state at send time. `sendEvidenceDigest`/`sendPush` are stubs in this release specifically so this auditability contract can be designed before any real send capability is added, not retrofitted after.
- **No advertiser access.** No third party — advertiser, data broker, or otherwise — may be granted access to Cliniverse user data, interest signals, or event history through this layer or any provider connected to it.

## What's actually implemented as of this document

- Identity: derived read-only from Supabase Auth via `resolveEngagementIdentity()` — no caller-supplied user ID, no device identifier as identity, no client-set entitlement.
- Interests: a fixed, validated topic taxonomy with explicit/behavioral provenance and timestamps.
- Events: a fixed, validated event taxonomy with anonymous-rejection for identity-required event types and PHI/free-text rejection.
- Provider: `NoopEngagementProvider` is the default and does nothing observable outside the process. `DevLoggerEngagementProvider` exists for local engineering visibility only and is blocked from selection when `NODE_ENV === 'production'`.
- Evidence digest: a typed domain model only. No digest is generated, no AI writes any claim into it, and nothing is sent.
- Deep links: a canonical HTTPS path contract for internal content (`/evidence/[id]`, `/reference/[id]`, `/learn/ecg/[caseId]`, `/learn/echo/[studyId]`, `/learn/ward/[caseId]`).

## Deferred — future Universal Link requirements (do not build yet)

Apple Universal Links / Associated Domains are explicitly **not** enabled by this foundation. Before that work begins, it will separately need: an `apple-app-site-association` file served from the production origin with the correct Team ID/Bundle ID association, the Associated Domains capability added to the iOS entitlements (a native/Apple-configuration change, out of scope for this web-first batch), and a native routing layer to map an incoming Universal Link back to the correct in-app screen. None of that is present or assumed by the path contract above — the paths are deliberately plain, ordinary HTTPS routes today.

## Required Supabase schema (not created by this batch)

Durable, cross-device persistence of interest preferences (the "Topics I follow" UI) requires a Supabase table that does not exist yet. Per instruction, this batch does not invent or apply that schema — it is described here for future approval instead:

```sql
-- NOT APPLIED. For review only.
create table public.clinician_interest_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  source text not null check (source in ('explicit', 'behavioral')),
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  updated_at timestamptz not null default now(),
  unique (user_id, topic)
);
-- Would need, per CLAUDE.md's own RLS lesson: RLS enabled, and an explicit
-- policy per operation (select/insert/update/delete), each scoped to
-- auth.uid() = user_id, verified by reading a written row back afterward.
```

Until this table exists and is approved, the "Topics I follow" preference UI (Section 8 of the Batch 2.5 request) persists only to `localStorage` on the current browser/device, exactly like the existing Appearance setting — it does not sync across devices and is not visible to any server-side process.
