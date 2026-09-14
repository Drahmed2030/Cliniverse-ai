# Ward / Atlas integration and release checkpoint

Starting HEAD 045d308556bdfb40896ff3a927cffd42e492374d, qa/case-batch20-cloud.

Implemented three source-based supplementary reflections: ECG summary versus observed tracing,
missing Echo measurements, and separation of teaching media from the fictional patient's record.
Shared component opens related reviewed text cases in the existing player from Ward and Atlas.
It requires both the existing reviewer gate and a server flag for the approved case-preview
deployment. Production and other preview branches do not show these links.

This adds depth to preparation, not three new persisted simulations. Existing immutable
handover scenarios, checkpoints, clinical source, scores and PRO/StoreKit logic are unchanged.
Live database constraint was read without mutation; new persisted versions are not enabled.

Local: 35 Ward/Atlas/journey tests PASS. Targeted lint and browser test typecheck PASS.
Full local typecheck: four missing Remotion-module errors in unchanged files. Cloud clean
install will run full typecheck. Added six integrated browser scenarios (three widths x two
themes), using a synthetic reviewer and mocked GETs; all writes and external requests blocked.
Tests follow existing root app -> Ward -> related case popup -> Atlas -> Ward. They check
the new section's accessibility and global horizontal overflow; they do not establish a full
accessibility audit of every existing screen or test real subscription transactions.

## Release status
Not an Apple release candidate. Pending: artifact-specific clinical/privacy/playback review for
the five Echo candidates; media for 14 remaining cases; matched clinical source verification;
physical iPhone/Safari/safe-area QA; full real-account Ward/Atlas regression, offline behavior,
and StoreKit/Restore validation on the final signed build. No new release readiness claimed.

See MEDIA_MINI_RESEARCH_2026-09-14.md for the focused media source comparison.
