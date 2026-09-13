# Ward scenario rotation — review only

Three documentation scenarios reuse the same frozen fictional w1 source: current observations (legacy w1-handover-1.0.0), pending work (w1-pending-1.0.0), receiving clinician (w1-recipient-1.0.0). These are variations of one case, not three new patients or live clinical data. Added branches have technical verification, not new human clinical acceptance.

Completing a scenario exposes Start next scenario, which cycles current → pending → recipient → current. New session IDs separate attempts. Save practice persists the scenario through its version; existing saved legacy sessions still restore without switching. Progress/xAPI scoring and subscription rules are unchanged. No realtime timers, random deterioration or autonomous clinical content generation.

17 local tests PASS, 0 FAIL, 0 SKIP; TypeScript and targeted lint PASS. Tests cover all branches, corrective feedback, round-trip persistence, cross-scenario action rejection, rotation and legacy compatibility. Live acceptance pending preview testing. Database migration ward_practice_scenario_versions only expands the allowed content-version list; RLS and privileges are unchanged. Exact SQL preserved alongside this report.

Prior account-checkpoint acceptance: the authorized review account saved two actions and, after browser reload, restored step 3 on w1-handover-1.0.0. A database read confirmed checkpoint 2 and action count 2.
