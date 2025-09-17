import { useState, useEffect, useRef, useMemo } from "react";

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
  isReady: boolean;
}

// Global cache with better error handling
let globalInsets: SafeAreaInsets | null = null;
let globalReady = false;
let initializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 5;

/**
 * ULTRA-ROBUST Safe Area Insets Hook
 * Handles all edge cases and provides bulletproof fallbacks
 */
export function useSafeAreaInsetsRobust(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>(() => {
    if (globalInsets) {
      return globalInsets;
    }
    
    // Safe defaults that work on all devices
    return {
      top: 44,      // Standard iOS status bar
      right: 0,
      bottom: 34,   // Standard iOS home indicator
      left: 0,
      isReady: false
    };
  });

  const calculatedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getInsetSafe = (name: string): number => {
    if (typeof window === "undefined") {
      console.log(`🔒 SSR detected, using fallback for ${name}`);
      return name === 'safe-area-inset-top' ? 44 : name === 'safe-area-inset-bottom' ? 34 : 0;
    }
    
    try {
      // Method 1: Try CSS custom properties first
      const style = getComputedStyle(document.documentElement);
      const customProp = style.getPropertyValue(`--sa-${name.replace('safe-area-inset-', '')}`);
      if (customProp && customProp !== '') {
        const value = parseInt(customProp) || 0;
        console.log(`✅ CSS custom property ${name}: ${value}`);
        return value;
      }

      // Method 2: Try CSS env() with temporary element
      const el = document.createElement("div");
      el.style.cssText = `
        position: absolute; 
        visibility: hidden; 
        top: 0; 
        left: 0; 
        width: 0; 
        height: 0; 
        padding-top: env(${name}, 0px);
        pointer-events: none;
      `;
      
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el).paddingTop;
      document.body.removeChild(el);
      
      const value = parseInt(computed) || 0;
      console.log(`✅ CSS env() ${name}: ${value}`);
      return value;
      
    } catch (error) {
      console.warn(`⚠️ Error reading safe area inset ${name}:`, error);
      
      // Fallback values based on common device characteristics
      if (name === 'safe-area-inset-top') {
        // Try to detect if it's likely an iPhone with notch
        const isLikelyIPhoneWithNotch = /iPhone/.test(navigator.userAgent) && 
                                        window.screen.height >= 812; // iPhone X and newer
        return isLikelyIPhoneWithNotch ? 44 : 20;
      }
      
      if (name === 'safe-area-inset-bottom') {
        const isLikelyIPhoneWithHomeIndicator = /iPhone/.test(navigator.userAgent) && 
                                                window.screen.height >= 812;
        return isLikelyIPhoneWithHomeIndicator ? 34 : 0;
      }
      
      return 0;
    }
  };

  const calculateInsets = () => {
    if (calculatedRef.current && globalInsets) {
      console.log('🔄 Using cached insets:', globalInsets);
      return;
    }
    
    initializationAttempts++;
    console.log(`🔍 Calculating safe area insets (attempt ${initializationAttempts}/${MAX_INITIALIZATION_ATTEMPTS})`);
    
    try {
      const newInsets: SafeAreaInsets = {
        top: getInsetSafe("safe-area-inset-top"),
        right: getInsetSafe("safe-area-inset-right"),
        bottom: getInsetSafe("safe-area-inset-bottom"),
        left: getInsetSafe("safe-area-inset-left"),
        isReady: true
      };
      
      console.log('✅ Safe area insets calculated:', newInsets);
      
      // Update global cache
      globalInsets = newInsets;
      globalReady = true;
      
      setInsets(newInsets);
      calculatedRef.current = true;
      
      // Clear any pending retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
    } catch (error) {
      console.error('🚨 Critical error calculating safe area insets:', error);
      
      // Use ultra-safe fallbacks
      const fallbackInsets: SafeAreaInsets = {
        top: 44,
        right: 0,
        bottom: 34,
        left: 0,
        isReady: true // Mark as ready even with fallbacks
      };
      
      globalInsets = fallbackInsets;
      globalReady = true;
      setInsets(fallbackInsets);
      calculatedRef.current = true;
    }
  };

  useEffect(() => {
    // If we already have global insets, use them immediately
    if (globalInsets && globalReady) {
      setInsets(globalInsets);
      calculatedRef.current = true;
      return;
    }

    // Calculate insets with retry logic
    const attemptCalculation = () => {
      if (calculatedRef.current) return;
      
      if (document.readyState === 'complete') {
        calculateInsets();
      } else {
        // Wait for DOM to be ready
        const timer = setTimeout(() => {
          if (!calculatedRef.current && initializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
            calculateInsets();
          } else if (initializationAttempts >= MAX_INITIALIZATION_ATTEMPTS) {
            console.warn('⚠️ Max initialization attempts reached, using fallbacks');
            const fallbackInsets: SafeAreaInsets = {
              top: 44,
              right: 0,
              bottom: 34,
              left: 0,
              isReady: true
            };
            globalInsets = fallbackInsets;
            globalReady = true;
            setInsets(fallbackInsets);
            calculatedRef.current = true;
          }
        }, 50 * initializationAttempts); // Progressive delay
        
        return () => clearTimeout(timer);
      }
    };

    attemptCalculation();

    // Handle orientation and app state changes
    const handleLayoutChange = () => {
      console.log('📱 Layout change detected, recalculating insets');
      globalInsets = null;
      globalReady = false;
      calculatedRef.current = false;
      initializationAttempts = 0;
      
      // Debounce recalculation
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      retryTimeoutRef.current = setTimeout(() => {
        calculateInsets();
      }, 200);
    };
    
    window.addEventListener('orientationchange', handleLayoutChange);
    window.addEventListener('resize', handleLayoutChange);
    
    // Capacitor app state listener with better error handling
    let backgroundListener: any = null;
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      try {
        const { App } = (window as any).Capacitor.Plugins;
        if (App && App.addListener) {
          backgroundListener = App.addListener('appStateChange', (state: any) => {
            console.log('📱 App state changed:', state);
            if (state.isActive) {
              handleLayoutChange();
            }
          });
        }
      } catch (e) {
        console.log('ℹ️ Capacitor not available or error setting up listener:', e);
      }
    }
    
    return () => {
      window.removeEventListener('orientationchange', handleLayoutChange);
      window.removeEventListener('resize', handleLayoutChange);
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (backgroundListener && backgroundListener.remove) {
        try {
          backgroundListener.remove();
        } catch (e) {
          console.warn('Error removing background listener:', e);
        }
      }
    };
  }, []);

  // Return memoized result with guaranteed properties
  return useMemo(() => {
    const result = {
      top: insets.top || 0,
      right: insets.right || 0,
      bottom: insets.bottom || 0,
      left: insets.left || 0,
      isReady: insets.isReady || false
    };
    
    console.log('🎯 Returning safe area insets:', result);
    return result;
  }, [insets.top, insets.right, insets.bottom, insets.left, insets.isReady]);
}
