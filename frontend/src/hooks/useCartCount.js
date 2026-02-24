// contexts/CartCountContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCartCount, gettotalquantity_localstorage } from '@/services/cartServices';
import { useAuth } from '@/hooks/useAuth';

const CartCountContext = createContext();

export const CartCountProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isUser = user && user != null && user.userId && user.role !== "guest";

  const fetchCartCount = async () => {
    setLoading(true);
    try {
      if (isUser) {
        const count = await getCartCount();
        setCartCount(count);
      } else {
        const count = await gettotalquantity_localstorage();
        setCartCount(count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to manually update cart count (call after adding/removing items)
  const updateCartCount = async () => {
    await fetchCartCount();
  };

  // Function to increment cart count without API call (for immediate UI feedback)
  const incrementCartCount = (quantity = 1) => {
    setCartCount(prev => prev + quantity);
  };

  // Function to decrement cart count without API call
  const decrementCartCount = (quantity = 1) => {
    setCartCount(prev => Math.max(0, prev - quantity));
  };

  // Function to set cart count directly
  const setCartCountDirectly = (count) => {
    setCartCount(count);
  };

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  const value = {
    cartCount,
    loading,
    updateCartCount,
    incrementCartCount,
    decrementCartCount,
    setCartCount: setCartCountDirectly,
    refreshCartCount: fetchCartCount
  };

  return (
    <CartCountContext.Provider value={value}>
      {children}
    </CartCountContext.Provider>
  );
};

// Hook to use cart count
export const useCartCount = () => {
  const context = useContext(CartCountContext);
  if (!context) {
    throw new Error('useCartCount must be used within a CartCountProvider');
  }
  return context;
};