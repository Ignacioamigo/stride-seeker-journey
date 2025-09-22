import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    StoreKitPlugin: any;
  }
}

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
  private plugin: any;

  constructor() {
    if (Capacitor.isNativePlatform()) {
      this.plugin = window.StoreKitPlugin;
    }
  }

  /**
   * Check if StoreKit is available (running on native platform)
   */
  isAvailable(): boolean {
    return Capacitor.isNativePlatform() && this.plugin;
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
      throw new Error('StoreKit not available - running on web platform');
    }

    try {
      console.log('💳 Purchasing product:', productId);
      const result = await this.plugin.purchase({ id: productId });
      console.log('✅ Purchase result:', result);
      return result;
    } catch (error) {
      console.error('❌ Purchase error:', error);
      throw error;
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
      monthly: 'stride_seeker_premium_monthly',
      yearly: 'stride_seeker_premium_yearly'
    };
  }
}

export const storeKitService = new StoreKitService();
