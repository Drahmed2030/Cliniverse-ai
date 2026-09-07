export type CliniversePlan = 'monthly' | 'yearly'

export const APPLE_PRODUCT_IDS: Record<CliniversePlan, string> = {
  monthly: 'com.cliniverse.ai.pro.monthly',
  yearly: 'com.cliniverse.ai.pro.yearly',
}

export type StoreProduct = {
  plan: CliniversePlan
  productId: string
  displayName: string
  displayPrice: string
  subscriptionPeriod: string
  offerText?: string | null
}

export type StoreCatalog = {
  source: 'app-store'
  products: Partial<Record<CliniversePlan, StoreProduct>>
  loadedAt: string
}

export type StorePurchaseResult =
  | StoreVerifiedTransaction
  | { status: 'pending' }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string }

export type StoreVerifiedTransaction = {
  status: 'verified'
  plan: CliniversePlan
  productId: string
  transactionId: string
  originalTransactionId: string
  signedTransaction: string
}

export type StoreRestoreResult =
  | { status: 'submitted'; transactions: StoreVerifiedTransaction[] }
  | { status: 'none' }
  | { status: 'failed'; reason: string }

export type StoreFinishResult =
  | { ok: true }
  | { ok: false; reason: string }

/**
 * Boundary implemented by the native StoreKit bridge. This web/release layer
 * never grants PRO itself and never accepts a price or trial claim that was
 * not supplied by the App Store catalog.
 */
export interface StoreKitPurchaseController {
  loadCatalog(): Promise<StoreCatalog>
  purchase(plan: CliniversePlan): Promise<StorePurchaseResult>
  restore(): Promise<StoreRestoreResult>
  finish(transactionId: string): Promise<StoreFinishResult>
}

export const STOREKIT_NOT_CONFIGURED = 'storekit_not_configured'

export function createUnavailableStoreKitController(): StoreKitPurchaseController {
  return {
    async loadCatalog() {
      return { source: 'app-store', products: {}, loadedAt: new Date().toISOString() }
    },
    async purchase() {
      return { status: 'failed', reason: STOREKIT_NOT_CONFIGURED }
    },
    async restore() {
      return { status: 'failed', reason: STOREKIT_NOT_CONFIGURED }
    },
    async finish() {
      return { ok: false, reason: STOREKIT_NOT_CONFIGURED }
    },
  }
}
