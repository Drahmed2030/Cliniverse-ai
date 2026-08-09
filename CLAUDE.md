# Cliniverse AI — Project Context

Live at: cliniverseai.com | Repo: Drahmed2030/Cliniverse-ai | Vercel Pro + custom domain

## Update Workflow
Claude writes a Python script → user runs `python3 ~/Downloads/name.py` on their
MacBook Pro (macOS Catalina) → script edits files, runs `npx next build` locally,
**only pushes to git if the build succeeds**. Never assume a fix worked without
a build test + screenshot confirmation from the live app.

Note: downloaded filenames with spaces need backslash escaping in Terminal,
e.g. `python3 ~/Downloads/fix\ oracle\ models.py`

## Stack
- Next.js App Router, TypeScript, deployed on Vercel
- Supabase (Postgres + pgvector) — https://zbiujqxinvcxvuviuenx.supabase.co
- Styling: inline style objects per component (no Tailwind/Shadcn in use — don't introduce without explicit decision)
- Design tokens: Canvas #F8FAFC, Teal #0D9488 + Cobalt #1E40AF gradient, SF Pro font, FloatingNav pill nav

## Navigation — 5 tabs, STABLE
Tab ids (single source of truth across FloatingNav.tsx, MAIN_TABS, and any onClick handlers):
`hub | ward | oracle | tools | me` — labels shown: Today, Ward, 🔮(center), Atlas, Life

- `FloatingNav.tsx` props MUST be `active={tab} onChange={setTab}` — NOT tab/setTab
- `page.tsx` imports components via relative paths (`./components/X`) — NOT `@/components/X` (no alias configured)
- Swipe gesture is intentionally disabled (double-triggered with the raised Oracle center button) — re-enable only after Capacitor conversion

## Clinical Oracle Engine — 4-AI consensus, WORKING
`app/api/oracle/route.ts` — POST, Promise.allSettled across 4 models.

Current working model config (OpenRouter free tier changes weekly — verify at
openrouter.ai/models?max_price=0 before assuming a slug still works):
- claude: direct Anthropic API, `claude-sonnet-4-6`
- "GPT-OSS 20B" (labeled Gemini in UI history, actually replaced it): `openai/gpt-oss-20b:free` via OpenRouter — Gemini has NO free tier on OpenRouter as of July 2026, don't retry gemini slugs
- deepseek: `deepseek/deepseek-chat-v3-0324` via OpenRouter — paid/cheap, needs credit balance
- llama: `meta-llama/llama-3.1-70b-instruct` via OpenRouter — same

Env vars: `ANTHROPIC_API_KEY` (claude), `OPENROUTER_API_KEY` (other three).
OpenRouter account has $10 credit topped up (free tiers for DeepSeek/Llama were removed mid-2026).

⚠️ API key paste corruption: keys can look correct (right length/prefix) in both
.env.local and Vercel but carry invisible whitespace/newlines causing "invalid
header value". Fix: write key to a plain .txt via Python, open in TextEdit,
Cmd+A/Cmd+C, paste fresh into Vercel — never retype/paste from chat directly.

## Knowledge Graph pillar — WORKING END-TO-END
- `knowledge_graph_schema.sql` — pgvector schema: `clinical_documents`, `clinical_case_embeddings`
  (1536-dim, HNSW index), `kg_nodes`, `kg_edges`, `match_clinical_cases()` function
- `app/lib/embeddings.ts` — OpenAI `text-embedding-3-small` helper
- `app/api/knowledge-graph/seed/route.ts` — one-time seeding of embeddings
- `app/api/knowledge-graph/match/route.ts` — similarity search API (POST, `{queryText}` → top matches)
- `OPENAI_API_KEY` in Vercel + .env.local, auto-recharge enabled ($10 initial, refill $5 below $5 threshold)
- Verified with real data: Heart Failure cases cluster correctly (0.78, 0.71 similarity),
  unrelated CKD case scores lowest (0.48) — proves the matching actually reflects clinical similarity, not noise.

### 🔴 CRITICAL SUPABASE RLS LESSON
**Every RLS-enabled table needs an explicit policy PER OPERATION.**
A table created with only a `FOR SELECT` policy will silently block
INSERT/UPDATE/DELETE for the service_role key in some Supabase configs —
`.update()` returns HTTP 200 with an empty data array and **no error thrown**.
This cost hours of debugging (looked like a timeout, then a vector format
issue, then an id type mismatch) before being traced to the missing policy.

Always create, per table:
```sql
CREATE POLICY "..." ON table_name FOR SELECT USING (true);
CREATE POLICY "..." ON table_name FOR INSERT WITH CHECK (true);
CREATE POLICY "..." ON table_name FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "..." ON table_name FOR DELETE USING (true);
```
And verify writes by `.select()`-ing the row back afterward — never trust a
clean HTTP 200 alone on a new table.

## Content Engine — built, not yet tested
`supabase/content_engine.sql` (evidence_sources, question_bank with Oracle
consensus columns, study_notes, medical_images) + 5-stage ingest pipeline
under `app/api/ingest/*`. `CRON_SECRET` set in Vercel. Never run end-to-end yet.

## Clinical Academy — built, not live-tested
`app/components/ClinicalAcademy.tsx` — MRCP/USMLE boards + AI seminar generator,
linked in ToolsPage (Atlas tab). Uses `app/api/medical-ai/route.ts`.

## Debug routes to remove/protect before wider release
- `app/api/knowledge-graph/debug-env` — reveals env var structure (safe but shouldn't linger)
- Confirm `app/api/knowledge-graph/seed/route.ts` no longer has verbose debug fields from troubleshooting

## App Store status
Submitted for review Aug 4 2026 via Codemagic (Bundle ID `com.cliniverse.ai`,
Team 4KH9AFX69U). Still Pending Review as of 9 Aug — **do not run any
`npx cap init` or change the Bundle ID while this review is pending.**

## Deferred / not started
Multi-cloud API router, Redis caching, Patient Companion module, Auto-Shorts
video generator, Offline Edge AI (Liquid LFM WASM), Mortality Predictor,
Clinical Twin, Voice Mode, Google Play port, Apple Watch HealthKit, Push
Notifications, Stripe.
