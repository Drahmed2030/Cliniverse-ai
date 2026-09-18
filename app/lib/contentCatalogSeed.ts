// Deterministic seed manifest for public.clinical_content_catalog.
//
// This is the single source of truth for both (a) seeding/reconciling the
// Supabase catalog table (scripts/seed-clinical-content-catalog.mjs reads
// this file) and (b) the app's local fallback when the catalog table is
// unreachable (app/lib/contentCatalog.ts imports this directly). There is
// intentionally no second, independently-maintained list of counts anywhere
// — see docs/CLINICAL_CONTENT_CATALOG_V1.md.
//
// Every item below was verified against current HEAD at the time this file
// was written (2026-09-18) — see provenance_ref for the exact source file.
// Nothing here is fabricated: items that exist only on an unmerged branch,
// or that are unverifiable from this checkout, are deliberately left out
// rather than guessed at.

export type AccessTier = 'free' | 'pro' | 'institution'
export type Visibility = 'visible' | 'hidden'
export type Readiness = 'ready' | 'review_required' | 'media_pending' | 'labs'

export interface ClinicalContentCatalogSeedItem {
  /** Only present when this item came from a real Supabase row — the seed manifest itself never sets this, since seed items don't have a DB id until they're written. Used by app/lib/clinicalOrbit.ts to join a graph node's content_catalog_id back to the catalog item it references. */
  id?: string
  source_key: string
  module: string
  content_type: string
  title: string
  category?: string
  access_tier: AccessTier
  visibility: Visibility
  readiness: Readiness
  route?: string
  provenance_ref: string
  source_revision?: string
  sort_order?: number
}

