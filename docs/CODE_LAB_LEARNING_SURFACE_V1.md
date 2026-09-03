# Code Lab Learning Surface v1

Status: implemented locally on the isolated strategy branch; verification pending

Branch: `strategy/clinical-pathway-replay-v1`

Apple, Production, database, and external-provider impact: none

## Executive decision

Code Lab is promoted from preserved legacy code into a bounded Cliniverse product surface. It is available through both Care and Atlas, uses the verified StoreKit entitlement already owned by the release shell, and keeps one predictable return path to Care.

This change does not reactivate the legacy Arsenal interface. It reuses only the governed BLS/ACLS catalog and unified lesson player.

## Current product boundary

- Catalog version: `1.0.0-draft`
- Player: `codelab-unified-player-v1`
- Intended use: education only
- Data mode: fictional and skills training only
- Review status: draft; human review required
- Source status: lesson-level source mapping required
- Progress: device-local lesson identifiers only
- Free access: lessons 1–2 in each track
- PRO access: remaining draft lessons, using the existing verified entitlement

The interface explicitly states that it provides neither diagnosis nor treatment authority, certification, or an AHA provider card.

## Navigation contract

`Home or Atlas → Care → Code Lab → lesson → Code Lab → Care`

Code Lab is a secondary Care workspace, not a sixth bottom-navigation destination. This preserves the five-item release navigation and keeps the learning hierarchy understandable on phone and tablet.

## Recovered components

| Preserved asset | Modern role | Decision |
|---|---|---|
| `CodeLabHub` | Learning catalog and entitlement boundary | Adopted |
| `TrainingLessonPlayer` | One BLS/ACLS player | Adopted |
| `blsLessons.ts` | Draft BLS content set | Preserved; source and clinical review required |
| `aclsLessons.ts` | Draft ACLS content set | Preserved; source and clinical review required |
| Legacy `ToolsPage` Code Lab switch | Old navigation and hard-coded access | Not adopted |

## Verification requirements

Before a future Preview promotion, verify:

1. Atlas opens Code Lab directly inside Care.
2. the Care workspace switcher includes Code Lab without adding a bottom tab;
3. free users can open lessons 1–2 and a locked lesson opens the real StoreKit plan;
4. PRO users can open every lesson;
5. returning from a lesson preserves local progress and returns predictably;
6. VoiceOver labels announce completion and PRO-lock state;
7. 375 px phone, iPad portrait, iPad landscape, reduced motion, and large text do not clip controls; and
8. no network, database, or provider call is made by the learning player.

## Next bounded increment

The next Code Lab increment is not more navigation. It is a versioned lesson receipt and source-review ledger for each BLS/ACLS lesson, followed by a deterministic ECG learning track. The receipt must not be presented as certification or clinical validation.
