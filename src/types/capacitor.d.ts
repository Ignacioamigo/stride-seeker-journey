// Capacitor plugin type declarations

declare global {
  interface Window {
    Capacitor: {
      Plugins: {
        PaywallPlugin: {
          showPaywall(): Promise<void>;
          checkSubscriptionStatus(): Promise<{
            status: string;
            isActive: boolean;
            trialDaysRemaining: number;
            isPremium: boolean;
          }>;
          hasAccessToFeature(options: { feature: string }): Promise<{
            hasAccess: boolean;
            requiresPremium: boolean;
          }>;
          restorePurchases(): Promise<{
            success: boolean;
            isPremium: boolean;
          }>;
          purchaseProduct(options: { productId: string }): Promise<{
            success: boolean;
            productId?: string;
            message?: string;
            error?: string;
          }>;
          requestNotificationPermission(): Promise<{
            granted: boolean;
          }>;
        };
      };
    };
  }
}

export {};
