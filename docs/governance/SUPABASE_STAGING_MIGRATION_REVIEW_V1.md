# Supabase Staging Migration Review v1

Status: **HOLD — architecture correction required before any migration is applied**

Scope: read-only review of the current Cliniverse / NeuraOps shared governance ledger persistence stack and the existing Supabase project. No migration was applied and no database object was changed.

## Verified current state

- The live project currently has application tables in `public`; no `governance.evidence_ledger_events` table is present.
- The repository draft intentionally places the evidence ledger in a dedicated `governance` schema, revokes `anon`/`authenticated`, grants only `select, insert` to `service_role`, and blocks `UPDATE`/`DELETE` with triggers.
- The runtime adapter is server-only by contract and requires a service-role credential boundary.

## Blocking finding

The current runtime-adapter design assumes the trusted Supabase client can address the private `governance` schema directly. Supabase's JavaScript `schema()`/custom-schema Data API path requires that schema to be configured as an **exposed schema**. Exposing `governance` solely to make the runtime adapter work would weaken the intended boundary that the ledger remain an internal governance store rather than part of the normal Data API surface.

Therefore the current SQL draft and runtime transport are individually sensible but **not yet deployment-compatible with each other** under the desired private-schema security model.

## Required architecture correction before staging

Keep `governance.evidence_ledger_events` in a non-exposed/private schema and place a narrow trusted-server access surface in an already exposed server API schema (or use a trusted direct Postgres connection). For the current stack, the preferred minimal-change design is:

1. Keep the ledger table in `governance` and do not add `governance` to exposed schemas.
2. Expose only narrowly scoped server RPC functions for:
   - find by `event_id`;
   - append one immutable event;
   - list events for a `(product, subject_id)` scope.
3. Revoke function execution from `PUBLIC`, `anon`, and `authenticated`; grant execute only to `service_role`.
4. Use `SECURITY DEFINER` only where required, with an explicit safe `search_path` and fully qualified table references.
5. Preserve application-side fail-closed validation, idempotency, product scoping, PHI-key rejection, Integrity v2, and append-only database triggers.
6. Do not enable Realtime for the governance ledger in v1.

## Security review notes

- `service_role` must remain backend-only and must never be included in browser/mobile bundles.
- RLS alone is not the primary boundary for this store because service-role requests bypass RLS; grants, private-schema placement, narrow RPCs, append-only triggers, and server-only secret handling are the important controls.
- The ledger should remain metadata/evidence/provenance only; direct patient identifiers/PHI payloads remain prohibited by the application contract.
- No existing `public` clinical or subscription table should be repurposed as the governance ledger.

## Migration gate

**DO NOT APPLY THE CURRENT DRAFT YET.**

The staging migration can move from HOLD to REVIEW-READY only after the repository runtime adapter and SQL draft agree on a private-schema + narrow server-RPC transport, and the targeted governance/persistence suite remains green.

## Recommended next implementation step

Create **Supabase Private Ledger RPC Boundary v1** in code + SQL draft + tests, then rerun the full targeted suite. Only after that should a staging-only migration be considered for explicit authorization.
