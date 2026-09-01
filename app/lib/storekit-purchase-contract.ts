export type CliniversePlan = 'monthly' | 'yearly'

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
  | { status: 'verified'; transactionId: string; originalTransactionId: string; signedTransaction: string }
  | { status: 'pending' }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string }

export type StoreRestoreResult =
  | { status: 'submitted'; signedTransactions: string[] }
  | { status: 'none' }
  | { status: 'failed'; reason: string }

/**
 * Boundary implemented by the native StoreKit bridge. This web/release layer
 * never grants PRO itself and never accepts a price or trial claim that was
 * not supplied by the App Store catalog.
 */
export interface StoreKitPurchaseController {
  loadCatalog(): Promise<StoreCatalog>
  purchase(plan: CliniversePlan): Promise<StorePurchaseResult>
  restore(): Promise<StoreRestoreResult>
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
  }
}
