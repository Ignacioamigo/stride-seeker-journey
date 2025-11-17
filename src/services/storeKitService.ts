import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesPackage } from '@revenuecat/purchases-capacitor';

export interface StoreKitProduct {
  id: string;
  price: string;
  title: string;
  description: string;
  priceLocale: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  productId?: string;
  reason?: string;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  count: number;
  transactions: Array<{
    id: string;
    productId: string;
    purchaseDate: string;
  }>;
}

class StoreKitService {
  private initialized = false;
  private purchaseListeners: Array<(success: boolean, productId?: string) => void> = [];

  /**
   * Check if StoreKit is available (running on native platform)
   */
  isAvailable(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  }

  /**
   * Initialize RevenueCat
   */
  async initialize() {
    if (this.initialized || !this.isAvailable()) return;

    try {
      // RevenueCat API Key para iOS (Public Key)
      await Purchases.configure({ 
        apiKey: 'appl_CiGKvCCPkESxAmDcJJpvVUsthXB'
      });
      
      // Setup listener para actualizaciones de customerInfo
      this.setupPurchaseListener();
      
      this.initialized = true;
      console.log('✅ RevenueCat initialized');
    } catch (error) {
      console.error('❌ RevenueCat initialization error:', error);
    }
  }

  /**
   * Setup listener for purchase updates
   */
  private async setupPurchaseListener() {
    // Este listener se ejecuta cuando RevenueCat detecta cambios en el customerInfo
    // Esto incluye cuando una compra se completa exitosamente
    const listenerId = await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log('📱 Customer info updated:', customerInfo);
      
      // Detectar premium por entitlements O por suscripciones activas
      const hasPremiumEntitlement = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      const hasActiveSubscription = customerInfo.activeSubscriptions && 
                                    customerInfo.activeSubscriptions.length > 0;
      
      const hasPremium = hasPremiumEntitlement || hasActiveSubscription;
      
      if (hasPremium) {
        console.log('✅ Premium access detected!', {
          entitlement: hasPremiumEntitlement,
          subscription: hasActiveSubscription,
          activeSubscriptions: customerInfo.activeSubscriptions
        });
        // Notificar a todos los listeners
        this.notifyPurchaseListeners(true);
      } else {
        console.log('ℹ️ No premium access detected yet');
      }
    });
    
    console.log('✅ RevenueCat listener registered with ID:', listenerId);
  }

  /**
   * Add a listener for purchase completion
   */
  addPurchaseListener(callback: (success: boolean, productId?: string) => void) {
    this.purchaseListeners.push(callback);
  }

  /**
   * Remove a purchase listener
   */
  removePurchaseListener(callback: (success: boolean, productId?: string) => void) {
    this.purchaseListeners = this.purchaseListeners.filter(l => l !== callback);
  }

  /**
   * Notify all listeners about purchase completion
   */
  private notifyPurchaseListeners(success: boolean, productId?: string) {
    this.purchaseListeners.forEach(listener => {
      try {
        listener(success, productId);
      } catch (error) {
        console.error('Error in purchase listener:', error);
      }
    });
  }

  /**
   * Load products from App Store
   */
  async getProducts(productIds: string[]): Promise<StoreKitProduct[]> {
    if (!this.isAvailable()) {
      throw new Error('StoreKit not available - running on web platform');
    }

    try {
      await this.initialize();
      
      console.log('🛒 Loading products:', productIds);
      
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;
      
      if (!currentOffering) {
        throw new Error('No offerings available');
      }

      const products: StoreKitProduct[] = currentOffering.availablePackages.map((pkg: PurchasesPackage) => ({
        id: pkg.product.identifier,
        price: pkg.product.priceString,
        title: pkg.product.title,
        description: pkg.product.description,
        priceLocale: pkg.product.currencyCode
      }));
      
      console.log('✅ Products loaded:', products);
      return products;
    } catch (error) {
      console.error('❌ Error loading products:', error);
      throw error;
    }
  }

  /**
   * Purchase a product
   */
  async purchase(productId: string): Promise<PurchaseResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'StoreKit not available - running on web platform'
      };
    }

    try {
      await this.initialize();
      
      console.log('💳 Purchasing product:', productId);
      
      // Primero obtenemos el paquete correcto
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;
      
      if (!currentOffering) {
        return {
          success: false,
          error: 'No offerings available'
        };
      }

      // Buscar el paquete con este productId
      const pkg = currentOffering.availablePackages.find(
        p => p.product.identifier === productId
      );

      if (!pkg) {
        return {
          success: false,
          error: 'Product not found'
        };
      }

      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      
      console.log('✅ Purchase successful:', customerInfo);
      
      // Verificar si el usuario tiene acceso premium (por entitlement o suscripción activa)
      const hasPremiumEntitlement = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      const hasActiveSubscription = customerInfo.activeSubscriptions && 
                                    customerInfo.activeSubscriptions.length > 0;
      
      const hasPremium = hasPremiumEntitlement || hasActiveSubscription;
      
      console.log('🔍 Premium check:', {
        entitlement: hasPremiumEntitlement,
        subscription: hasActiveSubscription,
        activeSubscriptions: customerInfo.activeSubscriptions,
        result: hasPremium
      });
      
      return {
        success: hasPremium,
        productId: productId
      };
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      
      // Si el usuario canceló, no es realmente un error
      if (error.code === 1 || error.message?.includes('cancel')) {
        return {
          success: false,
          reason: 'cancelled'
        };
      }
      
      return {
        success: false,
        error: error?.message || error?.toString() || 'Unknown error occurred'
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restore(): Promise<RestoreResult> {
    if (!this.isAvailable()) {
      throw new Error('StoreKit not available - running on web platform');
    }

    try {
      await this.initialize();
      
      console.log('🔄 Restoring purchases...');
      
      const { customerInfo } = await Purchases.restorePurchases();
      
      // Convertir las entitlements activas a transacciones
      const transactions = Object.keys(customerInfo.entitlements.active).map(key => ({
        id: key,
        productId: key,
        purchaseDate: new Date().toISOString()
      }));
      
      console.log('✅ Restore result:', transactions);
      
      return {
        success: true,
        count: transactions.length,
        transactions
      };
    } catch (error) {
      console.error('❌ Restore error:', error);
      throw error;
    }
  }

  /**
   * Check subscription status
   */
  async checkStatus(productId?: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('StoreKit not available - running on web platform');
    }

    try {
      await this.initialize();
      
      const { customerInfo } = await Purchases.getCustomerInfo();
      
      if (productId) {
        const hasAccess = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
        return { hasAccess, productId };
      }
      
      return {
        purchasedProducts: Object.keys(customerInfo.entitlements.active)
      };
    } catch (error) {
      console.error('❌ Status check error:', error);
      throw error;
    }
  }

  /**
   * Get product IDs for Stride Seeker
   */
  getStrideProductIds() {
    return {
      monthly: 'berun_premium_monthly',
      yearly: 'berun_premium_yearly'
    };
  }
}

export const storeKitService = new StoreKitService();