export const CLINICAL_CONTENT_CATALOG_SEED: ClinicalContentCatalogSeedItem[] = [
  // ── Ward: 7 cases, each wardData.ts patient (w1-w7) backed 1:1 by a
  // templates.ts 3-station decision journey. All wired live via WardIndex,
  // reachable from Learn. Confirmed by templateId cross-reference — every
  // wardData.ts case maps to an existing templates.ts template, and vice
  // versa; none of the 7 are orphaned in either direction.
  { source_key: 'stemi_anterior', module: 'ward', content_type: 'case', title: 'Anterior STEMI — Post PCI Day 2', category: 'Cardiology', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/ward/wardData.ts#w1, app/lib/ward/templates.ts', sort_order: 1 },
  { source_key: 'stroke_ischemic', module: 'ward', content_type: 'case', title: 'Acute Ischemic Stroke', category: 'Neurology', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/ward/wardData.ts#w2, app/lib/ward/templates.ts', sort_order: 2 },
  { source_key: 'dka', module: 'ward', content_type: 'case', title: 'Diabetic Ketoacidosis', category: 'Endocrine', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/ward/wardData.ts#w3, app/lib/ward/templates.ts', sort_order: 3 },
  { source_key: 'cap_severe', module: 'ward', content_type: 'case', title: 'Severe Community-Acquired Pneumonia', category: 'Respiratory', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/ward/wardData.ts#w4, app/lib/ward/templates.ts', sort_order: 4 },
  { source_key: 'acs_ruleout', module: 'ward', content_type: 'case', title: 'ACS Rule-Out', category: 'Cardiology', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/ward/wardData.ts#w5, app/lib/ward/templates.ts', sort_order: 5 },
  { source_key: 'preeclampsia', module: 'ward', content_type: 'case', title: 'Pre-eclampsia', category: 'Obstetrics', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/ward/wardData.ts#w6, app/lib/ward/templates.ts', sort_order: 6 },
  { source_key: 'postop_ulcer', module: 'ward', content_type: 'case', title: 'Post-operative Ulcer', category: 'Surgery', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/ward/wardData.ts#w7, app/lib/ward/templates.ts', sort_order: 7 },

  // ── Ward extra: 8 case IDs in wardTemplatesExtra.ts. Verified this batch:
  // this file is imported by NOTHING (grep -rln across app/ found only the
  // file itself) — genuinely unreferenced source, not reachable from any
  // route, not just PRO-gated or labs-scoped.
  { source_key: 'aki_severe', module: 'ward', content_type: 'case', title: 'Severe AKI', category: 'Nephrology', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/ward/wardTemplatesExtra.ts (unreferenced by any importer)', sort_order: 8 },
  { source_key: 'copd_exacerbation', module: 'ward', content_type: 'case', title: 'COPD Exacerbation', category: 'Respiratory', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/ward/wardTemplatesExtra.ts (unreferenced by any importer)', sort_order: 9 },
  { source_key: 'liver_failure_acute', module: 'ward', content_type: 'case', title: 'Acute Liver Failure', category: 'Gastroenterology', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/ward/wardTemplatesExtra.ts (unreferenced by any importer)', sort_order: 10 },
  { source_key: 'hypertensive_emergency', module: 'ward', content_type: 'case', title: 'Hypertensive Emergency', category: 'Cardiology', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/ward/wardTemplatesExtra.ts (unreferenced by any importer)', sort_order: 11 },
  { source_key: 'dvt_proximal', module: 'ward', content_type: 'case', title: 'Proximal DVT', category: 'Vascular', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/ward/wardTemplatesExtra.ts (unreferenced by any importer)', sort_order: 12 },
  { source_key: 'bacterial_meningitis', module: 'ward', content_type: 'case', title: 'Bacterial Meningitis', category: 'Infectious Disease', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/ward/wardTemplatesExtra.ts (unreferenced by any importer)', sort_order: 13 },
  { source_key: 'pancreatitis_severe', module: 'ward', content_type: 'case', title: 'Severe Pancreatitis', category: 'Gastroenterology', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/ward/wardTemplatesExtra.ts (unreferenced by any importer)', sort_order: 14 },
  { source_key: 'thyroid_storm', module: 'ward', content_type: 'case', title: 'Thyroid Storm', category: 'Endocrine', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/ward/wardTemplatesExtra.ts (unreferenced by any importer)', sort_order: 15 },

  // ── ECG image-bank: 7 cases, real attributed Wikimedia Commons images,
  // clinically corrected 2026-09-17 (commit 1cdacf9). Live, FREE-tagged in
  // AtlasReleaseCatalog, reachable at /labs/ecg-challenge.
  { source_key: 'stemi-lateral', module: 'ecg', content_type: 'case', title: 'Lateral STEMI', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/ecg-challenge', provenance_ref: 'app/components/EcgChallenge.tsx, public/ecg-cases/ATTRIBUTION.md', sort_order: 20 },
  { source_key: 'afib-rvr', module: 'ecg', content_type: 'case', title: 'Atrial Fibrillation with RVR', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/ecg-challenge', provenance_ref: 'app/components/EcgChallenge.tsx, public/ecg-cases/ATTRIBUTION.md', sort_order: 21 },
  { source_key: 'complete-hb', module: 'ecg', content_type: 'case', title: 'Complete (3rd-degree) Heart Block', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/ecg-challenge', provenance_ref: 'app/components/EcgChallenge.tsx, public/ecg-cases/ATTRIBUTION.md', sort_order: 22 },
  { source_key: 'vt-monomorphic', module: 'ecg', content_type: 'case', title: 'Monomorphic Ventricular Tachycardia', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/ecg-challenge', provenance_ref: 'app/components/EcgChallenge.tsx, public/ecg-cases/ATTRIBUTION.md', sort_order: 23 },
  { source_key: 'hyperkalemia-severe', module: 'ecg', content_type: 'case', title: 'Severe Hyperkalemia', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/ecg-challenge', provenance_ref: 'app/components/EcgChallenge.tsx, public/ecg-cases/ATTRIBUTION.md', sort_order: 24 },
  { source_key: 'wellens', module: 'ecg', content_type: 'case', title: 'Wellens Syndrome', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/ecg-challenge', provenance_ref: 'app/components/EcgChallenge.tsx, public/ecg-cases/ATTRIBUTION.md', sort_order: 25 },
  { source_key: 'brugada', module: 'ecg', content_type: 'case', title: 'Brugada Pattern — Type 1', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/ecg-challenge', provenance_ref: 'app/components/EcgChallenge.tsx, public/ecg-cases/ATTRIBUTION.md', sort_order: 26 },

  // ── batch20 ECG: 11 case IDs, text confirmed, zero matching media
  // (docs/case-media-resume/media-readiness-report.json, status=missing).
  { source_key: 'anterior-stemi', module: 'ecg_batch20', content_type: 'case', title: 'Anterior STEMI (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 30 },
  { source_key: 'non-st-elevation', module: 'ecg_batch20', content_type: 'case', title: 'NSTE-ACS (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 31 },
  { source_key: 'acute-heart-failure', module: 'ecg_batch20', content_type: 'case', title: 'Acute Heart Failure (batch20, Integrated)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 32 },
  { source_key: 'hypertensive-emergency-b20', module: 'ecg_batch20', content_type: 'case', title: 'Hypertensive Emergency (batch20, Integrated)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 33 },
  { source_key: 'atrial-fibrillation', module: 'ecg_batch20', content_type: 'case', title: 'Atrial Fibrillation (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 34 },
  { source_key: 'atrial-flutter', module: 'ecg_batch20', content_type: 'case', title: 'Atrial Flutter (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 35 },
  { source_key: 'regular-narrow-tachycardia', module: 'ecg_batch20', content_type: 'case', title: 'Regular Narrow-Complex Tachycardia (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 36 },
  { source_key: 'complete-av-block', module: 'ecg_batch20', content_type: 'case', title: 'Complete AV Block (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 37 },
  { source_key: 'wide-complex-tachycardia', module: 'ecg_batch20', content_type: 'case', title: 'Wide-Complex Tachycardia (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 38 },
  { source_key: 'qt-review', module: 'ecg_batch20', content_type: 'case', title: 'QT Review (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 39 },
  { source_key: 'hyperkalaemia', module: 'ecg_batch20', content_type: 'case', title: 'Hyperkalaemia (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 40 },

  // ── Echo: one live asset (Normal A4C), plus the batch20 Echo set.
  { source_key: 'echo-a4c-normal-cardionetworks-v1', module: 'echo', content_type: 'cine', title: 'Normal A4C', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/echo-preview', provenance_ref: 'app/lib/clinicalMedia/licensedEchoAsset.ts, echoClinicalReviewAttestation.ts', sort_order: 50 },
  { source_key: 'a4c-orientation', module: 'echo_batch20', content_type: 'cine', title: 'A4C Orientation (batch20, reviewer link)', access_tier: 'free', visibility: 'hidden', readiness: 'labs', route: '/labs/echo-account-review', provenance_ref: 'content/medical/caseMedia.ts, docs/case-media-resume/media-readiness-report.json', sort_order: 51 },
  { source_key: 'dilated-lv', module: 'echo_batch20', content_type: 'cine', title: 'Dilated LV / DCM (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'content/medical/caseMedia.ts (deferredCaseMedia)', sort_order: 52 },
  { source_key: 'hypertrophic-phenotype', module: 'echo_batch20', content_type: 'cine', title: 'Hypertrophic Phenotype / HCM (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'content/medical/caseMedia.ts (deferredCaseMedia)', sort_order: 53 },
  { source_key: 'aortic-stenosis', module: 'echo_batch20', content_type: 'cine', title: 'Aortic Stenosis (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'content/medical/caseMedia.ts (deferredCaseMedia)', sort_order: 54 },
  { source_key: 'mitral-regurgitation', module: 'echo_batch20', content_type: 'cine', title: 'Mitral Regurgitation (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'content/medical/caseMedia.ts (deferredCaseMedia)', sort_order: 55 },
  { source_key: 'pericardial-effusion', module: 'echo_batch20', content_type: 'cine', title: 'Pericardial Effusion (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'content/medical/caseMedia.ts (deferredCaseMedia)', sort_order: 56 },
  { source_key: 'diastolic-function', module: 'echo_batch20', content_type: 'cine', title: 'Diastolic Function (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 57 },
  { source_key: 'rv-strain', module: 'echo_batch20', content_type: 'cine', title: 'RV Strain (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 58 },
  { source_key: 'echo-quality', module: 'echo_batch20', content_type: 'cine', title: 'Echo Image Quality (batch20)', access_tier: 'free', visibility: 'hidden', readiness: 'media_pending', provenance_ref: 'docs/case-media-resume/media-readiness-report.json', sort_order: 59 },

  // ── Code Lab: 6 ACLS + 6 BLS lessons, wired live. Megacode v1 wired live;
  // Megacode v2 exists only on branch feature/megacode-v2 (not in current
  // HEAD) — excluded, no local file to catalog.
  { source_key: 'acls_01_systematic', module: 'codelab', content_type: 'lesson', title: 'ACLS: Systematic Approach', category: 'ACLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/aclsLessons.ts', sort_order: 60 },
  { source_key: 'acls_02_vf_vt', module: 'codelab', content_type: 'lesson', title: 'ACLS: VF/pVT', category: 'ACLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/aclsLessons.ts', sort_order: 61 },
  { source_key: 'acls_03_pea_asystole', module: 'codelab', content_type: 'lesson', title: 'ACLS: PEA/Asystole', category: 'ACLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/aclsLessons.ts', sort_order: 62 },
  { source_key: 'acls_04_bradycardia', module: 'codelab', content_type: 'lesson', title: 'ACLS: Bradycardia', category: 'ACLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/aclsLessons.ts', sort_order: 63 },
  { source_key: 'acls_05_tachycardia', module: 'codelab', content_type: 'lesson', title: 'ACLS: Tachycardia', category: 'ACLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/aclsLessons.ts', sort_order: 64 },
  { source_key: 'acls_06_post_rosc', module: 'codelab', content_type: 'lesson', title: 'ACLS: Post-ROSC Care', category: 'ACLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/aclsLessons.ts', sort_order: 65 },
  { source_key: 'bls_01_chain', module: 'codelab', content_type: 'lesson', title: 'BLS: Chain of Survival', category: 'BLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/blsLessons.ts', sort_order: 66 },
  { source_key: 'bls_02_compressions', module: 'codelab', content_type: 'lesson', title: 'BLS: Compressions', category: 'BLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/blsLessons.ts', sort_order: 67 },
  { source_key: 'bls_03_ventilations', module: 'codelab', content_type: 'lesson', title: 'BLS: Ventilations', category: 'BLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/blsLessons.ts', sort_order: 68 },
  { source_key: 'bls_04_aed', module: 'codelab', content_type: 'lesson', title: 'BLS: AED Use', category: 'BLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/blsLessons.ts', sort_order: 69 },
  { source_key: 'bls_05_airway', module: 'codelab', content_type: 'lesson', title: 'BLS: Airway', category: 'BLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/blsLessons.ts', sort_order: 70 },
  { source_key: 'bls_06_team', module: 'codelab', content_type: 'lesson', title: 'BLS: Team Dynamics', category: 'BLS', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/lib/codelab/blsLessons.ts', sort_order: 71 },
  { source_key: 'megacode_v1', module: 'codelab', content_type: 'scenario', title: 'Megacode', category: 'Simulation', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/components/ward/CodeBlue.tsx', sort_order: 72 },

  // ── Cardiology Operations: 5-module PRO workspace, merged and wired into
  // WardIndex/ReleaseApp behind canAccessPremium. Cataloged as one workspace
  // item, not 5 separate routes — its modules are internal tabs, not
  // independently addressable content.
  { source_key: 'cardiology_operations', module: 'cardiology_ops', content_type: 'workspace', title: 'Cardiology Operations', category: 'Simulation', access_tier: 'pro', visibility: 'visible', readiness: 'ready', route: '/?view=learn', provenance_ref: 'app/components/ward/cardiology/*, app/components/ReleaseApp.tsx (careWorkspace=cardiology)', sort_order: 80 },

  // ── Clinical Reference proxies: live, FREE, unauthenticated passthroughs.
  { source_key: 'fda_openfda', module: 'reference', content_type: 'tool', title: 'FDA openFDA Lookup', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/api/fda', provenance_ref: 'app/api/fda/route.ts', sort_order: 90 },
  // Batch 8: this route was previously mislabeled — it called openFDA +
  // PubMed, not RxNorm. Rewritten to a real RxNav-backed RxNorm identity
  // adapter; provenance_ref/title now match what it actually does.
  { source_key: 'rxnorm', module: 'reference', content_type: 'tool', title: 'RxNorm Lookup', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/api/rxnorm', provenance_ref: 'app/api/rxnorm/route.ts (Batch 8: rewritten to call RxNav/RxNorm; previously called openFDA+PubMed under a mismatched title)', sort_order: 91 },
  { source_key: 'dailymed', module: 'reference', content_type: 'tool', title: 'DailyMed/SPL Lookup', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/api/dailymed', provenance_ref: 'app/api/dailymed/route.ts (Batch 8, new)', sort_order: 91.5 },
  { source_key: 'who_meds', module: 'reference', content_type: 'tool', title: 'WHO Medicines Reference', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/api/who-meds', provenance_ref: 'app/api/who-meds/route.ts', sort_order: 92 },
  { source_key: 'pubmed', module: 'reference', content_type: 'tool', title: 'PubMed Search', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/api/pubmed', provenance_ref: 'app/api/pubmed/route.ts', sort_order: 93 },
  { source_key: 'clinical_trials', module: 'reference', content_type: 'tool', title: 'ClinicalTrials.gov Search', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/api/clinical-trials', provenance_ref: 'app/api/clinical-trials/route.ts', sort_order: 94 },
  { source_key: 'doc_analyzer', module: 'reference', content_type: 'tool', title: 'Doc Analyzer', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/api/analyze-doc', provenance_ref: 'app/api/analyze-doc/route.ts, app/components/DocAnalyzer.tsx (PHI/DLP contract not yet approved)', sort_order: 95 },
  // Batch 8: superseded the Batch 5 row. The old ClinicalCalculators.tsx
  // "ready" rating was based on a formula with a real bug (age scored via
  // two independent booleans, allowing an impossible double-count and a
  // max score of 10 instead of 9) — see
  // app/lib/clinicalReference/calculatorRegistry.ts's header comment for
  // the full audit. The corrected calculator is now live and reachable at
  // /labs/clinical-reference, but its interpretation/management text has
  // not had a fresh human clinical review pass in this batch, so
  // readiness is honestly 'review_required' (matching this registry's own
  // learnerReadiness), not carried over as 'ready'. visibility='visible'
  // + readiness='review_required' matches the existing doc_analyzer
  // pattern above: the tool is genuinely reachable, but won't surface in
  // a learner-facing query until reviewed (see isAvailable()).
  { source_key: 'cha2ds2_vasc', module: 'reference', content_type: 'calculator', title: 'CHA₂DS₂-VASc', category: 'cardiology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/calculatorRegistry.ts (cha2ds2_vasc) — corrected age-scoring bug, live at /labs/clinical-reference', sort_order: 96 },
  { source_key: 'cha2ds2_va', module: 'reference', content_type: 'calculator', title: 'CHA₂DS₂-VA', category: 'cardiology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/calculatorRegistry.ts (cha2ds2_va) — sex-neutral 2024 ESC-positioned variant', sort_order: 96.1 },
  { source_key: 'timi_nstemi', module: 'reference', content_type: 'calculator', title: 'TIMI Risk Score (NSTEMI/UA)', category: 'cardiology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/calculatorRegistry.ts (timi_nstemi)', sort_order: 96.2 },
  { source_key: 'wells_pe', module: 'reference', content_type: 'calculator', title: 'Wells Score (PE)', category: 'pulmonology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/calculatorRegistry.ts (wells_pe)', sort_order: 96.3 },
  { source_key: 'heart_score', module: 'reference', content_type: 'calculator', title: 'HEART Score', category: 'cardiology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/calculatorRegistry.ts (heart_score)', sort_order: 96.4 },
  { source_key: 'curb_65', module: 'reference', content_type: 'calculator', title: 'CURB-65', category: 'pulmonology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/calculatorRegistry.ts (curb_65)', sort_order: 96.5 },
  { source_key: 'qsofa', module: 'reference', content_type: 'calculator', title: 'qSOFA', category: 'critical_care', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/calculatorRegistry.ts (qsofa) — corrected "activate sepsis protocol" command language to an evaluation prompt', sort_order: 96.6 },
  { source_key: 'clinical_reference_drug_identity', module: 'reference', content_type: 'drug_reference', title: 'Drug Identity Reference (RxNorm)', category: 'pharmacology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/drugIdentity.ts — 12-drug governed seed + live RxNorm adapter', sort_order: 97 },
  { source_key: 'clinical_reference_renal_dosing', module: 'reference', content_type: 'renal_rule', title: 'Renal Dosing Reference', category: 'pharmacology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/renalDosingRules.ts — 8 governed drug dosing rules, restructured from RenalDosingAI.tsx, LLM authority removed', sort_order: 98 },
  { source_key: 'clinical_reference_drug_interactions', module: 'reference', content_type: 'interaction_rule', title: 'Drug Interaction Reference', category: 'pharmacology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/drugInteractionRules.ts — 9 governed interaction pairs, restructured from ClinicalStrip.tsx, LLM authority removed', sort_order: 99 },
  { source_key: 'clinical_reference_label_evidence', module: 'reference', content_type: 'evidence_source', title: 'Drug Label Evidence (DailyMed)', category: 'pharmacology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/lib/clinicalReference/drugLabelEvidence.ts — governed seed summaries + live DailyMed identity/version adapter', sort_order: 100 },
  { source_key: 'clinical_reference_workspace', module: 'reference', content_type: 'reference_workspace', title: 'Clinical Reference Workspace', category: 'pharmacology', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/clinical-reference', provenance_ref: 'app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx — search-first workspace joining calculators, drug identity, dosing and interactions', sort_order: 101 },

  // ── ClinicalLibrary: 7 real cases across 5 specialties with backing
  // content. readiness=ready because the case content itself is real and
  // complete; visibility=hidden because ClinicalLibrary.tsx and its only
  // importer (ToolsPage.tsx) are confirmed unreachable from ReleaseApp —
  // nothing imports ToolsPage, and no /tools route exists. This is the
  // component that previously claimed "500+ cases, 8 specialties."
  // category holds the lowercase specialty id (matching ClinicalLibrary.tsx's
  // own CASES/SPECIALTIES keys) rather than a display label, so the
  // component can group its own catalog rows without a second lookup table.
  { source_key: 'c1', module: 'clinical_library', content_type: 'case', title: 'Anterior STEMI', category: 'cardiology', access_tier: 'free', visibility: 'hidden', readiness: 'ready', provenance_ref: 'app/components/ClinicalLibrary.tsx (component unreachable — see docs/CLINICAL_CONTENT_CATALOG_V1.md)', sort_order: 100 },
  { source_key: 'c2', module: 'clinical_library', content_type: 'case', title: 'Acute Decompensated Heart Failure', category: 'cardiology', access_tier: 'free', visibility: 'hidden', readiness: 'ready', provenance_ref: 'app/components/ClinicalLibrary.tsx (component unreachable)', sort_order: 101 },
  { source_key: 'c3', module: 'clinical_library', content_type: 'case', title: 'Hypertensive Emergency', category: 'cardiology', access_tier: 'free', visibility: 'hidden', readiness: 'ready', provenance_ref: 'app/components/ClinicalLibrary.tsx (component unreachable)', sort_order: 102 },
  { source_key: 'n1', module: 'clinical_library', content_type: 'case', title: 'Acute Ischemic Stroke', category: 'neurology', access_tier: 'free', visibility: 'hidden', readiness: 'ready', provenance_ref: 'app/components/ClinicalLibrary.tsx (component unreachable)', sort_order: 103 },
  { source_key: 'i1', module: 'clinical_library', content_type: 'case', title: 'Septic Shock', category: 'infectious', access_tier: 'free', visibility: 'hidden', readiness: 'ready', provenance_ref: 'app/components/ClinicalLibrary.tsx (component unreachable)', sort_order: 104 },
  { source_key: 'r1', module: 'clinical_library', content_type: 'case', title: 'Massive Pulmonary Embolism', category: 'respiratory', access_tier: 'free', visibility: 'hidden', readiness: 'ready', provenance_ref: 'app/components/ClinicalLibrary.tsx (component unreachable)', sort_order: 105 },
  { source_key: 'cc1', module: 'clinical_library', content_type: 'case', title: 'ARDS Post-COVID Pneumonia', category: 'critical', access_tier: 'free', visibility: 'hidden', readiness: 'ready', provenance_ref: 'app/components/ClinicalLibrary.tsx (component unreachable)', sort_order: 106 },

  // ── Board/Academy content — confirmed unreachable from ReleaseApp this
  // batch (no importer in ReleaseApp.tsx, app/components/release/, or
  // app/components/ward/), consistent with the master report's "not
  // live-tested" note.
  { source_key: 'clinical_academy', module: 'academy', content_type: 'workspace', title: 'Clinical Academy', access_tier: 'pro', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/components/ClinicalAcademy.tsx (confirmed unreachable from ReleaseApp — no importer found)', sort_order: 110 },

  // ── Batch 6: Echo Intelligence Atlas phenotypes. content_type='phenotype'
  // is distinct from the existing echo/echo_batch20 'cine' rows above — a
  // phenotype groups studies, it is not itself a cine. Readiness is derived
  // from app/lib/clinicalMedia/echoPhenotype.ts's deriveEchoPhenotypeReadiness
  // (weakest member study wins) and mirrored here by hand; see
  // docs/ECHO_INTELLIGENCE_ATLAS_V1.md for the reconciliation. Normal is
  // ready/visible because its one member study (the existing 'echo' module
  // row above) already is; DCM/HCM are hidden/review_required because their
  // member studies have zero verified playable media and an incomplete
  // clinical/privacy review — see app/lib/clinicalMedia/echoStudyRecord.ts.
  { source_key: 'echo-phenotype-normal', module: 'echo', content_type: 'phenotype', title: 'Normal (phenotype)', category: 'cardiology', access_tier: 'free', visibility: 'visible', readiness: 'ready', provenance_ref: 'app/lib/clinicalMedia/echoPhenotype.ts (echo-phenotype:normal)', sort_order: 111 },
  { source_key: 'echo-phenotype-dcm', module: 'echo_batch20', content_type: 'phenotype', title: 'Dilated cardiomyopathy (phenotype)', category: 'cardiology', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/clinicalMedia/echoPhenotype.ts (echo-phenotype:dcm); docs/case-media-resume/echo-readiness-snapshot.json (echo-a4c-dcm-e00476)', sort_order: 112 },
  { source_key: 'echo-phenotype-hcm', module: 'echo_batch20', content_type: 'phenotype', title: 'Hypertrophic cardiomyopathy (phenotype)', category: 'cardiology', access_tier: 'free', visibility: 'hidden', readiness: 'review_required', provenance_ref: 'app/lib/clinicalMedia/echoPhenotype.ts (echo-phenotype:hcm); docs/case-media-resume/echo-readiness-snapshot.json (echo-a4c-severe-hcm-mm0002)', sort_order: 113 },
  // Next-best-evidence learning activity — tied to the one learner-ready
  // Echo study (Normal A4C); see app/lib/competency/echoLearningActivity.ts.
  { source_key: 'echo-activity-a4c-normal-next-best-evidence', module: 'echo', content_type: 'activity', title: 'A4C Normal: What would you inspect next?', category: 'cardiology', access_tier: 'free', visibility: 'visible', readiness: 'ready', provenance_ref: 'app/lib/competency/echoLearningActivity.ts (echo-activity:a4c-normal-next-best-evidence)', sort_order: 114 },

  // ── Batch 7: Pathway Replay Intelligence v2. content_type differentiates
  // 'pathway' (the governed replay/closure experience itself), 'drill' (the
  // targeted Code Lab practice activity it links to), 'replay_activity'
  // (the reassessment/closure evidence-review step), and 'receipt_schema'
  // (the tamper-evident receipt contract itself — a governance artifact,
  // never learner-browsable content, kept hidden). None of these count as
  // a clinical case; see app/lib/cardiology/pathwaySession.ts.
  { source_key: 'pathway-replay-stemi-demo-v2', module: 'pathway', content_type: 'pathway', title: 'STEMI Pathway Replay (fictional demonstration)', category: 'cardiology', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/pathway-replay', provenance_ref: 'app/lib/cardiology/pathwayReplayAgents.ts (STEMI_REPLAY_DEMO); app/labs/pathway-replay/page.tsx — live, reachable', sort_order: 115 },
  { source_key: 'pathway-replay-door-to-ecg-drill-v1', module: 'pathway', content_type: 'drill', title: 'Door-to-ECG acquisition drill', category: 'cardiology', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/pathway-replay', provenance_ref: 'app/lib/codelab/trainingActivity.ts (DOOR_TO_ECG_CODE_LAB_ACTIVITY) — live, reachable from the pathway drill stage', sort_order: 116 },
  { source_key: 'pathway-replay-reassessment-closure-v1', module: 'pathway', content_type: 'replay_activity', title: 'Reassessment and closure brief', category: 'cardiology', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/pathway-replay', provenance_ref: 'app/lib/cardiology/pathwaySession.ts (completePathwayReassessment, createPathwayClosureBrief) — live, reachable from the pathway reassessment stage', sort_order: 117 },
  { source_key: 'pathway-replay-receipt-v2-schema', module: 'pathway', content_type: 'receipt_schema', title: 'Pathway Replay tamper-evident receipt schema', category: 'cardiology', access_tier: 'free', visibility: 'hidden', readiness: 'labs', provenance_ref: 'app/lib/codelab/trainingActivity.ts, app/lib/cardiology/pathwayEvent.ts — governance/schema artifact, never learner-browsable', sort_order: 118 },

  // ── Batch 9: Resuscitation Intelligence Foundation. content_type
  // differentiates 'simulation' (the overall engine/workspace capability)
  // from 'scenario' (each specific governed manifest), plus 'drill',
  // 'debrief' and 'competency_map' — none counted as a clinical case.
  //
  // Governance fix (post-Batch-9 external verification): the three
  // governed scenario manifests below each declare their OWN
  // reviewStatus as 'pending_clinical_review' (see
  // app/lib/resuscitation/scenarios/*) — no real completed clinical
  // review exists in repo evidence for any of them yet. Catalog truth
  // must match that, so these three rows are readiness: 'review_required',
  // not 'ready' — matching the exact same visible+review_required pattern
  // Batch 8 already established for CHA2DS2-VASc/-VA and TIMI (rows
  // above): still listed/discoverable, never learner-launchable until a
  // real review promotes them. The overall simulation engine capability
  // and the drill/debrief/competency_map rows below are NOT scenario
  // manifests themselves (no clinical-algorithm content of their own to
  // review) and correctly remain ready.
  { source_key: 'resuscitation_simulation_engine', module: 'resuscitation', content_type: 'simulation', title: 'Resuscitation Simulation Engine', category: 'resuscitation', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/resuscitation-hub', provenance_ref: 'app/lib/resuscitation/scenarioEngine.ts, app/labs/resuscitation-hub/ResuscitationHub.tsx — live, reachable', sort_order: 140 },
  { source_key: 'resus_vf_pvt_v1', module: 'resuscitation', content_type: 'scenario', title: 'Ventricular Fibrillation / Pulseless VT', category: 'resuscitation', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/resuscitation-hub', provenance_ref: 'app/lib/resuscitation/scenarios/vfPvtScenario.ts — reviewStatus pending_clinical_review, not yet learner-launchable', sort_order: 141 },
  { source_key: 'resus_pea_asystole_v1', module: 'resuscitation', content_type: 'scenario', title: 'PEA / Asystole', category: 'resuscitation', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/resuscitation-hub', provenance_ref: 'app/lib/resuscitation/scenarios/peaAsystoleScenario.ts — reviewStatus pending_clinical_review, not yet learner-launchable', sort_order: 142 },
  { source_key: 'resus_unstable_bradycardia_v1', module: 'resuscitation', content_type: 'scenario', title: 'Unstable Bradycardia', category: 'resuscitation', access_tier: 'free', visibility: 'visible', readiness: 'review_required', route: '/labs/resuscitation-hub', provenance_ref: 'app/lib/resuscitation/scenarios/unstableBradycardiaScenario.ts — reviewStatus pending_clinical_review, not yet learner-launchable', sort_order: 143 },
  { source_key: 'resuscitation_codelab_drills', module: 'resuscitation', content_type: 'drill', title: 'Resuscitation Code Lab Drills', category: 'resuscitation', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/resuscitation-hub', provenance_ref: 'app/lib/resuscitation/curriculumContract.ts — reframes existing app/lib/codelab/blsLessons.ts, aclsLessons.ts practice blocks as drills; no second drill framework', sort_order: 144 },
  { source_key: 'resuscitation_debrief_engine', module: 'resuscitation', content_type: 'debrief', title: 'Resuscitation Debrief Engine', category: 'resuscitation', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/resuscitation-hub', provenance_ref: 'app/lib/resuscitation/debriefEngine.ts — deterministic, event-informed REACTION/DESCRIPTION/ANALYSIS/SUMMARY/NEXT PRACTICE debrief', sort_order: 145 },
  { source_key: 'resuscitation_competency_map', module: 'resuscitation', content_type: 'competency_map', title: 'Resuscitation Competency Map', category: 'resuscitation', access_tier: 'free', visibility: 'visible', readiness: 'ready', route: '/labs/resuscitation-hub', provenance_ref: 'app/lib/resuscitation/competencyDomains.ts — 10 measurable domains; unsupported hardware metrics explicitly excluded', sort_order: 146 },
  { source_key: 'resuscitation_receipt_schema', module: 'resuscitation', content_type: 'receipt_schema', title: 'Resuscitation evidence receipt schema', category: 'resuscitation', access_tier: 'free', visibility: 'hidden', readiness: 'labs', provenance_ref: 'app/lib/resuscitation/evidenceReceipt.ts — governance/schema artifact, never learner-browsable', sort_order: 147 },
]
