-- Rollback for supabase/drafts/clinical_content_catalog_v1.sql
--
-- DRAFT / STAGING ONLY. NOT APPLIED.
--
-- Drops the catalog table entirely. Safe to do so because this table is a
-- control-plane index only — the content it describes (Ward templates, ECG
-- images, Echo assets, etc.) lives elsewhere and is entirely unaffected by
-- dropping this table. The application's typed adapter (app/lib/contentCatalog.ts)
-- falls back to its local seed manifest if this table is unreachable, so
-- rolling this back does not remove any learner-visible content — it only
-- removes the ability to govern that content from Supabase.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

drop trigger if exists clinical_content_catalog_set_updated_at on public.clinical_content_catalog;
drop function if exists public.clinical_content_catalog_set_updated_at();
drop table if exists public.clinical_content_catalog;

commit;
