import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

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

export interface StoreKitPluginInterface {
  getProducts(options: { ids: string[] }): Promise<{ products: StoreKitProduct[] }>;
  purchase(options: { id: string }): Promise<PurchaseResult>;
  restore(): Promise<RestoreResult>;
  checkStatus(options?: { productId?: string }): Promise<any>;
}

const StoreKitPluginNative = registerPlugin<StoreKitPluginInterface>('StoreKitPlugin');

class StoreKitService {
  private plugin: StoreKitPluginInterface;

  constructor() {
    this.plugin = StoreKitPluginNative;
  }

  /**
   * Check if StoreKit is available (running on native platform)
   */
  isAvailable(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  }

  /**
   * Load products from App Store
   */
  async getProducts(productIds: string[]): Promise<StoreKitProduct[]> {
    if (!this.isAvailable()) {
      throw new Error('StoreKit not available - running on web platform');
    }

    try {
      console.log('🛒 Loading products:', productIds);
      const result = await this.plugin.getProducts({ ids: productIds });
      console.log('✅ Products loaded:', result.products);
      return result.products;
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
      console.log('💳 Purchasing product:', productId);
      const result = await this.plugin.purchase({ id: productId });
      console.log('✅ Purchase result:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
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
      console.log('🔄 Restoring purchases...');
      const result = await this.plugin.restore();
      console.log('✅ Restore result:', result);
      return result;
    } catch (error) {
      console.error('❌ Restore error:', error);
      throw error;
    }
  }

  /**
   * Check subscription status for a specific product
   */
  async checkStatus(productId?: string): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('StoreKit not available - running on web platform');
    }

    try {
      const params = productId ? { productId } : {};
      const result = await this.plugin.checkStatus(params);
      console.log('📊 Status check result:', result);
      return result;
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
