import type { NexusCase } from './nexusCore'

/** In-memory educational branch; never writes or replaces a persisted ledger. */
export function replayDecision(current: NexusCase, checkpoints: NexusCase[], index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= checkpoints.length) return null
  return {
    previousAttempt: structuredClone(current),
    current: structuredClone(checkpoints[index]),
    checkpoints: structuredClone(checkpoints.slice(0, index)),
  }
}
