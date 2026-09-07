import Foundation
import StoreKit
import Capacitor

@objc(CliniverseStoreKitPlugin)
public final class CliniverseStoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CliniverseStoreKitPlugin"
    public let jsName = "CliniverseStoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "loadCatalog", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finish", returnType: CAPPluginReturnPromise),
    ]

    private static let productPlans: [String: String] = [
        "com.cliniverse.ai.pro.monthly": "monthly",
        "com.cliniverse.ai.pro.yearly": "yearly",
    ]

    @objc public func loadCatalog(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else {
            call.reject("StoreKit 2 requires iOS 15 or later", "STOREKIT_UNAVAILABLE")
            return
        }

        Task { @MainActor in
            do {
                let products = try await Product.products(for: Array(Self.productPlans.keys))
                let payloads = products
                    .sorted { Self.planRank($0.id) < Self.planRank($1.id) }
                    .map(Self.productPayload)

                call.resolve([
                    "products": payloads,
                    "loadedAt": Self.iso8601(Date()),
                ])
            } catch {
                call.reject("Unable to load App Store products", "STOREKIT_CATALOG_FAILED", error)
            }
        }
    }

    @objc public func purchase(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else {
            call.reject("StoreKit 2 requires iOS 15 or later", "STOREKIT_UNAVAILABLE")
            return
        }
        guard let productId = call.getString("productId"), Self.productPlans[productId] != nil else {
            call.reject("Unsupported App Store product", "STOREKIT_PRODUCT_NOT_ALLOWED")
            return
        }

        Task { @MainActor in
            do {
                guard let product = try await Product.products(for: [productId]).first else {
                    call.resolve(["status": "failed", "reason": "storekit_product_not_found"])
                    return
                }

                switch try await product.purchase() {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        var payload = Self.transactionPayload(
                            transaction,
                            signedTransaction: verification.jwsRepresentation
                        )
                        payload["status"] = "verified"
                        call.resolve(payload)
                    case .unverified:
                        call.resolve(["status": "failed", "reason": "storekit_transaction_unverified"])
                    }
                case .pending:
                    call.resolve(["status": "pending"])
                case .userCancelled:
                    call.resolve(["status": "cancelled"])
                @unknown default:
                    call.resolve(["status": "failed", "reason": "storekit_purchase_unknown"])
                }
            } catch {
                call.resolve(["status": "failed", "reason": "storekit_purchase_failed"])
            }
        }
    }

    @objc public func restore(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else {
            call.reject("StoreKit 2 requires iOS 15 or later", "STOREKIT_UNAVAILABLE")
            return
        }

        Task { @MainActor in
            do {
                // Apple requires sync to be initiated by an explicit user action.
                try await AppStore.sync()
                var transactions: [JSObject] = []

                for await verification in Transaction.currentEntitlements {
                    guard case .verified(let transaction) = verification,
                          Self.productPlans[transaction.productID] != nil else { continue }
                    transactions.append(Self.transactionPayload(
                        transaction,
                        signedTransaction: verification.jwsRepresentation
                    ))
                }

                if transactions.isEmpty {
                    call.resolve(["status": "none"])
                } else {
                    call.resolve([
                        "status": "submitted",
                        "transactions": transactions,
                    ])
                }
            } catch {
                call.reject("Unable to restore App Store purchases", "STOREKIT_RESTORE_FAILED", error)
            }
        }
    }

    @objc public func finish(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else {
            call.reject("StoreKit 2 requires iOS 15 or later", "STOREKIT_UNAVAILABLE")
            return
        }
        guard let value = call.getString("transactionId"), let requestedId = UInt64(value) else {
            call.reject("A valid transaction ID is required", "STOREKIT_TRANSACTION_ID_INVALID")
            return
        }

        Task { @MainActor in
            for await verification in Transaction.unfinished {
                switch verification {
                case .verified(let transaction) where transaction.id == requestedId:
                    await transaction.finish()
                    call.resolve(["ok": true])
                    return
                case .unverified(let transaction, _) where transaction.id == requestedId:
                    call.resolve(["ok": false, "reason": "storekit_unfinished_transaction_unverified"])
                    return
                default:
                    continue
                }
            }

            // Finishing is idempotent. A missing unfinished transaction is
            // already complete and must not turn a verified entitlement into an error.
            call.resolve(["ok": true])
        }
    }

    @available(iOS 15.0, *)
    private static func productPayload(_ product: Product) -> JSObject {
        [
            "productId": product.id,
            "displayName": product.displayName,
            "displayPrice": product.displayPrice,
            "subscriptionPeriod": subscriptionPeriodLabel(product.subscription?.subscriptionPeriod),
        ]
    }

    @available(iOS 15.0, *)
    private static func transactionPayload(
        _ transaction: Transaction,
        signedTransaction: String
    ) -> JSObject {
        [
            "productId": transaction.productID,
            "transactionId": String(transaction.id),
            "originalTransactionId": String(transaction.originalID),
            "signedTransaction": signedTransaction,
        ]
    }

    @available(iOS 15.0, *)
    private static func subscriptionPeriodLabel(_ period: Product.SubscriptionPeriod?) -> String {
        guard let period else { return "" }
        let unit: String
        switch period.unit {
        case .day: unit = period.value == 1 ? "day" : "days"
        case .week: unit = period.value == 1 ? "week" : "weeks"
        case .month: unit = period.value == 1 ? "month" : "months"
        case .year: unit = period.value == 1 ? "year" : "years"
        @unknown default: unit = "period"
        }
        return "\(period.value) \(unit)"
    }

    private static func planRank(_ productId: String) -> Int {
        productPlans[productId] == "monthly" ? 0 : 1
    }

    private static func iso8601(_ date: Date) -> String {
        ISO8601DateFormatter().string(from: date)
    }
}
