-- Cliniverse clinical content catalog — control-plane index, not a content store.
--
-- APPLIED TO STAGING (xhwotblarwsxoanpiloe) 2026-09-18, truth-match verified
-- against app/lib/contentCatalogSeed.ts (71/71, zero drift). NOT APPLIED TO
-- PRODUCTION (zbiujqxinvcxvuviuenx) — do not run this against production
-- without an explicit migration-window decision.
--
-- This table indexes and governs content that already lives in the repo
-- (app/lib/ward/*, public/ecg-cases/*, app/lib/codelab/*, etc.) and in other
-- Supabase tables (cases, daily_cases, etc.). It does not store content
-- bodies itself — see docs/CLINICAL_CONTENT_CATALOG_V1.md for the boundary.
--
-- Follows Batch 3's staging-verified privilege discipline: RLS enabled,
-- authenticated gets SELECT only via an explicit per-operation policy set,
-- no user-owned column, no entitlement authority, service_role has full
-- management via its usual RLS-bypass behavior (no policy needed for it).

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create table if not exists public.clinical_content_catalog (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  module text not null,
  content_type text not null,
  title text not null,
  category text,
  access_tier text not null,
  visibility text not null,
  readiness text not null,
  route text,
  provenance_ref text,
  source_revision text,
  content_hash text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint clinical_content_catalog_access_tier_check
    check (access_tier in ('free', 'pro', 'institution')),
  constraint clinical_content_catalog_visibility_check
    check (visibility in ('visible', 'hidden')),
  constraint clinical_content_catalog_readiness_check
    check (readiness in ('ready', 'review_required', 'media_pending', 'labs')),
  constraint clinical_content_catalog_unique_item
    unique (module, content_type, source_key)
);

comment on table public.clinical_content_catalog is
  'Control-plane index of learner-facing content: what exists, what is visible, what is ready. Does not store content bodies. No PHI, no user-owned data.';

-- updated_at maintenance — this table has no user-facing writer, so a trigger
-- keeps it correct regardless of which service-role process performs an upsert.
create or replace function public.clinical_content_catalog_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clinical_content_catalog_set_updated_at on public.clinical_content_catalog;
create trigger clinical_content_catalog_set_updated_at
  before update on public.clinical_content_catalog
  for each row
  execute function public.clinical_content_catalog_set_updated_at();

alter table public.clinical_content_catalog enable row level security;

-- No anon policy: this is reference/control-plane data for the authenticated
-- release shell (AuthGate allowGuest={false}), not a public web surface. If a
-- future public marketing surface needs read access, add a scoped anon SELECT
-- policy explicitly then — do not default to open.
revoke all privileges on table public.clinical_content_catalog from anon, authenticated;
grant select on table public.clinical_content_catalog to authenticated;

drop policy if exists "clinical_content_catalog_select_authenticated" on public.clinical_content_catalog;
create policy "clinical_content_catalog_select_authenticated"
  on public.clinical_content_catalog
  for select
  to authenticated
  using (true);

-- Deliberately no INSERT/UPDATE/DELETE policy for authenticated or anon —
-- this table is service_role-managed only. service_role bypasses RLS by
-- default in Supabase and needs no policy of its own.

-- Self-verifying assertions.
do $catalog_assertions$
begin
  if not (select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relname = 'clinical_content_catalog') then
    raise exception 'clinical_content_catalog is missing RLS';
  end if;

  if not has_table_privilege('authenticated', 'public.clinical_content_catalog', 'SELECT') then
    raise exception 'authenticated cannot SELECT clinical_content_catalog';
  end if;

  if has_table_privilege('authenticated', 'public.clinical_content_catalog', 'INSERT')
     or has_table_privilege('authenticated', 'public.clinical_content_catalog', 'UPDATE')
     or has_table_privilege('authenticated', 'public.clinical_content_catalog', 'DELETE') then
    raise exception 'authenticated has an unexpected write privilege on clinical_content_catalog';
  end if;

  if has_table_privilege('anon', 'public.clinical_content_catalog', 'SELECT') then
    raise exception 'anon can read clinical_content_catalog — not intended for this release';
  end if;
end
$catalog_assertions$;

commit;
