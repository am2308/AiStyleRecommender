import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { wardrobeService, WardrobeItem } from '../services/wardrobeService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { getCacheItem, setCacheItem, CACHE_KEYS, CACHE_EXPIRATION } from '../utils/cacheUtils';

interface WardrobeContextType {
  items: WardrobeItem[];
  isLoading: boolean;
  addItem: (itemData: {
    name: string;
    category: string;
    color: string;
    image: File;
  }) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshItems = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check cache first
      const cachedItems = getCacheItem<WardrobeItem[]>(CACHE_KEYS.WARDROBE_ITEMS);
      if (cachedItems) {
        console.log('Using cached wardrobe items');
        setItems(cachedItems);
        setIsLoading(false);
        
        // Refresh in background after a delay
        setTimeout(async () => {
          try {
            const freshItems = await wardrobeService.getItems();
            if (JSON.stringify(freshItems) !== JSON.stringify(cachedItems)) {
              setItems(freshItems);
              setCacheItem(CACHE_KEYS.WARDROBE_ITEMS, freshItems, CACHE_EXPIRATION.SHORT);
            }
          } catch (error) {
            console.error('Background refresh failed:', error);
          }
        }, 2000);
        
        return;
      }
      
      // If not in cache, fetch from API
      const wardrobeItems = await wardrobeService.getItems();
      setItems(wardrobeItems || []);
      
      // Cache the items
      setCacheItem(CACHE_KEYS.WARDROBE_ITEMS, wardrobeItems, CACHE_EXPIRATION.SHORT);
    } catch (error) {
      console.error('Failed to fetch wardrobe items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshItems();
  }, [isAuthenticated, refreshItems]);

  const addItem = async (itemData: {
    name: string;
    category: string;
    color: string;
    image: File;
  }) => {
    try {
      const newItem = await wardrobeService.addItem(itemData);
      
      // Update local state optimistically
      setItems((prevItems) => [...prevItems, newItem]);
      
      toast.success('Item added to wardrobe!');
      
      // Invalidate cache
      setCacheItem(CACHE_KEYS.WARDROBE_ITEMS, null, 0);
      
      // Also invalidate recommendations cache since they depend on wardrobe items
      setCacheItem(CACHE_KEYS.RECOMMENDATIONS, null, 0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item');
      throw error;
    }
  };

  const removeItem = async (id: string) => {
    try {
      // Update local state optimistically
      setItems((prevItems) => prevItems.filter(item => item.id !== id));
      
      // Then perform the API call
      await wardrobeService.deleteItem(id);
      
      toast.success('Item removed from wardrobe');
      
      // Invalidate cache
      setCacheItem(CACHE_KEYS.WARDROBE_ITEMS, null, 0);
      
      // Also invalidate recommendations cache
      setCacheItem(CACHE_KEYS.RECOMMENDATIONS, null, 0);
    } catch (error: any) {
      // Revert the optimistic update if the API call fails
      refreshItems();
      toast.error(error.message || 'Failed to remove item');
      throw error;
    }
  };

  return (
    <WardrobeContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        removeItem,
        refreshItems,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};