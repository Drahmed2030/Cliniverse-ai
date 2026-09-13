# Isolated Echo SQL verification

Run `npm ci --ignore-scripts` then `npm test` in this directory.
PGlite 0.5.8 is pinned independently; the application package and lockfile are unchanged.

The tests execute the candidate SQL on an ephemeral PostgreSQL WASM database with
synthetic auth.users and auth.uid(), two test identities and real role/RLS/grant checks.
No network Supabase connection or real learner data is used.
This verifies SQL behavior, not deployed PostgREST/Auth configuration.
