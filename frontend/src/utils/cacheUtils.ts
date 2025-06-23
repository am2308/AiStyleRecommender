/**
 * Utility functions for caching data
 */

// Cache keys
export const CACHE_KEYS = {
  WARDROBE_ITEMS: 'styleai_wardrobe_items',
  RECOMMENDATIONS: 'styleai_recommendations',
  USER_PROFILE: 'styleai_user_profile',
  MARKETPLACE_ITEMS: 'styleai_marketplace_items',
  TRENDING_ITEMS: 'styleai_trending_items',
  COMMUNITY_POSTS: 'styleai_community_posts',
  CHALLENGES: 'styleai_challenges'
};

// Cache expiration times (in milliseconds)
export const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Cache item interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiration: number;
}

// Set an item in the cache
export const setCacheItem = <T>(key: string, data: T, expiration: number = CACHE_EXPIRATION.MEDIUM): void => {
  try {
    if (data === null) {
      localStorage.removeItem(key);
      return;
    }
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiration,
    };
    
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error setting cache item:', error);
  }
};

// Get an item from the cache
export const getCacheItem = <T>(key: string): T | null => {
  try {
    const cacheItemJson = localStorage.getItem(key);
    
    if (!cacheItemJson) {
      return null;
    }
    
    const cacheItem: CacheItem<T> = JSON.parse(cacheItemJson);
    
    // Check if the cache item has expired
    if (Date.now() - cacheItem.timestamp > cacheItem.expiration) {
      localStorage.removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('Error getting cache item:', error);
    return null;
  }
};

// Remove an item from the cache
export const removeCacheItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing cache item:', error);
  }
};

// Clear all cache items
export const clearCache = (): void => {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Clear cache by pattern
export const clearCacheByPattern = (pattern: string): void => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing cache by pattern:', error);
  }
};

// Get cache size in bytes
export const getCacheSize = (): number => {
  try {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        size += (localStorage.getItem(key) || '').length;
      }
    }
    return size;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
};