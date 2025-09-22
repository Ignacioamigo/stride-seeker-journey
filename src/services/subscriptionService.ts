import { Capacitor } from '@capacitor/core';
import React from 'react';

// Types
export interface SubscriptionStatus {
  status: 'not_subscribed' | 'free_trial' | 'subscribed' | 'expired' | 'grace_period' | 'billing_retry';
  isActive: boolean;
  trialDaysRemaining: number;
  isPremium: boolean;
}

export interface FeatureAccess {
  hasAccess: boolean;
  requiresPremium: boolean;
}

export enum PremiumFeature {
  PERSONALIZED_TRAINING_PLAN = 'personalized_training_plan',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  UNLIMITED_WORKOUTS = 'unlimited_workouts',
  EXPORT_DATA = 'export_data',
  AI_COACHING = 'ai_coaching',
  NUTRITION_PLANNING = 'nutrition_planning'
}

// Capacitor plugin interface
interface PaywallPlugin {
  showPaywall(): Promise<void>;
  checkSubscriptionStatus(): Promise<SubscriptionStatus>;
  hasAccessToFeature(options: { feature: string }): Promise<FeatureAccess>;
  restorePurchases(): Promise<{ success: boolean; isPremium: boolean }>;
  requestNotificationPermission(): Promise<{ granted: boolean }>;
}

class SubscriptionService {
  private paywallPlugin: PaywallPlugin | null = null;
  private subscriptionStatus: SubscriptionStatus | null = null;
  private statusUpdateCallbacks: Array<(status: SubscriptionStatus) => void> = [];

  constructor() {
    if (Capacitor.isNativePlatform()) {
      this.paywallPlugin = Capacitor.Plugins.PaywallPlugin as PaywallPlugin;
    }
    
    // Initialize subscription status check
    this.checkSubscriptionStatus();
  }

  /**
   * Show the native paywall
   */
  async showPaywall(): Promise<void> {
    if (!this.paywallPlugin) {
      console.warn('Paywall not available on this platform');
      return;
    }

    try {
      await this.paywallPlugin.showPaywall();
      // Refresh subscription status after showing paywall
      setTimeout(() => this.checkSubscriptionStatus(), 1000);
    } catch (error) {
      console.error('Failed to show paywall:', error);
    }
  }

  /**
   * Check current subscription status
   */
  async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!this.paywallPlugin) {
      // Default status for web/non-native platforms
      const defaultStatus: SubscriptionStatus = {
        status: 'not_subscribed',
        isActive: false,
        trialDaysRemaining: 0,
        isPremium: false
      };
      this.subscriptionStatus = defaultStatus;
      this.notifyStatusUpdate(defaultStatus);
      return defaultStatus;
    }

    try {
      const status = await this.paywallPlugin.checkSubscriptionStatus();
      this.subscriptionStatus = status;
      this.notifyStatusUpdate(status);
      return status;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      const errorStatus: SubscriptionStatus = {
        status: 'not_subscribed',
        isActive: false,
        trialDaysRemaining: 0,
        isPremium: false
      };
      this.subscriptionStatus = errorStatus;
      this.notifyStatusUpdate(errorStatus);
      return errorStatus;
    }
  }

  /**
   * Check if user has access to a specific premium feature
   */
  async hasAccessToFeature(feature: PremiumFeature): Promise<boolean> {
    if (!this.paywallPlugin) {
      // For web/non-native platforms, allow access for development
      return true;
    }

    try {
      const result = await this.paywallPlugin.hasAccessToFeature({ feature });
      return result.hasAccess;
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false;
    }
  }

  /**
   * Check if a feature requires premium and show paywall if needed
   */
  async checkFeatureAccessAndShowPaywall(feature: PremiumFeature): Promise<boolean> {
    const hasAccess = await this.hasAccessToFeature(feature);
    
    if (!hasAccess) {
      await this.showPaywall();
      return false;
    }
    
    return true;
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<{ success: boolean; isPremium: boolean }> {
    if (!this.paywallPlugin) {
      return { success: false, isPremium: false };
    }

    try {
      const result = await this.paywallPlugin.restorePurchases();
      // Refresh subscription status after restore
      await this.checkSubscriptionStatus();
      return result;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return { success: false, isPremium: false };
    }
  }

  /**
   * Request notification permission for trial reminders
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!this.paywallPlugin) {
      return false;
    }

    try {
      const result = await this.paywallPlugin.requestNotificationPermission();
      return result.granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Get current subscription status (cached)
   */
  getCurrentStatus(): SubscriptionStatus | null {
    return this.subscriptionStatus;
  }

  /**
   * Check if user is currently premium
   */
  isPremiumUser(): boolean {
    return this.subscriptionStatus?.isPremium ?? false;
  }

  /**
   * Check if user is in free trial
   */
  isInFreeTrial(): boolean {
    return this.subscriptionStatus?.status === 'free_trial';
  }

  /**
   * Get remaining trial days
   */
  getTrialDaysRemaining(): number {
    return this.subscriptionStatus?.trialDaysRemaining ?? 0;
  }

  /**
   * Subscribe to subscription status updates
   */
  onStatusUpdate(callback: (status: SubscriptionStatus) => void): () => void {
    this.statusUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusUpdateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of status update
   */
  private notifyStatusUpdate(status: SubscriptionStatus): void {
    this.statusUpdateCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in subscription status callback:', error);
      }
    });
  }

  /**
   * Helper method to show paywall with context
   */
  async showPaywallForFeature(feature: PremiumFeature, context?: string): Promise<void> {
    console.log(`Showing paywall for feature: ${feature}${context ? ` (${context})` : ''}`);
    await this.showPaywall();
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

// React hook for subscription status
export function useSubscription() {
  const [status, setStatus] = React.useState<SubscriptionStatus | null>(
    subscriptionService.getCurrentStatus()
  );

  React.useEffect(() => {
    // Initial check
    subscriptionService.checkSubscriptionStatus();
    
    // Subscribe to updates
    const unsubscribe = subscriptionService.onStatusUpdate(setStatus);
    
    return unsubscribe;
  }, []);

  return {
    status,
    isPremium: status?.isPremium ?? false,
    isInFreeTrial: status?.status === 'free_trial',
    trialDaysRemaining: status?.trialDaysRemaining ?? 0,
    showPaywall: subscriptionService.showPaywall.bind(subscriptionService),
    hasAccessToFeature: subscriptionService.hasAccessToFeature.bind(subscriptionService),
    checkFeatureAccessAndShowPaywall: subscriptionService.checkFeatureAccessAndShowPaywall.bind(subscriptionService),
    restorePurchases: subscriptionService.restorePurchases.bind(subscriptionService),
    refreshStatus: subscriptionService.checkSubscriptionStatus.bind(subscriptionService)
  };
}

export default subscriptionService;
