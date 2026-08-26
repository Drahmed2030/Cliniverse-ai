# Auth UI Wiring v1

## Objective
Replace optimistic/simulated authentication in `AuthScreen` with the Supabase-backed identity service while failing closed when providers are not configured.

## Rules
- Password sign-in completes only after Supabase returns a valid session/user result.
- Magic-link requests do not mark the user authenticated; the UI tells the user to check email and waits for the real callback/session.
- Apple and Google OAuth buttons are disabled unless explicitly enabled by configuration passed into the screen.
- Authentication errors are surfaced as controlled user-facing messages; the app must not call `onComplete` on failure.
- Guest remains a separate educational/demo path and must not masquerade as an authenticated account.
- No credentials, provider secrets, or PHI are stored in localStorage by this screen.

## Follow-up integration
The release shell should restore Supabase session on startup and only route into authenticated account surfaces when a real session exists. OAuth provider enablement requires verified Supabase provider configuration and native/App Store review of Sign in with Apple requirements.
