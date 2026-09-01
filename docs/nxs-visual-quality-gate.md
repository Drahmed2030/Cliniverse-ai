# NXS Visual Quality Gate v0.1

The NeuraOps Experience System (NXS) treats visual fidelity and accessibility as release quality, not post-launch polish.

## Scope

The first automated visual regression matrix covers:

- Splash
- Onboarding
- Login
- Paywall

Across:

- iPhone viewport
- iPad viewport
- English
- Arabic RTL

## Visual regression contract

Reference screenshots must be generated in a deterministic CI environment. A pull request fails when an unapproved rendering change exceeds the accepted screenshot threshold. Intentional changes require a reviewed baseline update.

The gate must detect layout drift, clipping, safe-area regressions, typography wrapping changes, misplaced CTAs, broken RTL composition, and unexpected visual changes to the premium entry experience.

## Accessibility contract

The accessibility gate must check, at minimum:

- accessible names for interactive controls
- keyboard/focus behavior where applicable
- touch target sizing
- semantic alert/status surfaces
- color contrast for critical text and controls
- reduced-motion compatibility for non-essential motion
- readable zoom/responsive behavior
- Arabic RTL layout integrity

## Privacy and release safety

Visual tests must use fictional or synthetic fixture content only. No patient data, authentication tokens, signed transactions, production credentials, or user-generated clinical text may be captured in screenshots or accessibility artifacts.

## Rollout

Phase 1: contract and deterministic fixture surfaces.

Phase 2: Playwright screenshot baselines for iPhone and iPad viewports.

Phase 3: automated accessibility assertions in the same CI lane.

Phase 4: extend NXS coverage to NeuraOps marketing and admin surfaces so product, media, and corporate UI share one visual quality standard.
