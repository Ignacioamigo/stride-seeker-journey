import Foundation
import StoreKit
import Combine

@MainActor
final class StoreManager: ObservableObject {
    
    // MARK: - Published Properties
    @Published var products: [Product] = []
    @Published var purchasedProducts: Set<String> = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var subscriptionStatus: SubscriptionStatus = .notSubscribed
    @Published var trialDaysRemaining: Int = 0
    @Published var subscriptionExpirationDate: Date?
    
    // MARK: - Product IDs
    static let monthlyProductID = "berun_premium_monthly"
    static let yearlyProductID = "berun_premium_yearly"
    
    private let productIDs: Set<String> = [
        StoreManager.monthlyProductID,
        StoreManager.yearlyProductID
    ]
    
    // MARK: - Subscription Status
    enum SubscriptionStatus {
        case notSubscribed
        case freeTrial(daysRemaining: Int)
        case subscribed(expiresAt: Date)
        case expired
        case gracePeriod
        case billingRetry
    }
    
    // MARK: - Transaction Updates
    private var transactionUpdates: Task<Void, Never>? = nil
    
    // MARK: - Initialization
    init() {
        // Start listening for transaction updates
        transactionUpdates = newTransactionListenerTask()
        
        Task {
            await loadProducts()
            await updateSubscriptionStatus()
        }
    }
    
    deinit {
        transactionUpdates?.cancel()
    }
    
    // MARK: - Product Loading
    func loadProducts() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let products = try await Product.products(for: productIDs)
            self.products = products.sorted { product1, product2 in
                // Sort yearly first, then monthly
                if product1.id == StoreManager.yearlyProductID { return true }
                if product2.id == StoreManager.yearlyProductID { return false }
                return product1.id < product2.id
            }
        } catch {
            errorMessage = getLocalizedError(for: error)
            print("Failed to load products: \(error)")
        }
        
        isLoading = false
    }
    
    // MARK: - Purchase
    func purchase(_ product: Product) async -> Bool {
        isLoading = true
        errorMessage = nil
        
        do {
            let result = try await product.purchase()
            
            switch result {
            case .success(let verification):
                if case .verified(let transaction) = verification {
                    await transaction.finish()
                    await updateSubscriptionStatus()
                    isLoading = false
                    return true
                } else {
                    errorMessage = NSLocalizedString("Transaction could not be verified", comment: "")
                }
            case .userCancelled:
                break
            case .pending:
                errorMessage = NSLocalizedString("Purchase is pending approval", comment: "")
            @unknown default:
                errorMessage = NSLocalizedString("Unknown purchase result", comment: "")
            }
        } catch {
            errorMessage = getLocalizedError(for: error)
            print("Purchase failed: \(error)")
        }
        
        isLoading = false
        return false
    }
    
    // MARK: - Restore Purchases
    func restorePurchases() async {
        isLoading = true
        errorMessage = nil
        
        do {
            try await AppStore.sync()
            await updateSubscriptionStatus()
        } catch {
            errorMessage = getLocalizedError(for: error)
            print("Restore failed: \(error)")
        }
        
        isLoading = false
    }
    
    // MARK: - Subscription Status Updates
    func updateSubscriptionStatus() async {
        var currentEntitlements: [String] = []
        
        // Check for active subscriptions
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                if transaction.revocationDate == nil {
                    currentEntitlements.append(transaction.productID)
                }
            }
        }
        
        purchasedProducts = Set(currentEntitlements)
        
        // Update subscription status
        await updateDetailedSubscriptionStatus()
    }
    
    private func updateDetailedSubscriptionStatus() async {
        // Get the most recent subscription transaction
        var latestTransaction: Transaction?
        var latestExpirationDate: Date?
        
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                if productIDs.contains(transaction.productID) {
                    if latestTransaction == nil || transaction.purchaseDate > latestTransaction!.purchaseDate {
                        latestTransaction = transaction
                        latestExpirationDate = transaction.expirationDate
                    }
                }
            }
        }
        
        guard let transaction = latestTransaction else {
            subscriptionStatus = .notSubscribed
            trialDaysRemaining = 0
            subscriptionExpirationDate = nil
            return
        }
        
        let now = Date()
        
        // Check if subscription is still active
        if let expirationDate = latestExpirationDate {
            subscriptionExpirationDate = expirationDate
            
            if expirationDate > now {
                // Check if it's in trial period
                if transaction.offerType == .introductory {
                    let daysRemaining = Calendar.current.dateComponents([.day], from: now, to: expirationDate).day ?? 0
                    if daysRemaining > 0 {
                        subscriptionStatus = .freeTrial(daysRemaining: daysRemaining)
                        trialDaysRemaining = daysRemaining
                    } else {
                        subscriptionStatus = .subscribed(expiresAt: expirationDate)
                        trialDaysRemaining = 0
                    }
                } else {
                    subscriptionStatus = .subscribed(expiresAt: expirationDate)
                    trialDaysRemaining = 0
                }
            } else {
                // Subscription expired
                subscriptionStatus = .expired
                trialDaysRemaining = 0
            }
        } else {
            subscriptionStatus = .notSubscribed
            trialDaysRemaining = 0
            subscriptionExpirationDate = nil
        }
    }
    
    // MARK: - Transaction Listener
    private func newTransactionListenerTask() -> Task<Void, Never> {
        Task.detached { @MainActor in
            for await result in Transaction.updates {
                if case .verified(let transaction) = result {
                    await transaction.finish()
                    await self.updateSubscriptionStatus()
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    func hasActiveSubscription() -> Bool {
        switch subscriptionStatus {
        case .freeTrial, .subscribed:
            return true
        case .notSubscribed, .expired, .gracePeriod, .billingRetry:
            return false
        }
    }
    
    func isInFreeTrial() -> Bool {
        if case .freeTrial = subscriptionStatus {
            return true
        }
        return false
    }
    
    func getProductPrice(_ product: Product) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = product.priceFormatStyle.locale
        return formatter.string(from: product.price as NSDecimalNumber) ?? ""
    }
    
    func getMonthlyEquivalentPrice(_ product: Product) -> String {
        guard product.id == StoreManager.yearlyProductID else { return "" }
        
        let monthlyPrice = Double(truncating: product.price as NSNumber) / 12.0
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = product.priceFormatStyle.locale
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        
        return formatter.string(from: NSNumber(value: monthlyPrice)) ?? ""
    }
    
    private func getLocalizedError(for error: Error) -> String {
        if let storeKitError = error as? StoreKitError {
            switch storeKitError {
            case .userCancelled:
                return NSLocalizedString("Purchase was cancelled", comment: "")
            case .networkError:
                return NSLocalizedString("Network error occurred", comment: "")
            case .systemError:
                return NSLocalizedString("System error occurred", comment: "")
            case .notAvailableInStorefront:
                return NSLocalizedString("Not available in your region", comment: "")
            case .notEntitled:
                return NSLocalizedString("Not entitled to this product", comment: "")
            default:
                return NSLocalizedString("An unknown error occurred", comment: "")
            }
        }
        return error.localizedDescription
    }
}
