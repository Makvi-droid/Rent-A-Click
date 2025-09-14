import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../firebase';

export const useCart = () => {
  const [user] = useAuthState(auth);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's cart on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCart(userData.cart || []);
      } else {
        // If user document doesn't exist, create it with empty cart
        await setDoc(userRef, {
          cart: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });
        setCart([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (cartItem) => {
    if (!user || !cartItem.productId) return false;
    
    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      // Check if item with same product and variant already exists
      const existingItemIndex = cart.findIndex(item => 
        item.productId === cartItem.productId && 
        item.variant?.id === cartItem.variant?.id
      );

      let updatedCart;
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedCart = [...cart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: cartItem.quantity,
          updatedAt: new Date()
        };
      } else {
        // Add new item to cart
        const newCartItem = {
          ...cartItem,
          id: Date.now().toString(), // Simple ID generation
          addedAt: new Date()
        };
        updatedCart = [...cart, newCartItem];
      }

      // Update Firestore
      await updateDoc(userRef, {
        cart: updatedCart,
        updatedAt: new Date()
      });
      
      // Update local state
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (productId, variantId = null) => {
    if (!user || !productId) return false;
    
    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      const updatedCart = cart.filter(item => 
        !(item.productId === productId && item.variant?.id === variantId)
      );

      await updateDoc(userRef, {
        cart: updatedCart,
        updatedAt: new Date()
      });
      
      // Update local state
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const updateCartItemQuantity = async (productId, variantId = null, newQuantity) => {
    if (!user || !productId || newQuantity < 1) return false;
    
    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      const updatedCart = cart.map(item => {
        if (item.productId === productId && item.variant?.id === variantId) {
          return {
            ...item,
            quantity: newQuantity,
            updatedAt: new Date()
          };
        }
        return item;
      });

      await updateDoc(userRef, {
        cart: updatedCart,
        updatedAt: new Date()
      });
      
      // Update local state
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return false;
    }
  };

  const clearCart = async () => {
    if (!user) return false;
    
    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      await updateDoc(userRef, {
        cart: [],
        updatedAt: new Date()
      });
      
      // Update local state
      setCart([]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const isInCart = (productId, variantId = null) => {
    return cart.some(item => 
      item.productId === productId && item.variant?.id === variantId
    );
  };

  const getCartItemQuantity = (productId, variantId = null) => {
    const item = cart.find(item => 
      item.productId === productId && item.variant?.id === variantId
    );
    return item ? item.quantity : 0;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.variant?.price || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartItem = (productId, variantId = null) => {
    return cart.find(item => 
      item.productId === productId && item.variant?.id === variantId
    );
  };

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    isInCart,
    getCartItemQuantity,
    getCartTotal,
    getCartItemCount,
    getCartItem,
    isLoggedIn: !!user
  };
};