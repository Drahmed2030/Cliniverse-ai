# NeuraOps Gateway v0

## Decision

NeuraOps Gateway v0 is a server-only, provider-neutral boundary for laboratory AI connectivity. Its first adapter verifies Google Gemini 3.8 Flash connectivity without accepting user prompts, clinical documents, images, or patient data.

This gateway belongs to the isolated strategy branch. It does not alter the Cliniverse Apple release, production deployment, subscription contract, or database.

## Safety boundary

- The only permitted data mode is `fictional-simulation`.
- The probe prompt is fixed in source and contains no medical or patient content.
- `GET /api/labs/gemini/health` reports configuration booleans only and never calls Google.
- `POST /api/labs/gemini/health` requires a server-side diagnostic bearer token.
- The POST probe is blocked in Vercel Production even when configured.
- The API key is sent in the `x-goog-api-key` header and is never included in the URL or response.
- Provider response bodies are not returned or logged.
- Every active probe creates a versioned **NeuraOps Trust Receipt** and a correlated Flight Recorder event.
- The receipt stores hashes of the input and endpoint contracts, not the prompt, response, key, or authorization token.

## Preview configuration

Configure these variables for Preview only:

```text
GEMINI_API_KEY=<Google AI Studio laboratory key>
NEURAOPS_GEMINI_LAB_ENABLED=true
NEURAOPS_DIAGNOSTIC_TOKEN=<new long random diagnostic token>
```

If the Vercel project already uses the server-only `GOOGLE_AI_API_KEY` name, the gateway accepts it as a compatibility alias. `GEMINI_API_KEY` remains the preferred name for new environments. Never duplicate or rotate a working key solely to rename the variable.

Keep `NEURAOPS_GEMINI_LAB_ENABLED=false` in Production. Do not use any `NEXT_PUBLIC_` prefix.

## Verification

Readiness (safe and unauthenticated):

```bash
curl https://<preview-host>/api/labs/gemini/health
```

Active laboratory probe (authorized operators only):

```bash
curl -X POST https://<preview-host>/api/labs/gemini/health \
  -H "Authorization: Bearer <diagnostic-token>"
```

A successful response reports `code: "ready"`, model `gemini-3.8-flash`, latency, `markerMatched: true`, and a Trust Receipt containing the policy and template versions, correlation identifiers, contract hashes, data classification, and human-review boundary. A `404` from Google is translated to `model-not-found`, making the previously observed failure diagnosable without exposing the provider body.

The connectivity request uses Google's minimal documented REST contract: `model` and fixed `input` only. It omits deprecated sampling parameters and optional reasoning configuration until connectivity is proven. Structured provider failures still render their Trust Receipt instead of collapsing into a generic gateway status. The gateway maps only bounded diagnostic categories (for example `invalid-api-key`, `model-unavailable`, or `region-restricted`) and discards the provider's raw error message.

## Preview operator console

`/labs/gemini-diagnostic` provides a no-index, Preview-only control surface for the same fixed probe. It accepts only the diagnostic token, keeps that token in component memory, clears it immediately after the request, and never writes it to browser storage. The page is unavailable when `VERCEL_ENV=production` and exposes no free-text AI or patient-data input.

The receipt is an operational provenance artifact. It is not a digital signature, clinical validation, regulatory certification, or proof that model output is medically correct.

## Next gate

No clinical feature may call this gateway until there is an approved data-classification contract, prompt/version registry, audit record, human-review workflow, evaluation dataset, and legal privacy basis for the target region.
