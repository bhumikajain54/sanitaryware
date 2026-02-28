import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import customerService from '../services/customerService';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from local storage or API
  useEffect(() => {
    // Don't fetch until auth is fully loaded
    if (authLoading) return;

    const fetchWishlist = async () => {
      if (isAuthenticated && !isAdmin) {
        setLoading(true);
        try {
          const data = await customerService.getWishlist();
          setWishlist(data || []);
        } catch (err) {
          console.error('Failed to fetch wishlist:', err);
        } finally {
          setLoading(false);
        }
      } else if (isAdmin) {
        setWishlist([]);
      } else {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      }
    };

    fetchWishlist();
  }, [isAuthenticated, isAdmin, authLoading]);

  // Sync with localStorage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const addToWishlist = async (product) => {
    if (isAuthenticated && !isAdmin) {
      try {
        await customerService.addToWishlist(product.id);
        const data = await customerService.getWishlist();
        setWishlist(data || []);
      } catch (err) {
        console.error('Failed to add to wishlist:', err);
      }
    } else if (!isAuthenticated) {
      setWishlist((prev) => {
        if (prev.find((item) => item.id === product.id)) return prev;
        return [...prev, product];
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    // Optimistic update
    const previousWishlist = [...wishlist];
    setWishlist((prev) => prev.filter((item) => (item.id !== productId && item.productId !== productId)));

    if (isAuthenticated && !isAdmin) {
      try {
        await customerService.removeFromWishlist(productId);
      } catch (err) {
        console.error('Failed to remove from wishlist:', err);
        // Rollback on error
        setWishlist(previousWishlist);
      }
    } else if (!isAuthenticated) {
      // Local storage sync handled by useEffect
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item.id === productId || item.productId === productId));
  };

  const toggleWishlist = (product) => {
    const productId = product.id || product.productId;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = async () => {
    const previousWishlist = [...wishlist];
    setWishlist([]);
    
    if (isAuthenticated && !isAdmin) {
      try {
        await customerService.clearWishlist();
      } catch (err) {
        console.error('Failed to clear wishlist:', err);
        setWishlist(previousWishlist); // Rollback
      }
    } else if (!isAuthenticated) {
      localStorage.removeItem('wishlist');
    }
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems: wishlist, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      getWishlistCount,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
