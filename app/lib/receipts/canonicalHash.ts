// canonicalHash — Batch 7. Shared tamper-evident hashing primitive for
// Pathway Replay Intelligence v2 (events + receipts) and any future
// receipt-shaped content. Deliberately small and dependency-free: uses the
// Web Crypto API (available in both the Node runtime this repo targets and
// every browser Next.js ships to) rather than a new npm package.
//
// This produces a TAMPER-EVIDENT STRUCTURAL HASH, never a digital signature,
// certificate, or cryptographic identity proof — there is no private key,
// no signer identity, and no non-repudiation guarantee. It only lets a
// verifier recompute the hash from a payload and confirm nothing was
// altered after creation. See docs referencing "tamper-evident structural
// receipt" for the exact language this repo uses.

/** Deterministically orders object keys (recursively) so JSON.stringify output is stable regardless of construction order. Arrays keep their given order — order is meaningful there. */
export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === 'object') {
    const sortedKeys = Object.keys(value as Record<string, unknown>).sort()
    const result: Record<string, unknown> = {}
    for (const key of sortedKeys) result[key] = canonicalize((value as Record<string, unknown>)[key])
    return result
  }
  return value
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

/** SHA-256 of the canonical JSON form of `value`, as lowercase hex. Async — Web Crypto's digest() is always a Promise. */
export async function sha256Hex(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalJson(value))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

/** Verifies that `expectedHash` is exactly the SHA-256 of the canonical form of `value`. Fails closed (returns false) on any hashing error rather than throwing, so callers can use it directly as a guard. */
export async function verifySha256(value: unknown, expectedHash: string): Promise<boolean> {
  try {
    return (await sha256Hex(value)) === expectedHash
  } catch {
    return false
  }
}
