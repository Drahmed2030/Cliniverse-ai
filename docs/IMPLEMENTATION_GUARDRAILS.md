# Cliniverse Implementation Guardrails

- Never modify `main` directly.
- Use dedicated branches and PRs.
- Verify Vercel preview/build before merge.
- Preserve existing valuable features during shell consolidation.
- Do not introduce new clinical automation simply because a UI generator suggests it.
- Do not claim regulatory compliance, validated clinical confidence, customer adoption, or outcomes without evidence.
- Do not expose secrets or PHI in logs, client bundles, debug routes, screenshots, prompts, or public repositories.
- Prefer extraction and composition over duplicate implementations.
- Keep the first operational wedge narrow: Follow-up + Prioritization + Human Escalation.
