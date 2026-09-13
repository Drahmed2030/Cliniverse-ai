# Ward handover session — review preview

Scope: one fictional w1 source snapshot, four deterministic stages: brief, record review, missing-information decision, draft handover and summary. Existing patient data/types are reused unchanged. No random deterioration, invented observations, treatment suggestions, competence score or clinical approval. No ECG record 10 association.

Access: same server preview/development flag and confirmed reviewer audience as the ECG review entry. Existing public w1 / PRO case gates and StoreKit are unchanged. Production does not show the new session.

Storage: memory only, visibly disclosed. Leaving the component or switching account resets the session. No Supabase writes or xAPI statements. Account persistence, resume, Progress mapping and content acceptance remain release prerequisites.

Validation: 5 deterministic transition/source-preservation tests passed; TypeScript, targeted lint and diff check passed. Browser acceptance is pending deployment.

Release proposal (not a pricing change): retain the current basic w1 access; retain premium gating for existing additional cases/Cardiology/Nexus. Do not sell unfinished handover persistence, institution integrations or AI agents. The first future releasable session should include a guided case, explicit unknowns, replayable event history, structured draft, debrief and verified account persistence. No Apple build created in this work.
