# Record 10 renderer reconstruction — 2026-09-13

The lost regenerated workspace is no longer required to reproduce the reviewed drawing. This tool reconstructs its output from the retained original renderer and retained WFDB sources. It does not claim recovery of the lost revision.

Retained original renderer SHA-256: `66b9cf66c88c7dfaedb86bc065ce1ad489d6f818f6fa613ead24e2e4517520dd`.

Changes from that original: explicit paths, supported-header validation, overwrite prevention, deterministic PDF metadata, and an explicit historical prepared-date label. Waveform geometry, text, measurements and the original terminal behavior are retained. The 2026-09-12 label reproduces historical text; reconstruction occurred on 2026-09-13.

## Reproduce

Use the package versions in `reconstruction-evidence.json` with Poppler installed. No application dependencies were changed. Provide the retained four WFDB files and reviewed PDF externally; this directory contains no source waveform files.

```sh
python tools/ecg-rebuild/build_review.py --inputs /path/to/wfdb --measurements tools/ecg-rebuild/measurements.json --output /path/to/new-review.pdf --prepared-label-date 2026-09-12
python tools/ecg-rebuild/verify_review.py --reference /path/to/cliniverse-record10-regenerated-review.pdf --rebuilt /path/to/new-review.pdf --inputs /path/to/wfdb --output /path/to/new-comparison.json
```

## Observed verification

- Four of four pages: identical decompressed drawing streams, page dimensions and extracted text.
- Four of four pages: zero differing RGB pixels after Poppler rasterization at a maximum dimension of 1200 pixels.
- The four-page contact sheet was inspected visually.
- Independent repeat generation produced the same new PDF byte hash.
- Attempting to overwrite the output failed; output bytes remained unchanged.

The reviewed original and reconstructed PDF have distinct file hashes, both recorded in the manifest. Their equivalent drawings do not make the PDFs interchangeable in exact-file identity checks. Keep the existing reviewed PDF identity until a separate versioned binding is implemented.

## Eligibility boundary

This evidence resolves reproducibility of the reviewed rendering. It does not itself change the evidence ledger, learner eligibility, account persistence, publisher-checksum status or device/printing approvals. Preserve the user's previous device confirmations with their original scope. No new device execution or printing is claimed. Binding this reconstruction into the governed eligibility snapshot and testing account persistence remain integration work.
