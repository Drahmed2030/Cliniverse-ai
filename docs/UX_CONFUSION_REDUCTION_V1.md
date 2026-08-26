# Cliniverse UX Confusion Reduction v1

## Objective
Reduce cognitive load and make the App Store release experience coherent, predictable, and recognisable without deleting valuable capabilities.

Apple's review comment about confusion was specifically about app icon consistency. We will satisfy that literally with one final icon system, and we will also use the same principle across navigation and product surfaces.

## Release information architecture

### Primary app navigation
1. **Home** — today's status, next actions, recent progress
2. **Care** — Virtual Ward, patient journey, follow-up and escalation workflows
3. **Intelligence** — Clinical Oracle / evidence / reasoning tools
4. **Atlas** — reference, calculators, clinical tools and simulation utilities
5. **Me** — profile, Life, subscription, settings and privacy

### Why this structure
- Every primary tab answers a different user question.
- No unlabeled central action in the primary navigation.
- Profile and Life are consolidated under Me rather than competing as separate identities.
- Atlas remains a named capability library but high-risk/incomplete tools can be gated without deleting them.
- Afia is not mixed into the clinician navigation. It is treated as a separate patient-facing experience/mode and remains gated until its safety/completeness review passes.

## Entry flow
Splash → onboarding (first run only) → authentication/guest decision → Home.

Authenticated users restore session. Guest mode is educational/demo-only and must not create the appearance of a persistent clinical account.

## Interaction rules
- One primary CTA per screen where practical.
- Destructive or sensitive actions are visually secondary and require confirmation.
- If a feature is unavailable, show a clear disabled/gated state rather than a dead button.
- Never label sample/manual data as live.
- Never show provider/integration branding unless the integration is actually connected.
- Avoid duplicate profile/settings surfaces.
- All tabs use the same naming in navigation, headers, analytics and documentation.

## App Store release scope
### Ship visible
- Home
- Care (safe/demo/simulation surfaces only until healthcare-data gates pass)
- Intelligence (educational/evidence surfaces with clear limitations)
- Atlas (only validated tools; incomplete/high-risk tools gated)
- Me (real auth/profile/subscription/settings once wired)

### Gated / not presented as production-ready
- Afia patient-facing medical workflows until full review
- real-time Apple Health / Google Fit claims until connected
- autonomous diagnosis/treatment claims
- incomplete teleconsult or prescription workflows

## Visual hierarchy
- NeuraOps / Cliniverse identity consistent across icon, splash, auth and shell.
- Navy/blue/violet are primary brand colors.
- Cliniverse teal is a restrained healthcare accent.
- Gold is reserved for priority/escalation semantics.
- Avoid competing gradients and duplicate navigation treatments.

## Acceptance criteria
- A new user can explain where to go for Care, Intelligence, Tools and Account after one glance.
- No primary navigation item is unlabeled.
- No duplicated Profile vs Life identity in bottom navigation.
- Afia does not appear as an unexplained peer to clinician workflows.
- Placeholder and disconnected features are either completed or explicitly gated.
- Icon family is visually consistent across App Store, iPhone and iPad assets.
