import { createContext, useContext, useState, useEffect } from 'react';
import * as customerService from '../services/customerService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart
  const fetchCart = async () => {
    if (!isAuthenticated) {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      return;
    }

    try {
      setLoading(true);
      const backendCart = await customerService.getCart();
      const items = Array.isArray(backendCart) ? backendCart : (backendCart.items || backendCart.cartItems || []);
      
      // Normalize items from backend structure (often nested product)
      const normalizedItems = items.map(item => {
        const product = item.product || {};
        
        // Robust price detection
        const priceValue = item.price !== undefined ? item.price : (product.price !== undefined ? product.price : (item.amount || product.amount || 0));
        const price = typeof priceValue === 'string' ? parseFloat(priceValue.replace(/[^0-9.]/g, '')) : (parseFloat(priceValue) || 0);
        
        // Robust original price detection
        const origPriceValue = item.originalPrice || product.originalPrice || item.mrp || product.mrp || (price > 0 ? price * 1.2 : 0);
        const originalPrice = typeof origPriceValue === 'string' ? parseFloat(origPriceValue.replace(/[^0-9.]/g, '')) : (parseFloat(origPriceValue) || 0);

        return {
          ...item,
          // CRITICAL: Preserve the actual Cart Item ID for deletion/updates
          itemId: item.itemId || item.id, 
          // Use product fields if available, otherwise fallback to item fields
          id: item.productId || product.id || item.id,
          name: item.name || product.name || 'Unknown Product',
          price: price,
          originalPrice: originalPrice > price ? originalPrice : (price > 0 ? price * 1.2 : 0),
          image: item.image || product.image || product.imageUrl || item.imageUrl || '/Logo2.png',
          // Fix: Never fallback to the object itself. If name is missing, use "No Brand"
          brand: typeof item.brand === 'string' ? item.brand : (item.brand?.name || product.brand?.name || 'No Brand'),
          category: typeof item.category === 'string' ? item.category : (item.category?.name || product.category?.name || 'No Category'),
          quantity: item.quantity || 1
        };
      });
      
      setCartItems(normalizedItems);
    } catch (error) {
      console.error("Failed to fetch cart from backend", error);
      // Fallback to local
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        await customerService.addToCart(product.id || product.productId, quantity);
        await fetchCart(); // Refresh from backend
      } catch (error) {
        console.error("Failed to add to cart on backend", error);
      }
    } else {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => (item.id || item.productId) === (product.id || product.productId));
        if (existingItem) {
          return prevItems.map((item) =>
            (item.id || item.productId) === (product.id || product.productId)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { 
          ...product, 
          quantity,
          price: product.price || 0,
          originalPrice: product.originalPrice || (product.price ? product.price * 1.2 : 0)
        }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    // 1. Optimistic Update (Instant UI removal)
    const previousItems = [...cartItems];
    setCartItems((prevItems) => prevItems.filter((item) => (item.id || item.productId) !== productId));

    if (isAuthenticated) {
      try {
        const item = previousItems.find(i => (i.id || i.productId) === productId);
        const idToDelete = item?.itemId || item?.id || productId;
        
        await customerService.removeFromCart(idToDelete);
        await fetchCart(); // Sync final state
      } catch (error) {
        console.error("Failed to remove from cart on backend", error);
        setCartItems(previousItems); // Revert on error
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    // 1. Optimistic Update (Instant UI update)
    const previousItems = [...cartItems];
    setCartItems(prev => prev.map(item => 
        (item.id || item.productId) === productId ? { ...item, quantity } : item
    ));
    
    if (isAuthenticated) {
      try {
        const item = previousItems.find(i => (i.id || i.productId) === productId);
        const idToUpdate = item?.itemId || item?.id || productId;

        if (item?.itemId || item?.id) {
          await customerService.updateCartItem(idToUpdate, quantity);
        } else {
          await customerService.addToCart(productId, quantity);
        }
        await fetchCart(); // Sync final state
      } catch (error) {
        console.error("Failed to update cart quantity on backend", error);
        setCartItems(previousItems); // Revert on error
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (isAuthenticated) {
      try {
        await customerService.clearCart();
      } catch (error) {
        console.error("Failed to clear cart on backend", error);
      }
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    refreshCart: fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
