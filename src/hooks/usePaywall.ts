import { useState, useCallback } from 'react';

export interface PaywallState {
  isOpen: boolean;
  isPremium: boolean;
  trialDaysRemaining: number;
}

export const usePaywall = () => {
  const [paywallState, setPaywallState] = useState<PaywallState>({
    isOpen: false,
    isPremium: false,
    trialDaysRemaining: 0,
  });

  const showPaywall = useCallback(() => {
    console.log('🎯 Showing paywall modal');
    setPaywallState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const hidePaywall = useCallback(() => {
    console.log('🎯 Hiding paywall modal');
    setPaywallState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handlePurchase = useCallback((productId: string) => {
    console.log('🎯 Purchase completed:', productId);
    
    // Simulate successful purchase
    setPaywallState({
      isOpen: false,
      isPremium: true,
      trialDaysRemaining: 3,
    });

    // Show success message
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert('¡Bienvenido a Premium! Tu prueba gratuita de 3 días ha comenzado.');
      }, 500);
    }
  }, []);

  const checkPremiumAccess = useCallback(() => {
    return paywallState.isPremium;
  }, [paywallState.isPremium]);

  const requirePremiumAccess = useCallback((featureName: string = 'esta función') => {
    if (!paywallState.isPremium) {
      console.log(`🔒 Premium required for: ${featureName}`);
      showPaywall();
      return false;
    }
    return true;
  }, [paywallState.isPremium, showPaywall]);

  return {
    ...paywallState,
    showPaywall,
    hidePaywall,
    handlePurchase,
    checkPremiumAccess,
    requirePremiumAccess,
  };
};
