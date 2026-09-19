'use client'

import PaywallScreen from '../../components/PaywallScreen'
import type { StoreProduct } from '../../lib/storekit-purchase-contract'

const PREVIEW_PRODUCTS: StoreProduct[] = [
  { plan: 'monthly', productId: 'preview.monthly', displayName: 'Monthly', displayPrice: '$14.99', subscriptionPeriod: 'per month' },
  { plan: 'yearly', productId: 'preview.yearly', displayName: 'Yearly', displayPrice: '$99.99', subscriptionPeriod: 'per year' },
]

/** Unauthenticated visual-QA preview, mirroring app/labs/onboarding-preview. Not a live purchase surface. */
export default function PaywallPreviewPage() {
  return (
    <PaywallScreen
      onClose={() => {}}
      onSubscribe={() => {}}
      onRestore={() => {}}
      products={PREVIEW_PRODUCTS}
      purchaseEnabled
      trialLabel="7 days free, then"
    />
  )
}
