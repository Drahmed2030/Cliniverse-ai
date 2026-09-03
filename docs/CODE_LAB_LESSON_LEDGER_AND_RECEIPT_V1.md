# Code Lab lesson ledger and receipt v1

Status: strategy preview only. Device-local. Clinical review required.

## Purpose

This contract connects each of the six BLS and six ACLS draft lessons to an
identified official source family and creates a deterministic completion receipt
after a learner passes the built-in knowledge check.

It does **not** certify the learner, validate the medical claims, replace an
approved provider course, or authorize clinical decisions.

## Source ledger boundary

- Source identities and links are recorded from official American Heart
  Association CPR and ECC pages.
- Links are stored without reproducing protected source content.
- Mapping is `provisional-source-family-only`.
- Clinical review is `not-reviewed` for every lesson until a qualified reviewer
  signs off line by line.
- The immutable snapshot identifier is
  `codelab-resuscitation-source-snapshot-2026-09-03-v1`.

## Completion receipt

The v1 receipt records the lesson, draft content version, player, source snapshot,
assessment attempts and score, and the required human-review boundary. Its ID is
deterministically derived from those fields so altered local records fail parsing.

The receipt is structural evidence of local educational completion only. It is
not a cryptographic signature, certificate, CME/CPD credit, or clinical competency
attestation.

## Migration and storage

- New progress key: `cliniverse_codelab_progress_v2`.
- Existing v1 and legacy BLS completion IDs migrate locally.
- Migration never fabricates receipts for earlier completion IDs.
- Unknown lessons, altered receipts, and orphaned receipts are discarded safely.
- No database or server write is introduced.

## Next clinical gate

Before release promotion, each lesson claim, number, algorithm step, quiz answer,
and explanation must be reviewed against the named source revision by a qualified
clinical reviewer. Corrections require a new content version and source snapshot.
