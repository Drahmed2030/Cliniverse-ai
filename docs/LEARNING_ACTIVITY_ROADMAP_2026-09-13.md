# Learning activity and assessment roadmap

Proposed next increment, not enabled: record authorized review activity separately from scored assessment. A viewed PDF is an activity observation, not proof of knowledge, completion or clinical competence. HOLD content must remain within its existing authorized review audience; logging an observation must not make it learner-visible.

Use existing account identity and append-only event conventions. Keep event ID, case/content version, output SHA, observation time and explicit event kind. Do not add a score or mastery field to a view event. Request-authenticated server validation and own-row access are required; label self-reported activity distinctly from scored results.

Future institutional export may map these events to xAPI. xAPI describes JSON learning-experience records and exchange with a Learning Record Store: https://standards.ieee.org/ieee/9274.1.1/7321/ . This is an interoperability direction, not a claim of current xAPI conformance or a newly invented standard. Validate the applicable edition and a partner's requirements before implementing export. No new LRS, purchase, agent or external data transfer is introduced now.
