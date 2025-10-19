import { Capacitor } from '@capacitor/core';

/**
 * Google Play Billing Service - Implementación Nativa
 * 
 * Usa la API nativa de Google Play Billing sin dependencias externas
 * Solo para Android - iOS mantiene su implementación con StoreKit
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
}

export interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  productId?: string;
  expirationDate?: string;
}

class GooglePlayBillingNativeService {
  private isInitialized = false;
  private billingClient: any = null;

  /**
   * Productos de suscripción configurados en Google Play Console
   */
  private readonly PRODUCT_IDS = {
    monthly: 'berun_premium_monthly',
    yearly: 'berun_premium_yearly'
  };

  constructor() {
    if (Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform()) {
      this.initialize();
    }
  }

  /**
   * Inicializar Google Play Billing (solo Android)
   */
  async initialize(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android' || !Capacitor.isNativePlatform()) {
      console.log('🤖 Google Play Billing solo disponible en Android nativo');
      return;
    }

    try {
      console.log('🤖 Inicializando Google Play Billing nativo...');
      
      // Llamar al código nativo de Android a través del plugin
      const result = await this.callNative('initializeBilling', {});
      
      if (result.success) {
        this.isInitialized = true;
        console.log('✅ Google Play Billing inicializado correctamente');
      } else {
        console.error('❌ Error inicializando Google Play Billing:', result.error);
      }
    } catch (error) {
      console.error('❌ Error inicializando Google Play Billing:', error);
    }
  }

  /**
   * Verificar si Google Play Billing está disponible
   */
  isAvailable(): boolean {
    return Capacitor.getPlatform() === 'android' && 
           Capacitor.isNativePlatform() && 
           this.isInitialized;
  }

  /**
   * Obtener productos disponibles
   */
  async getProducts(): Promise<AndroidProduct[]> {
    if (!this.isAvailable()) {
      throw new Error('Google Play Billing no disponible');
    }

    try {
      console.log('📦 Obteniendo productos de Google Play...');
      
      const result = await this.callNative('queryProducts', {
        productIds: Object.values(this.PRODUCT_IDS)
      });
      
      if (result.success && result.products) {
        console.log('✅ Productos obtenidos:', result.products);
        return result.products;
      } else {
        throw new Error(result.error || 'Error obteniendo productos');
      }
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
      console.log('💳 Iniciando compra con Google Play:', productId);
      
      const result = await this.callNative('purchaseProduct', {
        productId: productId
      });
      
      if (result.success) {
        console.log('✅ Compra exitosa:', result);
        return {
          success: true,
          productId: result.productId,
          purchaseToken: result.purchaseToken
        };
      } else {
        console.error('❌ Error en compra:', result.error);
        return {
          success: false,
          error: result.error || 'Error en la compra'
        };
      }
    } catch (error: any) {
      console.error('❌ Error en compra:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
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
      console.log('🔄 Restaurando compras...');
      
      const result = await this.callNative('restorePurchases', {});
      
      if (result.success) {
        console.log('✅ Compras restauradas:', result);
        return {
          success: true,
          productId: result.productId,
          purchaseToken: result.purchaseToken
        };
      } else {
        return {
          success: false,
          error: 'No se encontraron compras previas'
        };
      }
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
      const result = await this.callNative('getSubscriptionStatus', {});
      
      if (result.success && result.isActive) {
        return {
          isActive: true,
          isPremium: true,
          productId: result.productId,
          expirationDate: result.expirationDate
        };
      } else {
        return {
          isActive: false,
          isPremium: false
        };
      }
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

  /**
   * Llamar a método nativo de Android
   */
  private async callNative(method: string, params: any): Promise<any> {
    try {
      // Usar el plugin nativo de Google Play Billing
      const { GooglePlayBilling } = Capacitor.Plugins;
      
      if (!GooglePlayBilling) {
        console.warn('⚠️ Plugin GooglePlayBilling no encontrado, usando fallback para web');
        return this.getFallbackResponse(method, params);
      }
      
      console.log(`🔵 Llamando a método nativo: ${method}`, params);
      
      // Llamar al método correspondiente del plugin nativo
      let result: any;
      
      switch (method) {
        case 'initializeBilling':
          result = await GooglePlayBilling.initialize();
          break;
        
        case 'queryProducts':
          result = await GooglePlayBilling.queryProducts(params);
          break;
        
        case 'purchaseProduct':
          result = await GooglePlayBilling.purchaseProduct(params);
          break;
        
        case 'restorePurchases':
          result = await GooglePlayBilling.restorePurchases();
          break;
        
        case 'getSubscriptionStatus':
          result = await GooglePlayBilling.getSubscriptionStatus();
          break;
        
        default:
          throw new Error(`Método no soportado: ${method}`);
      }
      
      console.log(`✅ Respuesta del método ${method}:`, result);
      return result;
      
    } catch (error: any) {
      console.error(`❌ Error en llamada nativa ${method}:`, error);
      
      // Si estamos en web o hay error, usar fallback
      if (Capacitor.getPlatform() === 'web') {
        return this.getFallbackResponse(method, params);
      }
      
      throw error;
    }
  }
  
  /**
   * Respuesta fallback para desarrollo en web
   */
  private getFallbackResponse(method: string, params: any): any {
    console.log(`🌐 Usando fallback para ${method}`);
    
    switch (method) {
      case 'initializeBilling':
        return { success: true };
      
      case 'queryProducts':
        return {
          success: true,
          products: [
            {
              productId: 'berun_premium_monthly',
              title: 'BeRun Premium Mensual',
              description: 'Suscripción mensual a BeRun Premium con 3 días gratis',
              price: '9,99 €',
              priceCurrencyCode: 'EUR',
              priceAmountMicros: 9990000
            },
            {
              productId: 'berun_premium_yearly',
              title: 'BeRun Premium Anual',
              description: 'Suscripción anual a BeRun Premium con 3 días gratis',
              price: '34,99 €',
              priceCurrencyCode: 'EUR',
              priceAmountMicros: 34990000
            }
          ]
        };
      
      case 'purchaseProduct':
        return {
          success: true,
          productId: params.productId,
          purchaseToken: 'dev_token_' + Date.now()
        };
      
      case 'restorePurchases':
        return {
          success: false,
          error: 'No purchases found'
        };
      
      case 'getSubscriptionStatus':
        return {
          success: false,
          isActive: false
        };
      
      default:
        return { success: false, error: 'Método no implementado' };
    }
  }
}

export const googlePlayBillingNativeService = new GooglePlayBillingNativeService();

