# Cliniverse Identity Architecture v2

Status: **DESIGN-ALIGNED / RELEASE-CANDIDATE BRAND SOURCE**

## Intent

Cliniverse belongs visibly to the NeuraOps product family without copying the NeuraOps enterprise workstation identity.

The identity bridge is:

- NeuraOps family blue leads;
- violet supports platform/integration context;
- Cliniverse keeps a cyan learning/continuity accent;
- deep navy remains the shared trust foundation;
- gold is reserved for PRO, proof, value or priority — never the core AppIcon.

## Selected product mark

**Orbit Bridge C**

The mark combines:

- an open blue C/orbit for Cliniverse;
- a cyan bridge/check path for learning continuity and decision progression;
- a white source node for evidence;
- a violet destination node for connected platform context.

It is intentionally flat and restrained:

- no glass;
- no gradients;
- no decorative metallic border;
- no medical-device pulse implication;
- no diagnosis/monitoring claim.

## Family relationship

NeuraOps:
- operations;
- Health Cloud;
- policy;
- adapters;
- integration;
- enterprise workflow.

Cliniverse:
- learning;
- reasoning;
- continuity;
- governed evidence;
- institution assignments.

Shared visual DNA:
- Deep Navy `#0B0F19`
- Family Blue `#2563EB`
- Violet `#7C3AED`
- neutral clinical surfaces

Cliniverse-specific learning accent:
- Continuity Cyan `#22C7D6`

Gold `#C9A961` remains available only for PRO/proof/value semantics.

## Asset authority

The canonical production source remains `assets/logo.svg`.

Public PWA/favicon sources under `public/icons/` must match the same approved mark.

Codemagic continues generating native iOS assets from the versioned `assets/logo.svg` source. This change does not alter Apple signing, StoreKit, entitlements, Supabase or production configuration.

## Figma authority

The visual architecture and icon directions are documented in the Cliniverse Figma file on the page:

`Identity Architecture vNext`

NeuraOps Figma files remain read-only and unchanged.

## Release verification

Before the next signed iOS build:

1. generate native assets using the existing Codemagic pipeline;
2. inspect the generated 1024×1024 AppIcon;
3. inspect launch/splash artwork on iPhone;
4. verify 29/40/60 px legibility;
5. confirm no legacy gold/glass mark remains in AppIcon, PWA or product chrome.
