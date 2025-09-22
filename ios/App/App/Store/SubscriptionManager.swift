import Foundation
import Combine
import SwiftUI

@MainActor
final class SubscriptionManager: ObservableObject {
    
    // MARK: - Published Properties
    @Published var isPremiumUser = false
    @Published var subscriptionStatus: StoreManager.SubscriptionStatus = .notSubscribed
    @Published var trialDaysRemaining = 0
    
    // MARK: - Shared Instance
    static let shared = SubscriptionManager()
    
    private let storeManager = StoreManager()
    private var cancellables = Set<AnyCancellable>()
    
    private init() {
        setupBindings()
        Task {
            await updateSubscriptionStatus()
        }
    }
    
    // MARK: - Setup
    private func setupBindings() {
        // Bind to store manager updates
        storeManager.$subscriptionStatus
            .receive(on: DispatchQueue.main)
            .sink { [weak self] status in
                self?.subscriptionStatus = status
                self?.updatePremiumStatus(for: status)
            }
            .store(in: &cancellables)
        
        storeManager.$trialDaysRemaining
            .receive(on: DispatchQueue.main)
            .assign(to: \.trialDaysRemaining, on: self)
            .store(in: &cancellables)
    }
    
    // MARK: - Status Updates
    func updateSubscriptionStatus() async {
        await storeManager.updateSubscriptionStatus()
    }
    
    private func updatePremiumStatus(for status: StoreManager.SubscriptionStatus) {
        switch status {
        case .freeTrial, .subscribed:
            isPremiumUser = true
        case .notSubscribed, .expired, .gracePeriod, .billingRetry:
            isPremiumUser = false
        }
    }
    
    // MARK: - Feature Access
    func hasAccessToFeature(_ feature: PremiumFeature) -> Bool {
        return isPremiumUser
    }
    
    func requiresPremium(_ feature: PremiumFeature) -> Bool {
        return !hasAccessToFeature(feature)
    }
    
    // MARK: - Subscription Actions
    func showPaywall() {
        NotificationCenter.default.post(name: .showPaywall, object: nil)
    }
    
    func checkAndShowPaywallIfNeeded(for feature: PremiumFeature) {
        if requiresPremium(feature) {
            showPaywall()
        }
    }
}

// MARK: - Premium Features
enum PremiumFeature: CaseIterable {
    case personalizedTrainingPlan
    case advancedAnalytics
    case unlimitedWorkouts
    case exportData
    case aiCoaching
    case nutritionPlanning
    
    var localizedName: String {
        switch self {
        case .personalizedTrainingPlan:
            return NSLocalizedString("Personalized Training Plan", comment: "")
        case .advancedAnalytics:
            return NSLocalizedString("Advanced Analytics", comment: "")
        case .unlimitedWorkouts:
            return NSLocalizedString("Unlimited Workouts", comment: "")
        case .exportData:
            return NSLocalizedString("Export Data", comment: "")
        case .aiCoaching:
            return NSLocalizedString("AI Coaching", comment: "")
        case .nutritionPlanning:
            return NSLocalizedString("Nutrition Planning", comment: "")
        }
    }
    
    var localizedDescription: String {
        switch self {
        case .personalizedTrainingPlan:
            return NSLocalizedString("Get a custom training plan based on your goals and fitness level", comment: "")
        case .advancedAnalytics:
            return NSLocalizedString("Detailed insights and progress tracking", comment: "")
        case .unlimitedWorkouts:
            return NSLocalizedString("Access to unlimited workout sessions", comment: "")
        case .exportData:
            return NSLocalizedString("Export your data to other fitness apps", comment: "")
        case .aiCoaching:
            return NSLocalizedString("Get personalized coaching tips from AI", comment: "")
        case .nutritionPlanning:
            return NSLocalizedString("Personalized nutrition recommendations", comment: "")
        }
    }
}

// MARK: - SwiftUI Environment
struct SubscriptionEnvironmentKey: EnvironmentKey {
    static let defaultValue = SubscriptionManager.shared
}

extension EnvironmentValues {
    var subscriptionManager: SubscriptionManager {
        get { self[SubscriptionEnvironmentKey.self] }
        set { self[SubscriptionEnvironmentKey.self] = newValue }
    }
}

// MARK: - Notification Names
extension NSNotification.Name {
    static let showPaywall = NSNotification.Name("showPaywall")
}
