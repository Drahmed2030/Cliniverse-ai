import type { EngagementProvider } from './provider.ts'

// Isolated on purpose: this file has no dependency on identity.ts (and so no
// transitive dependency on Supabase), which keeps the "a provider failure
// never breaks the app" guarantee directly unit-testable without a Supabase
// session or network mocking.
export async function callProviderSafely(
  label: string,
  provider: EngagementProvider,
  run: (provider: EngagementProvider) => Promise<unknown>,
): Promise<void> {
  try {
    await run(provider)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.warn(`[engagement] ${label} failed, continuing`, error)
  }
}
