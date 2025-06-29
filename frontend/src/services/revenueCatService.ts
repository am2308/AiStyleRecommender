import { RevenueCat } from 'revenuecat-js';

// Initialize RevenueCat with your public SDK key
const revenueCat = new RevenueCat({
  publicApiKey: import.meta.env.VITE_REVENUECAT_PUBLIC_KEY || 'your_public_key_here',
});

export interface Offering {
  identifier: string;
  serverDescription: string;
  availablePackages: Package[];
}

export interface Package {
  identifier: string;
  packageType: string;
  product: Product;
  offeringIdentifier: string;
}

export interface Product {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

export interface CustomerInfo {
  originalAppUserId: string;
  entitlements: {
    [key: string]: {
      identifier: string;
      isActive: boolean;
      willRenew: boolean;
      periodType: string;
      latestPurchaseDate: string;
      originalPurchaseDate: string;
      expirationDate: string | null;
      productIdentifier: string;
      isSandbox: boolean;
    }
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
}

export const revenueCatService = {
  /**
   * Initialize RevenueCat with user ID
   */
  initialize: async (userId: string): Promise<void> => {
    try {
      await revenueCat.identify(userId);
      console.log('RevenueCat initialized with user ID:', userId);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  },

  /**
   * Get available offerings
   */
  getOfferings: async (): Promise<Offering[]> => {
    try {
      const offerings = await revenueCat.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      throw error;
    }
  },

  /**
   * Get customer info
   */
  getCustomerInfo: async (): Promise<CustomerInfo> => {
    try {
      const customerInfo = await revenueCat.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
  },

  /**
   * Purchase a package
   */
  purchasePackage: async (packageObject: Package): Promise<CustomerInfo> => {
    try {
      const customerInfo = await revenueCat.purchasePackage(packageObject);
      return customerInfo;
    } catch (error) {
      console.error('Failed to purchase package:', error);
      throw error;
    }
  },

  /**
   * Restore purchases
   */
  restorePurchases: async (): Promise<CustomerInfo> => {
    try {
      const customerInfo = await revenueCat.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  },

  /**
   * Check if user has active subscription
   */
  hasActiveSubscription: async (entitlementId: string = 'premium'): Promise<boolean> => {
    try {
      const customerInfo = await revenueCat.getCustomerInfo();
      return customerInfo.entitlements[entitlementId]?.isActive || false;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  },

  /**
   * Get subscription expiration date
   */
  getSubscriptionExpirationDate: async (entitlementId: string = 'premium'): Promise<string | null> => {
    try {
      const customerInfo = await revenueCat.getCustomerInfo();
      return customerInfo.entitlements[entitlementId]?.expirationDate || null;
    } catch (error) {
      console.error('Failed to get subscription expiration date:', error);
      return null;
    }
  }
};