'use client'

import { Capacitor, registerPlugin } from '@capacitor/core'
import {
  APPLE_PRODUCT_IDS,
  createUnavailableStoreKitController,
  type CliniversePlan,
  type StoreCatalog,
  type StoreKitPurchaseController,
  type StoreProduct,
  type StoreVerifiedTransaction,
} from './storekit-purchase-contract'

type NativeStoreProduct = {
  productId: string
  displayName: string
  displayPrice: string
  subscriptionPeriod: string
  offerText?: string | null
}

type NativeVerifiedTransaction = {
  productId: string
  transactionId: string
  originalTransactionId: string
  signedTransaction: string
}

interface CliniverseStoreKitPlugin {
  loadCatalog(): Promise<{ products: NativeStoreProduct[]; loadedAt: string }>
  purchase(options: { productId: string }): Promise<
    | ({ status: 'verified' } & NativeVerifiedTransaction)
    | { status: 'pending' }
    | { status: 'cancelled' }
    | { status: 'failed'; reason: string }
  >
  restore(): Promise<{
    status: 'submitted' | 'none'
    transactions?: NativeVerifiedTransaction[]
  }>
  finish(options: { transactionId: string }): Promise<{ ok: boolean; reason?: string }>
}

const NativeStoreKit = registerPlugin<CliniverseStoreKitPlugin>('CliniverseStoreKit')

function planForProductId(productId: string): CliniversePlan | null {
  const entry = (Object.entries(APPLE_PRODUCT_IDS) as Array<[CliniversePlan, string]>)
    .find(([, configuredProductId]) => configuredProductId === productId)
  return entry?.[0] ?? null
}

function mapVerifiedTransaction(transaction: NativeVerifiedTransaction): StoreVerifiedTransaction | null {
  const plan = planForProductId(transaction.productId)
  if (!plan || !transaction.transactionId || !transaction.originalTransactionId || !transaction.signedTransaction) {
    return null
  }

  return {
    status: 'verified',
    plan,
    productId: transaction.productId,
    transactionId: transaction.transactionId,
    originalTransactionId: transaction.originalTransactionId,
    signedTransaction: transaction.signedTransaction,
  }
}

function isNativeIOS() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
}

/**
 * StoreKit is the catalog and transaction source. Cliniverse still grants no
 * access here; verified JWS evidence must pass the authenticated server path.
 */
export function createCapacitorStoreKitController(): StoreKitPurchaseController {
  if (!isNativeIOS()) return createUnavailableStoreKitController()

  return {
    async loadCatalog(): Promise<StoreCatalog> {
      try {
        const response = await NativeStoreKit.loadCatalog()
        const products: StoreCatalog['products'] = {}

        for (const nativeProduct of response.products || []) {
          const plan = planForProductId(nativeProduct.productId)
          if (!plan || !nativeProduct.displayPrice) continue

          const product: StoreProduct = {
            plan,
            productId: nativeProduct.productId,
            displayName: nativeProduct.displayName,
            displayPrice: nativeProduct.displayPrice,
            subscriptionPeriod: nativeProduct.subscriptionPeriod,
            offerText: nativeProduct.offerText ?? null,
          }
          products[plan] = product
        }

        return {
          source: 'app-store',
          products,
          loadedAt: response.loadedAt || new Date().toISOString(),
        }
      } catch {
        return { source: 'app-store', products: {}, loadedAt: new Date().toISOString() }
      }
    },

    async purchase(plan) {
      try {
        const result = await NativeStoreKit.purchase({ productId: APPLE_PRODUCT_IDS[plan] })
        if (result.status !== 'verified') return result

        const verified = mapVerifiedTransaction(result)
        return verified ?? { status: 'failed', reason: 'storekit_transaction_invalid' }
      } catch {
        return { status: 'failed', reason: 'storekit_purchase_bridge_error' }
      }
    },

    async restore() {
      try {
        const result = await NativeStoreKit.restore()
        if (result.status === 'none') return { status: 'none' }

        const transactions = (result.transactions || [])
          .map(mapVerifiedTransaction)
          .filter((transaction): transaction is StoreVerifiedTransaction => Boolean(transaction))

        return transactions.length > 0
          ? { status: 'submitted', transactions }
          : { status: 'none' }
      } catch {
        return { status: 'failed', reason: 'storekit_restore_bridge_error' }
      }
    },

    async finish(transactionId) {
      try {
        const result = await NativeStoreKit.finish({ transactionId })
        return result.ok ? { ok: true } : { ok: false, reason: result.reason || 'storekit_finish_failed' }
      } catch {
        return { ok: false, reason: 'storekit_finish_bridge_error' }
      }
    },
  }
}
