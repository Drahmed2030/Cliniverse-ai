'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import PaywallScreen from '../PaywallScreen'
import { completeStoreKitPurchase } from '../../lib/apple-purchase-verification-client'
import { createCapacitorStoreKitController } from '../../lib/capacitor-storekit-controller'
import { getOwnEntitlement, type CliniverseEntitlement } from '../../lib/entitlements'
import type {
  CliniversePlan,
  StoreCatalog,
  StoreProduct,
} from '../../lib/storekit-purchase-contract'

interface SubscriptionContextValue {
  entitlement: CliniverseEntitlement | null
  entitlementLoading: boolean
  products: StoreProduct[]
  catalogLoading: boolean
  storeBusy: boolean
  storeMessage: string
  openPaywall: () => void
  refreshEntitlement: () => Promise<CliniverseEntitlement>
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export default function SubscriptionPurchaseProvider({ children }: { children: ReactNode }) {
  const storeKit = useMemo(() => createCapacitorStoreKitController(), [])
  const [entitlement, setEntitlement] = useState<CliniverseEntitlement | null>(null)
  const [entitlementLoading, setEntitlementLoading] = useState(true)
  const [catalog, setCatalog] = useState<StoreCatalog | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [storeBusy, setStoreBusy] = useState(false)
  const [storeMessage, setStoreMessage] = useState('')
  const [paywallOpen, setPaywallOpen] = useState(false)

  const products = useMemo(() => catalogProducts(catalog), [catalog])

  const refreshEntitlement = useCallback(async () => {
    const nextEntitlement = await getOwnEntitlement()
    setEntitlement(nextEntitlement)
    setEntitlementLoading(false)
    return nextEntitlement
  }, [])

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true)
    const nextCatalog = await storeKit.loadCatalog()
    setCatalog(nextCatalog)
    setCatalogLoading(false)
    return nextCatalog
  }, [storeKit])

  useEffect(() => {
    let active = true

    Promise.all([getOwnEntitlement(), storeKit.loadCatalog()])
      .then(([nextEntitlement, nextCatalog]) => {
        if (!active) return
        setEntitlement(nextEntitlement)
        setCatalog(nextCatalog)
        setEntitlementLoading(false)
        setCatalogLoading(false)
      })
      .catch(() => {
        if (!active) return
        setEntitlementLoading(false)
        setCatalogLoading(false)
      })

    return () => {
      active = false
    }
  }, [storeKit])

  const openPaywall = useCallback(() => {
    setPaywallOpen(true)
    setStoreMessage('')
    void loadCatalog().then(nextCatalog => {
      if (catalogProducts(nextCatalog).length === 0) {
        setStoreMessage('App Store plans are available in the Cliniverse AI iOS app when the store is reachable.')
      }
    })
  }, [loadCatalog])

  const subscribe = useCallback(async (plan: CliniversePlan) => {
    if (storeBusy) return
    setStoreBusy(true)
    setStoreMessage('Confirm the purchase in the App Store sheet.')

    const purchase = await storeKit.purchase(plan)
    if (purchase.status === 'pending') {
      setStoreMessage('The purchase is pending App Store approval. PRO activates after verification.')
      setStoreBusy(false)
      return
    }
    if (purchase.status === 'cancelled') {
      setStoreMessage('Purchase cancelled. No charge was made.')
      setStoreBusy(false)
      return
    }
    if (purchase.status === 'failed') {
      setStoreMessage(storeFailureMessage(purchase.reason))
      setStoreBusy(false)
      return
    }

    setStoreMessage('Verifying the App Store transaction securely…')
    const completed = await completeStoreKitPurchase(plan, purchase)
    if (!completed.ok) {
      setStoreMessage(storeFailureMessage(completed.reason))
      setStoreBusy(false)
      return
    }

    const finished = await storeKit.finish(purchase.transactionId)
    setEntitlement(completed.entitlement)
    setStoreBusy(false)
    setStoreMessage(finished.ok
      ? 'Cliniverse PRO is active on this account.'
      : 'Cliniverse PRO is active. App Store completion will retry during restore.')
    setPaywallOpen(false)
  }, [storeBusy, storeKit])

  const restorePurchases = useCallback(async () => {
    if (storeBusy) return
    setStoreBusy(true)
    setStoreMessage('Checking App Store purchases…')

    const restored = await storeKit.restore()
    if (restored.status === 'none') {
      setStoreMessage('No active Cliniverse PRO purchase was found for this Apple ID.')
      setStoreBusy(false)
      return
    }
    if (restored.status === 'failed') {
      setStoreMessage(storeFailureMessage(restored.reason))
      setStoreBusy(false)
      return
    }

    let restoredEntitlement: CliniverseEntitlement | null = null
    let failureReason = ''
    for (const transaction of restored.transactions) {
      const completed = await completeStoreKitPurchase(transaction.plan, transaction)
      if (!completed.ok) {
        failureReason = completed.reason
        continue
      }
      restoredEntitlement = completed.entitlement
      await storeKit.finish(transaction.transactionId)
    }

    setStoreBusy(false)
    if (!restoredEntitlement) {
      setStoreMessage(storeFailureMessage(failureReason || 'storekit_restore_verification_failed'))
      return
    }

    setEntitlement(restoredEntitlement)
    setStoreMessage('Cliniverse PRO was restored to this account.')
    setPaywallOpen(false)
  }, [storeBusy, storeKit])

  const contextValue = useMemo<SubscriptionContextValue>(() => ({
    entitlement,
    entitlementLoading,
    products,
    catalogLoading,
    storeBusy,
    storeMessage,
    openPaywall,
    refreshEntitlement,
  }), [
    catalogLoading,
    entitlement,
    entitlementLoading,
    openPaywall,
    products,
    refreshEntitlement,
    storeBusy,
    storeMessage,
  ])

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
      {paywallOpen ? (
        <PaywallScreen
          onClose={() => { if (!storeBusy) setPaywallOpen(false) }}
          onSubscribe={subscribe}
          onRestore={restorePurchases}
          products={products}
          purchaseEnabled={products.length > 0}
          busy={storeBusy}
          statusLabel={storeMessage || null}
          catalogLoading={catalogLoading}
        />
      ) : null}
    </SubscriptionContext.Provider>
  )
}

export function useCliniverseSubscription() {
  const value = useContext(SubscriptionContext)
  if (!value) {
    throw new Error('useCliniverseSubscription must be used inside SubscriptionPurchaseProvider')
  }
  return value
}

function catalogProducts(catalog: StoreCatalog | null): StoreProduct[] {
  if (!catalog) return []
  return (['monthly', 'yearly'] as const)
    .map(plan => catalog.products[plan])
    .filter((product): product is StoreProduct => Boolean(product))
}

function storeFailureMessage(reason: string) {
  if (reason === 'storekit_not_configured') {
    return 'Purchases are available inside the Cliniverse AI iOS app.'
  }
  if (reason.includes('auth_session')) {
    return 'Sign in again before purchasing or restoring Cliniverse PRO.'
  }
  if (reason.includes('network')) {
    return 'The secure purchase check could not reach Cliniverse. Try again when connected.'
  }
  if (reason.includes('persistence') || reason.includes('entitlement_refresh')) {
    return 'Apple verified the purchase, but secure account activation is not ready. Use Restore purchases after service recovery.'
  }
  return 'The App Store purchase could not be completed. No local PRO access was granted.'
}
