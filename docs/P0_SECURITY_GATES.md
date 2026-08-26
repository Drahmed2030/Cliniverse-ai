# Cliniverse AI — P0 Security Gates Before Production Healthcare Use

These gates are intentionally narrow. They do not redesign the product; they prevent unsafe production use while the new Cliniverse shell and architecture are developed.

## P0-1 Remove debug credential exposure
- Disable/remove `/api/debug-supabase` before any production healthcare use.
- Never return service-role key fragments, lengths or identifying metadata to clients.

## P0-2 Remove committed secret material
- Remove hard-coded cron secret material from version-controlled configuration.
- Rotate the corresponding runtime secret if it has ever matched committed material.

## P0-3 Real authentication
- Replace optimistic/mock auth completion with a real provider-backed session.
- No production healthcare workflow may rely on UI-only authentication.

## P0-4 API authorization
- Add explicit auth/role/tenant guards to high-cost and sensitive API routes.
- Deny by default.

## P0-5 Supabase authorization boundary
- Verify schema and RLS policies for every user/patient/workflow-facing table.
- Service-role access must remain server-only.

## P0-6 AI resilience and validation
- Timeouts for provider calls.
- Bounded retry only where safe.
- Structured output validation.
- Controlled fallback/human escalation on provider failure.

## P0-7 Healthcare data gate
Before real PHI/patient data is permitted, explicitly verify:
- data classification
- tenancy/isolation
- audit trail
- retention/deletion
- consent/notice requirements
- vendor data-processing terms / BAAs where applicable
- applicable privacy/regulatory requirements for deployment geography

## P0-8 Human-in-the-loop safety
- Clinically consequential uncertainty or high-risk states must escalate to a human.
- Model confidence must not be presented as validated clinical confidence unless formally validated.
