// Editorial sidecar: not part of lesson content hashes, scoring or eligibility.
export const SOURCE_CHECKED_ON = '2026-09-13'
const base = 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/'
export const LESSON_SOURCES = {
  bls: { title: 'AHA 2025 — Adult Basic Life Support', url: base + 'adult-basic-life-support' },
  als: { title: 'AHA 2025 — Adult Advanced Life Support', url: base + 'adult-advanced-life-support' },
  post: { title: 'AHA 2025 — Post-Cardiac Arrest Care', url: base + 'post-cardiac-arrest-care' },
  special: { title: 'AHA 2025 — Special Circumstances of Resuscitation', url: base + 'adult-and-pediatric-special-circumstances-of-resuscitation' },
  education: { title: 'AHA 2025 — Resuscitation Education Science', url: base + 'resuscitation-education-science' },
} as const
export interface LessonSourceReview {
  contentSha256: string
  sourceIds: readonly (keyof typeof LESSON_SOURCES)[]
  scope: string
  reviewState: 'pending'
  reviewedBy: null
  reviewedAt: null
}
const pending = (sourceIds: LessonSourceReview['sourceIds'], scope: string, contentSha256: string): LessonSourceReview => ({ contentSha256, sourceIds, scope, reviewState: 'pending', reviewedBy: null, reviewedAt: null })
export const LESSON_SOURCE_REVIEWS: Readonly<Record<string, LessonSourceReview>> = {
  bls_01_chain: pending(['bls'], 'Recognition and activation of emergency response', 'fa18c821d8d65dac0f08f761b22f08dca488b99eff6a38c9998be6750d29cb23'),
  bls_02_compressions: pending(['bls'], 'Compression rate, depth and recoil', '4816bf98a73057d4ffb485d9bb8abe5bec5fb797e86d1423be4135a98f75c3b5'),
  bls_03_ventilations: pending(['bls'], 'Ventilations and compression-to-ventilation ratio', '18e809273196889bb0812542243b7c34cfb0ebaff67c4007c10b6d8f40e1ace7'),
  bls_04_aed: pending(['bls'], 'Automated external defibrillator use', 'b305d6045d4dc02473e1f1c335d9ddb4fc5e7120ab10fd3f643ec2693373a184'),
  bls_05_airway: pending(['bls', 'special'], 'Airway obstruction and opioid-associated emergencies', '7e562bf1b889f78647d5fd0fa3e2859491ad75f1802461a6f73b8020d80cf1c9'),
  bls_06_team: pending(['bls', 'education'], 'Team practice and feedback', '2f897b843fec3c8d59e1d4563f7a437679b52868841e253876794bd04de0502c'),
  acls_01_systematic: pending(['als', 'bls'], 'Systematic assessment and adult resuscitation', 'a69a0ba8e08b9717bb06ce830a9ce8c6e067b9e880c58bd675dcda96dc971442'),
  acls_02_vf_vt: pending(['als'], 'Shockable cardiac arrest', '15fd567fcb277074577254fce88b44eb9dcc27cb71fba28dc9ddf8dfdc34fb0a'),
  acls_03_pea_asystole: pending(['als'], 'Non-shockable cardiac arrest', '17035d934ffbea9d5704dac7f5e15ecdd3024913068904b717245dce0f404a53'),
  acls_04_bradycardia: pending(['als'], 'Bradycardia assessment and management', '37231b7d4ae0ed8229f184a5e2d8bdf1f7aed8f978e0f1be3fb875730d6bdd76'),
  acls_05_tachycardia: pending(['als'], 'Tachycardia and cardioversion energies require detailed comparison', '4e0415dfefdedac693ae55fa877eaaec82649c141428de83397b84167d1f0ead'),
  acls_06_post_rosc: pending(['post'], 'Post-arrest targets and temperature management require detailed comparison', 'a3be480c712a152d6c459d826b9dcd28aa088a15a4ffd85766d267ef8e773951'),
}
export function getLessonSourceReview(id: string): LessonSourceReview | null {
  return Object.hasOwn(LESSON_SOURCE_REVIEWS, id) ? LESSON_SOURCE_REVIEWS[id] : null
}
