# Profile & Achievements Boundary v1

## Objective
Separate authenticated identity from educational progression so Cliniverse remains understandable to users and App Store reviewers.

## Product ownership
- **Authentication** owns the user/session.
- **Profile** owns professional metadata such as display name, specialty and country.
- **Entitlement** owns Free / Pro / Institution access.
- **Life** owns personal wellness context and device integrations only when technically connected.
- **Achievements** owns XP, streaks, ranks, badges and in-platform certificates.

## Release rules
1. Do not persist multiple conflicting identity keys once real profile state is wired.
2. Do not use hard-coded specialty/country/profile defaults as if they were saved user data.
3. Ranks and badges are educational progression, not clinical seniority or licensure.
4. Certificates are in-platform achievement records only unless external accreditation is independently verified.
5. No wording may imply CME, board certification, licensing or professional credentialing without documented authorization.
6. Achievement metrics must come from the authenticated user's persisted learning records before production display.
7. Legacy localStorage progression data may be migrated only through an explicit compatibility layer, then retired.

## Legacy findings
`ProfilePage.tsx` currently mixes profile editing, localStorage identity, ranking, badges and certificate generation. It also uses hard-coded specialty/country defaults. This component is therefore a source for extraction, not the final account architecture.

## Target architecture
`Me`
- Profile
- Life
- Achievements
- Plan
- Privacy & Support

`Academy`
- Daily Cases
- Simulation
- Code Lab / Code Blue
- Board / MCQ
- Achievement detail

The same achievement record may be surfaced from Me as a summary and from Academy as learning detail, but there must be one persisted source of truth.

## Acceptance criteria
- Profile and achievements are visually and semantically distinct.
- No achievement label can be confused with a real-world medical title.
- No certificate claims external accreditation.
- Real auth/profile integration can replace legacy localStorage without changing the release information architecture.
