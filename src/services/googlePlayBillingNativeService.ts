import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesPackage } from '@revenuecat/purchases-capacitor';

/**
 * Google Play Billing Service - RevenueCat
 * 
 * Usa RevenueCat para manejar suscripciones de Google Play
 * Solo para Android - iOS mantiene su implementación separada
 */

export interface AndroidProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceCurrencyCode: string;
  priceAmountMicros: number;
  subscriptionPeriod?: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  purchaseToken?: string;
  error?: string;
  reason?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  productId?: string;
  expirationDate?: string;
}

class GooglePlayBillingNativeService {
  private isInitialized = false;
  private purchaseListeners: Array<(success: boolean, productId?: string) => void> = [];

  /**
   * Productos de suscripción configurados en Google Play Console
   * Incluyen los Base Plan IDs de Google Play
   */
  private readonly PRODUCT_IDS = {
    monthly: 'berun_premium_monthly:suscripcion-mensual',
    yearly: 'berun_premium_yearly:anual-medio'
  };

  constructor() {
    if (Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform()) {
      this.initialize();
    }
  }

  /**
   * Inicializar RevenueCat para Android
   */
  async initialize(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android' || !Capacitor.isNativePlatform()) {
      console.log('🤖 Google Play Billing solo disponible en Android nativo');
      return;
    }

    if (this.isInitialized) return;

    try {
      console.log('🤖 Inicializando RevenueCat para Android...');
      
      // RevenueCat API Key para Android (Public Key)
      await Purchases.configure({ 
        apiKey: 'goog_GdbNdiaGknSEcCyxDXDyciXsJMN'
      });
      
      // Setup listener para actualizaciones de customerInfo
      this.setupPurchaseListener();
      
      this.isInitialized = true;
      console.log('✅ RevenueCat para Android inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando RevenueCat para Android:', error);
    }
  }

  /**
   * Setup listener for purchase updates
   */
  private async setupPurchaseListener() {
    const listenerId = await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log('🤖 Customer info updated:', customerInfo);
      
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
   * Verificar si Google Play Billing está disponible
   */
  isAvailable(): boolean {
    return Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform();
  }

  /**
   * Obtener productos disponibles
   */
  async getProducts(): Promise<AndroidProduct[]> {
    if (!this.isAvailable()) {
      throw new Error('Google Play Billing no disponible');
    }

    try {
      await this.initialize();
      
      console.log('📦 Obteniendo productos de Google Play...');
      
      const offerings = await Purchases.getOfferings();
      console.log('🔍 FULL OFFERINGS DEBUG:', JSON.stringify(offerings, null, 2));
      
      const currentOffering = offerings.current;
      console.log('🔍 CURRENT OFFERING:', currentOffering ? 'EXISTS' : 'NULL');
      
      if (!currentOffering) {
        console.error('❌ No hay offering "current" disponible');
        console.log('🔍 All offerings:', Object.keys(offerings.all || {}));
        throw new Error('No offerings available - Verifica que el offering "default" esté marcado como "Current" en RevenueCat Dashboard');
      }

      console.log('🔍 Available packages count:', currentOffering.availablePackages?.length || 0);
      console.log('🔍 Packages details:', currentOffering.availablePackages?.map(p => ({
        identifier: p.identifier,
        productId: p.product.identifier
      })));

      const products: AndroidProduct[] = currentOffering.availablePackages.map((pkg: PurchasesPackage) => ({
        productId: pkg.product.identifier,
        price: pkg.product.priceString,
        title: pkg.product.title,
        description: pkg.product.description,
        priceCurrencyCode: pkg.product.currencyCode,
        priceAmountMicros: 0 // No disponible en RevenueCat
      }));
      
      console.log('✅ Productos obtenidos:', products);
      return products;
    } catch (error) {
      console.error('❌ Error obteniendo productos:', error);
      throw error;
    }
  }

  /**
   * Comprar suscripción
   */
  async purchase(productId: string): Promise<PurchaseResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Google Play Billing no disponible'
      };
    }

    try {
      await this.initialize();
      
      console.log('💳 Iniciando compra con Google Play:', productId);
      
      // Primero obtenemos el paquete correcto
      const offerings = await Purchases.getOfferings();
      console.log('🔍 Offerings en purchase:', offerings);
      
      const currentOffering = offerings.current;
      console.log('🔍 Current offering en purchase:', currentOffering);
      
      if (!currentOffering) {
        console.error('❌ No hay current offering disponible');
        return {
          success: false,
          error: 'No offerings available - Verifica RevenueCat Dashboard'
        };
      }

      console.log('🔍 Buscando producto:', productId);
      console.log('🔍 Packages disponibles:', currentOffering.availablePackages?.map(p => ({
        identifier: p.identifier,
        productId: p.product.identifier
      })));

      // Buscar el paquete con este productId
      const pkg = currentOffering.availablePackages.find(
        p => p.product.identifier === productId
      );

      if (!pkg) {
        console.error('❌ Producto no encontrado en packages');
        console.error('🔍 Product ID buscado:', productId);
        console.error('🔍 Product IDs disponibles:', currentOffering.availablePackages?.map(p => p.product.identifier));
        return {
          success: false,
          error: `Product not found: ${productId}. Productos disponibles: ${currentOffering.availablePackages?.map(p => p.product.identifier).join(', ') || 'ninguno'}`
        };
      }

      console.log('✅ Producto encontrado:', pkg.product.identifier);

      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      
      console.log('✅ Compra exitosa:', customerInfo);
      
      // Verificar si el usuario tiene acceso premium
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
      console.error('❌ Error en compra:', error);
      
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
   * Restaurar compras
   */
  async restore(): Promise<PurchaseResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Google Play Billing no disponible'
      };
    }

    try {
      await this.initialize();
      
      console.log('🔄 Restaurando compras...');
      
      const { customerInfo } = await Purchases.restorePurchases();
      
      const hasEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
      
      console.log('✅ Restore result:', {
        hasEntitlements,
        entitlements: Object.keys(customerInfo.entitlements.active)
      });
      
      return {
        success: hasEntitlements,
        error: hasEntitlements ? undefined : 'No se encontraron compras previas'
      };
    } catch (error: any) {
      console.error('❌ Error restaurando compras:', error);
      return {
        success: false,
        error: error.message || 'Error restaurando compras'
      };
    }
  }

  /**
   * Obtener estado de suscripción
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!this.isAvailable()) {
      return {
        isActive: false,
        isPremium: false
      };
    }

    try {
      await this.initialize();
      
      const { customerInfo } = await Purchases.getCustomerInfo();
      
      const hasAccess = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      
      return {
        isActive: hasAccess,
        isPremium: hasAccess
      };
    } catch (error) {
      console.error('❌ Error obteniendo estado de suscripción:', error);
      return {
        isActive: false,
        isPremium: false
      };
    }
  }

  /**
   * Obtener IDs de productos
   */
  getProductIdentifiers() {
    return this.PRODUCT_IDS;
  }
}

export const googlePlayBillingNativeService = new GooglePlayBillingNativeService();

