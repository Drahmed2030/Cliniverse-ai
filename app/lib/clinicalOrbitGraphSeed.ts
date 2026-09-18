import type { ClinicalOrbitNode, ClinicalOrbitEdge } from './clinicalOrbitGraphModel'

// Curated first Clinical Orbit graph — 5 high-value clinical anchors, only
// relationships supported by real catalog content or a named repo source.
// Nothing here is fabricated to make the graph look richer than it is.
//
// Two edges below deliberately point at hidden/media_pending catalog items
// (the batch20 Anterior STEMI ECG case, and the CHA2DS2-VASc calculator,
// which is real code in ClinicalCalculators.tsx but that component is
// unreachable from ReleaseApp — see app/lib/contentCatalogSeed.ts). These
// are not mistakes: they exist so the readiness/visibility filtering
// requirement is proven against real data, not only synthetic test
// fixtures. getOrbitNeighbors() must exclude both by default.

export const CLINICAL_ORBIT_NODE_SEED: ClinicalOrbitNode[] = [
  // ── Condition anchors — clinical concepts, no catalog item of their own ──
  { nodeKey: 'condition:anterior_stemi_acs', nodeType: 'condition', label: 'Anterior STEMI / ACS' },
  { nodeKey: 'condition:atrial_fibrillation', nodeType: 'condition', label: 'Atrial Fibrillation' },
  { nodeKey: 'condition:heart_failure', nodeType: 'condition', label: 'Heart Failure' },
  { nodeKey: 'condition:severe_hyperkalemia', nodeType: 'condition', label: 'Severe Hyperkalemia' },
  { nodeKey: 'condition:cardiac_arrest_acls', nodeType: 'condition', label: 'Cardiac Arrest / ACLS' },

  // ── Content nodes — each tied to a real clinical_content_catalog item ──
  { nodeKey: 'content:ward:case:stemi_anterior', nodeType: 'content', label: 'Ward: Anterior STEMI', catalogRef: { module: 'ward', contentType: 'case', sourceKey: 'stemi_anterior' } },
  { nodeKey: 'content:ward:case:acs_ruleout', nodeType: 'content', label: 'Ward: ACS Rule-Out', catalogRef: { module: 'ward', contentType: 'case', sourceKey: 'acs_ruleout' } },
  { nodeKey: 'content:ecg_batch20:case:anterior-stemi', nodeType: 'content', label: 'ECG: Anterior STEMI (batch20)', catalogRef: { module: 'ecg_batch20', contentType: 'case', sourceKey: 'anterior-stemi' } },
  { nodeKey: 'content:ecg:case:afib-rvr', nodeType: 'content', label: 'ECG: Atrial Fibrillation with RVR', catalogRef: { module: 'ecg', contentType: 'case', sourceKey: 'afib-rvr' } },
  { nodeKey: 'content:reference:calculator:cha2ds2_vasc', nodeType: 'calculator', label: 'CHA₂DS₂-VASc', catalogRef: { module: 'reference', contentType: 'calculator', sourceKey: 'cha2ds2_vasc' } },
  { nodeKey: 'content:clinical_library:case:c2', nodeType: 'content', label: 'Case: Acute Decompensated Heart Failure', catalogRef: { module: 'clinical_library', contentType: 'case', sourceKey: 'c2' } },
  { nodeKey: 'content:ecg_batch20:case:acute-heart-failure', nodeType: 'content', label: 'ECG: Acute Heart Failure (batch20)', catalogRef: { module: 'ecg_batch20', contentType: 'case', sourceKey: 'acute-heart-failure' } },
  { nodeKey: 'content:ecg:case:hyperkalemia-severe', nodeType: 'content', label: 'ECG: Severe Hyperkalemia', catalogRef: { module: 'ecg', contentType: 'case', sourceKey: 'hyperkalemia-severe' } },
  { nodeKey: 'content:ecg_batch20:case:hyperkalaemia', nodeType: 'content', label: 'ECG: Hyperkalaemia (batch20)', catalogRef: { module: 'ecg_batch20', contentType: 'case', sourceKey: 'hyperkalaemia' } },
  { nodeKey: 'content:codelab:scenario:megacode_v1', nodeType: 'content', label: 'Megacode', catalogRef: { module: 'codelab', contentType: 'scenario', sourceKey: 'megacode_v1' } },
  { nodeKey: 'content:codelab:lesson:acls_01_systematic', nodeType: 'content', label: 'ACLS: Systematic Approach', catalogRef: { module: 'codelab', contentType: 'lesson', sourceKey: 'acls_01_systematic' } },
  { nodeKey: 'content:codelab:lesson:acls_02_vf_vt', nodeType: 'content', label: 'ACLS: VF/pVT', catalogRef: { module: 'codelab', contentType: 'lesson', sourceKey: 'acls_02_vf_vt' } },

  // ── Batch 6: Echo Intelligence Atlas. Two new condition anchors (DCM/HCM
  // phenotype) plus content nodes for the three real catalog cine items
  // they reference. Every edge touching these anchors is pending_review
  // (see the edge seed below) — none are 'reviewed' — so by design none
  // appear in a default (non-reviewer) Clinical Orbit query, matching
  // clinical_content_catalog's own hidden/review_required state for the
  // DCM/HCM cines. condition:dcm_phenotype and condition:hcm_phenotype
  // themselves ARE always-reachable concept anchors (no catalogRef), same
  // as condition:heart_failure — reaching them just shows zero neighbors
  // in learner scope today, which is the honest state.
  { nodeKey: 'condition:dcm_phenotype', nodeType: 'condition', label: 'Dilated Cardiomyopathy (Echo phenotype)' },
  { nodeKey: 'condition:hcm_phenotype', nodeType: 'condition', label: 'Hypertrophic Cardiomyopathy (Echo phenotype)' },
  { nodeKey: 'content:echo:cine:echo-a4c-normal-cardionetworks-v1', nodeType: 'content', label: 'Echo: Normal A4C', catalogRef: { module: 'echo', contentType: 'cine', sourceKey: 'echo-a4c-normal-cardionetworks-v1' } },
  { nodeKey: 'content:echo_batch20:cine:dilated-lv', nodeType: 'content', label: 'Echo: Dilated LV / DCM (batch20)', catalogRef: { module: 'echo_batch20', contentType: 'cine', sourceKey: 'dilated-lv' } },
  { nodeKey: 'content:echo_batch20:cine:hypertrophic-phenotype', nodeType: 'content', label: 'Echo: Hypertrophic Phenotype / HCM (batch20)', catalogRef: { module: 'echo_batch20', contentType: 'cine', sourceKey: 'hypertrophic-phenotype' } },

  // Batch 7: Pathway Replay Intelligence v2. Two content nodes only, to
  // stay within the Batch 6-reconciled curated-seed ceiling (<=24 nodes,
  // <=20 edges) without renegotiating it again — see the edge seed below
  // for why only 2 of Section 12's 3 suggested links were added.
  { nodeKey: 'content:pathway:pathway:stemi-replay-demo-v2', nodeType: 'content', label: 'STEMI Pathway Replay', catalogRef: { module: 'pathway', contentType: 'pathway', sourceKey: 'pathway-replay-stemi-demo-v2' } },
  { nodeKey: 'content:pathway:drill:door-to-ecg-drill-v1', nodeType: 'content', label: 'Door-to-ECG acquisition drill', catalogRef: { module: 'pathway', contentType: 'drill', sourceKey: 'pathway-replay-door-to-ecg-drill-v1' } },
]

