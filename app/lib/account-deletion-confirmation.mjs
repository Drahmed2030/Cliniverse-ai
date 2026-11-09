export const ACCOUNT_DELETION_WORD = 'DELETE'

/** @param {unknown} value */
export function isDeletionConfirmed(value) {
  return value === ACCOUNT_DELETION_WORD
}
