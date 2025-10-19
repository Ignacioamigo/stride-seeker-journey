import Foundation
import Capacitor
import StoreKit

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin {
    private var storeManager: StoreKitManager?
    
    override public func load() {
        Task { @MainActor in
            self.storeManager = StoreKitManager()
        }
    }
    
    @objc func getProducts(_ call: CAPPluginCall) {
        Task { @MainActor in
            do {
                guard let manager = storeManager else {
                    call.reject("Store manager not initialized")
                    return
                }
                
                let ids = call.getArray("ids", String.self) ?? []
                print("🎯 Getting products for: \(ids)")
                
                try await manager.loadProducts(ids: ids)
                
                let mapped = manager.products.map { product in
                    return [
                        "id": product.id,
                        "price": product.displayPrice,
                        "title": product.displayName,
                        "description": product.description,
                        "priceLocale": product.priceFormatStyle.locale.identifier
                    ]
                }
                
                call.resolve(["products": mapped])
            } catch {
                print("❌ Error getting products: \(error)")
                call.reject(error.localizedDescription)
            }
        }
    }
    
    @objc func purchase(_ call: CAPPluginCall) {
        Task { @MainActor in
            do {
                guard let manager = storeManager else {
                    call.reject("Store manager not initialized")
                    return
                }
                
                guard let productId = call.getString("id") else {
                    call.reject("Missing product ID")
                    return
                }
                
                print("🛒 Purchasing: \(productId)")
                let transaction = try await manager.purchase(productId)
                
                if let tx = transaction {
                    call.resolve([
                        "success": true,
                        "transactionId": String(tx.id),
                        "productId": tx.productID
                    ])
                } else {
                    call.resolve([
                        "success": false,
                        "reason": "Transaction was nil (cancelled or pending)"
                    ])
                }
            } catch {
                print("❌ Purchase error: \(error)")
                call.reject(error.localizedDescription)
            }
        }
    }
    
    @objc func restore(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard let manager = storeManager else {
                call.reject("Store manager not initialized")
                return
            }
            
            let transactions = await manager.restore()
            let mapped = transactions.map { tx in
                return [
                    "id": String(tx.id),
                    "productId": tx.productID,
                    "purchaseDate": ISO8601DateFormatter().string(from: tx.purchaseDate)
                ]
            }
            
            call.resolve([
                "success": true,
                "count": transactions.count,
                "transactions": mapped
            ])
        }
    }
    
    @objc func checkStatus(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard let manager = storeManager else {
                call.reject("Store manager not initialized")
                return
            }
            
            await manager.updatePurchasedProducts()
            
            let productId = call.getString("productId")
            
            if let id = productId {
                let hasAccess = manager.hasActiveSubscription(for: id)
                call.resolve([
                    "hasAccess": hasAccess,
                    "productId": id
                ])
            } else {
                call.resolve([
                    "purchasedProducts": Array(manager.purchasedProducts)
                ])
            }
        }
    }
}

@MainActor
final class StoreKitManager: ObservableObject {
    @Published var products: [Product] = []
    @Published var purchasedProducts: Set<String> = []
    
    func loadProducts(ids: [String]) async throws {
        print("🛒 Loading products for IDs: \(ids)")
        products = try await Product.products(for: ids)
        print("✅ Loaded \(products.count) products")
        
        await updatePurchasedProducts()
    }
    
    func purchase(_ productId: String) async throws -> Transaction? {
        print("💳 Attempting purchase for: \(productId)")
        
        guard let product = products.first(where: { $0.id == productId }) else {
            print("❌ Product not found: \(productId)")
            return nil
        }
        
        let result = try await product.purchase()
        
        switch result {
        case .success(let verification):
            print("✅ Purchase successful, verifying...")
            let transaction = try checkVerification(verification)
            await transaction.finish()
            await updatePurchasedProducts()
            print("🎉 Purchase completed: \(productId)")
            return transaction
            
        case .userCancelled:
            print("❌ User cancelled purchase")
            return nil
            
        case .pending:
            print("⏳ Purchase pending approval")
            return nil
            
        @unknown default:
            print("❓ Unknown purchase result")
            return nil
        }
    }
    
    func restore() async -> [Transaction] {
        print("🔄 Restoring purchases...")
        var restored: [Transaction] = []
        
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                restored.append(transaction)
            }
        }
        
        await updatePurchasedProducts()
        print("✅ Restored \(restored.count) purchases")
        return restored
    }
    
    func updatePurchasedProducts() async {
        var purchased: Set<String> = []
        
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                if transaction.revocationDate == nil {
                    purchased.insert(transaction.productID)
                }
            }
        }
        
        purchasedProducts = purchased
        print("📦 Current purchases: \(purchased)")
    }
    
    func hasActiveSubscription(for productId: String) -> Bool {
        return purchasedProducts.contains(productId)
    }
    
    private func checkVerification<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let safe):
            return safe
        case .unverified(_, let error):
            throw error
        }
    }
}