export const CLINICAL_ORBIT_EDGE_SEED: ClinicalOrbitEdge[] = [
  // Anterior STEMI / ACS
  { sourceNodeKey: 'condition:anterior_stemi_acs', targetNodeKey: 'content:ward:case:stemi_anterior', relation: 'demonstrates', evidenceStatus: 'reviewed', provenanceRef: 'app/lib/ward/templates.ts (stemi_anterior), app/lib/ward/wardData.ts#w1 — ready, visible' },
  { sourceNodeKey: 'condition:anterior_stemi_acs', targetNodeKey: 'content:ward:case:acs_ruleout', relation: 'related_to', evidenceStatus: 'reviewed', provenanceRef: 'app/lib/ward/templates.ts (acs_ruleout) — ready, visible' },
  // Deliberately hidden/media_pending target — proves filtering, not a mistake.
  { sourceNodeKey: 'condition:anterior_stemi_acs', targetNodeKey: 'content:ecg_batch20:case:anterior-stemi', relation: 'demonstrates', evidenceStatus: 'pending_review', provenanceRef: 'docs/case-media-resume/media-readiness-report.json — text confirmed, media_pending, not learner-visible' },

  // Atrial Fibrillation
  { sourceNodeKey: 'condition:atrial_fibrillation', targetNodeKey: 'content:ecg:case:afib-rvr', relation: 'demonstrates', evidenceStatus: 'reviewed', provenanceRef: 'public/ecg-cases/ATTRIBUTION.md (afib-rvr) — ready, visible' },
  // Deliberately hidden target (real calculator, unreachable component) — proves the "only if calculator is actually present" + filtering requirements together.
  { sourceNodeKey: 'condition:atrial_fibrillation', targetNodeKey: 'content:reference:calculator:cha2ds2_vasc', relation: 'measured_by', evidenceStatus: 'pending_review', provenanceRef: 'app/components/ClinicalCalculators.tsx (id: cha2ds2) — real logic, component unreachable from ReleaseApp' },

  // Heart Failure — both known items are hidden today; kept honest rather
  // than padded with a fabricated visible connection.
  { sourceNodeKey: 'condition:heart_failure', targetNodeKey: 'content:clinical_library:case:c2', relation: 'related_to', evidenceStatus: 'pending_review', provenanceRef: 'app/components/ClinicalLibrary.tsx (case c2) — content ready, component unreachable' },
  { sourceNodeKey: 'condition:heart_failure', targetNodeKey: 'content:ecg_batch20:case:acute-heart-failure', relation: 'demonstrates', evidenceStatus: 'pending_review', provenanceRef: 'docs/case-media-resume/media-readiness-report.json — media_pending' },

  // Severe Hyperkalemia
  { sourceNodeKey: 'condition:severe_hyperkalemia', targetNodeKey: 'content:ecg:case:hyperkalemia-severe', relation: 'demonstrates', evidenceStatus: 'reviewed', provenanceRef: 'public/ecg-cases/ATTRIBUTION.md (hyperkalemia-severe) — ready, visible' },
  { sourceNodeKey: 'condition:severe_hyperkalemia', targetNodeKey: 'content:ecg_batch20:case:hyperkalaemia', relation: 'related_to', evidenceStatus: 'pending_review', provenanceRef: 'docs/case-media-resume/media-readiness-report.json — media_pending' },

  // Cardiac Arrest / ACLS
  { sourceNodeKey: 'condition:cardiac_arrest_acls', targetNodeKey: 'content:codelab:scenario:megacode_v1', relation: 'demonstrates', evidenceStatus: 'reviewed', provenanceRef: 'app/components/ward/CodeBlue.tsx — ready, visible' },
  { sourceNodeKey: 'condition:cardiac_arrest_acls', targetNodeKey: 'content:codelab:lesson:acls_01_systematic', relation: 'related_to', evidenceStatus: 'reviewed', provenanceRef: 'app/lib/codelab/aclsLessons.ts — ready, visible' },
  { sourceNodeKey: 'content:codelab:lesson:acls_01_systematic', targetNodeKey: 'content:codelab:lesson:acls_02_vf_vt', relation: 'next_learning_step', evidenceStatus: 'reviewed', provenanceRef: 'app/lib/codelab/aclsLessons.ts — sequential lesson ordering (acls_01 → acls_02)' },

  // Batch 6: Echo Intelligence Atlas. Every edge below is deliberately
  // pending_review — DCM/HCM have zero verified playable media and an
  // incomplete clinical/privacy review (app/lib/clinicalMedia/echoStudyRecord.ts),
  // so no comparison or demonstration involving them is asserted as
  // reviewed, even where the OTHER side (Normal) is itself ready/visible.
  // This keeps getOrbitNeighbors() returning zero DCM/HCM neighbors in
  // default learner scope, matching echoComparison.ts's own contrastive
  // gating, which likewise blocks every DCM/HCM comparison today.
  { sourceNodeKey: 'condition:dcm_phenotype', targetNodeKey: 'content:echo_batch20:cine:dilated-lv', relation: 'demonstrates', evidenceStatus: 'pending_review', provenanceRef: 'docs/case-media-resume/echo-readiness-snapshot.json (echo-a4c-dcm-e00476) — rights verified, clinical/privacy/device review incomplete' },
  { sourceNodeKey: 'condition:dcm_phenotype', targetNodeKey: 'content:echo:cine:echo-a4c-normal-cardionetworks-v1', relation: 'compares_with', evidenceStatus: 'pending_review', provenanceRef: 'app/lib/clinicalMedia/echoComparison.ts — comparison not yet eligible; DCM side is not learner-ready' },
  { sourceNodeKey: 'condition:dcm_phenotype', targetNodeKey: 'condition:heart_failure', relation: 'related_to', evidenceStatus: 'pending_review', provenanceRef: 'General clinical association (dilated cardiomyopathy is a recognized cause of heart failure) — not sourced from a specific governed reference in this repo; kept pending_review rather than asserted as reviewed.' },
  { sourceNodeKey: 'condition:hcm_phenotype', targetNodeKey: 'content:echo_batch20:cine:hypertrophic-phenotype', relation: 'demonstrates', evidenceStatus: 'pending_review', provenanceRef: 'docs/case-media-resume/echo-readiness-snapshot.json (echo-a4c-severe-hcm-mm0002) — artifact integrity verified, clinical/privacy/device review pending' },
  { sourceNodeKey: 'condition:hcm_phenotype', targetNodeKey: 'content:echo:cine:echo-a4c-normal-cardionetworks-v1', relation: 'compares_with', evidenceStatus: 'pending_review', provenanceRef: 'app/lib/clinicalMedia/echoComparison.ts — comparison not yet eligible; HCM side is not learner-ready' },
  { sourceNodeKey: 'condition:hcm_phenotype', targetNodeKey: 'condition:dcm_phenotype', relation: 'compares_with', evidenceStatus: 'pending_review', provenanceRef: 'app/lib/clinicalMedia/echoComparison.ts — comparison not yet eligible; neither side is learner-ready' },

  // Batch 7: Pathway Replay Intelligence v2. Both edges are 'reviewed' —
  // both targets are genuinely live, visible/ready catalog content, unlike
  // most of the hidden/pending_review proof edges above. Deliberately only
  // 2 of Section 12's 3 suggested links (skipping the internal
  // pathway->drill next_learning_step edge, which the Pathway Replay UI
  // itself already expresses as its own drill-stage transition) to stay
  // within the existing <=20 edge ceiling without renegotiating it again.
  { sourceNodeKey: 'condition:anterior_stemi_acs', targetNodeKey: 'content:pathway:pathway:stemi-replay-demo-v2', relation: 'related_to', evidenceStatus: 'reviewed', provenanceRef: 'app/labs/pathway-replay/page.tsx — ready, visible, fictional-simulation-only' },
  { sourceNodeKey: 'condition:cardiac_arrest_acls', targetNodeKey: 'content:pathway:drill:door-to-ecg-drill-v1', relation: 'related_to', evidenceStatus: 'reviewed', provenanceRef: 'app/lib/codelab/trainingActivity.ts (DOOR_TO_ECG_CODE_LAB_ACTIVITY) — ready, visible, Code Lab training pathway' },
]
