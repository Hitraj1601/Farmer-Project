import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const isBuyer = isAuthenticated && user?.role === 'BUYER';

  // Fetch cart from server
  const fetchCart = useCallback(async () => {
    if (!isBuyer) {
      setCart(null);
      return;
    }
    try {
      const res = await cartService.get();
      setCart(res.data);
    } catch {
      setCart(null);
    }
  }, [isBuyer]);

  // Load cart on mount / auth change
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartItems = cart?.items || [];
  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, item) => {
    return sum + (item.quantity * (item.crop?.pricePerKg || 0));
  }, 0);

  const addToCart = async (cropId, quantity) => {
    try {
      await cartService.addItem({ cropId, quantity });
      await fetchCart();
      toast.success('Added to cart!', { icon: '🛒' });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const updateItem = async (cropId, quantity) => {
    try {
      await cartService.updateItem(cropId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item');
      return false;
    }
  };

  const removeItem = async (cropId) => {
    try {
      await cartService.removeItem(cropId);
      await fetchCart();
      toast.success('Removed from cart');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clear();
      await fetchCart();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear cart');
      return false;
    }
  };

  const checkout = async () => {
    setLoading(true);
    try {
      const res = await cartService.checkout();
      await fetchCart();
      return res.data; // array of created orders
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if a crop is already in cart
  const isInCart = (cropId) => {
    return cartItems.some((item) => item.cropId === cropId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        checkout,
        isInCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
