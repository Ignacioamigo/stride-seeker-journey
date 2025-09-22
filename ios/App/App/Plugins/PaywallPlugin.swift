import Foundation
import Capacitor
// import SwiftUI  // Temporarily commented for debugging

@objc(PaywallPlugin)
public class PaywallPlugin: CAPPlugin {
    
    private var subscriptionManager = SubscriptionManager.shared
    
    override public func load() {
        // Listen for paywall show notifications
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(showPaywallNotification),
            name: .showPaywall,
            object: nil
        )
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    @objc func showPaywall(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.presentPaywall()
        }
        call.resolve()
    }
    
    @objc func checkSubscriptionStatus(_ call: CAPPluginCall) {
        Task { @MainActor in
            await subscriptionManager.updateSubscriptionStatus()
            
            let status: String
            let daysRemaining: Int
            let isActive: Bool
            
            switch subscriptionManager.subscriptionStatus {
            case .notSubscribed:
                status = "not_subscribed"
                daysRemaining = 0
                isActive = false
            case .freeTrial(let days):
                status = "free_trial"
                daysRemaining = days
                isActive = true
            case .subscribed(let expiresAt):
                status = "subscribed"
                daysRemaining = 0
                isActive = true
            case .expired:
                status = "expired"
                daysRemaining = 0
                isActive = false
            case .gracePeriod:
                status = "grace_period"
                daysRemaining = 0
                isActive = true
            case .billingRetry:
                status = "billing_retry"
                daysRemaining = 0
                isActive = true
            }
            
            call.resolve([
                "status": status,
                "isActive": isActive,
                "trialDaysRemaining": daysRemaining,
                "isPremium": subscriptionManager.isPremiumUser
            ])
        }
    }
    
    @objc func hasAccessToFeature(_ call: CAPPluginCall) {
        guard let featureName = call.getString("feature") else {
            call.reject("Feature name is required")
            return
        }
        
        Task { @MainActor in
            let feature = mapStringToFeature(featureName)
            let hasAccess = subscriptionManager.hasAccessToFeature(feature)
            
            call.resolve([
                "hasAccess": hasAccess,
                "requiresPremium": !hasAccess
            ])
        }
    }
    
    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task { @MainActor in
            let storeManager = StoreManager()
            await storeManager.restorePurchases()
            await subscriptionManager.updateSubscriptionStatus()
            
            call.resolve([
                "success": true,
                "isPremium": subscriptionManager.isPremiumUser
            ])
        }
    }
    
    @objc func purchaseProduct(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Product ID is required")
            return
        }
        
        Task { @MainActor in
            let storeManager = StoreManager()
            
            // Load products first
            await storeManager.loadProducts()
            
            // Find the product
            guard let product = storeManager.products.first(where: { $0.id == productId }) else {
                call.reject("Product not found: \(productId)")
                return
            }
            
            // Attempt purchase - this will show Apple Pay/Touch ID dialog
            let success = await storeManager.purchase(product)
            
            if success {
                call.resolve([
                    "success": true,
                    "productId": productId,
                    "message": "Purchase completed successfully"
                ])
            } else {
                call.resolve([
                    "success": false,
                    "error": storeManager.errorMessage ?? "Purchase failed"
                ])
            }
        }
    }
    
    @objc func requestNotificationPermission(_ call: CAPPluginCall) {
        // Notifications removed for simplicity
        call.resolve(["granted": false])
    }
    
    // MARK: - Private Methods
    
    @objc private func showPaywallNotification() {
        DispatchQueue.main.async {
            self.presentPaywall()
        }
    }
    
    private func presentPaywall() {
        // Temporarily disabled to debug SwiftUI crash
        print("PaywallView presentation temporarily disabled for debugging")
        
        /* 
        guard let viewController = bridge?.viewController else { return }
        
        let paywallView = PaywallView()
        let hostingController = UIHostingController(rootView: paywallView)
        
        hostingController.modalPresentationStyle = .fullScreen
        viewController.present(hostingController, animated: true)
        */
    }
    
    private func mapStringToFeature(_ featureName: String) -> PremiumFeature {
        switch featureName.lowercased() {
        case "personalized_training_plan":
            return .personalizedTrainingPlan
        case "advanced_analytics":
            return .advancedAnalytics
        case "unlimited_workouts":
            return .unlimitedWorkouts
        case "export_data":
            return .exportData
        case "ai_coaching":
            return .aiCoaching
        case "nutrition_planning":
            return .nutritionPlanning
        default:
            return .personalizedTrainingPlan
        }
    }
}
