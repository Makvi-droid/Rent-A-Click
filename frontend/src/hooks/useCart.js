import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, runTransaction } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../firebase';

export const useCart = () => {
  const [user] = useAuthState(auth);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerDocId, setCustomerDocId] = useState(null);

  // Find customer document by firebaseUid
  const findCustomerDoc = async (firebaseUid) => {
    try {
      const customersRef = collection(firestore, 'customers');
      const q = query(customersRef, where('firebaseUid', '==', firebaseUid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const customerDoc = querySnapshot.docs[0];
        return {
          id: customerDoc.id,
          data: customerDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding customer document:', error);
      return null;
    }
  };

  // Generate next sequential RAC ID
  const generateNextRacId = async () => {
    try {
      const nextId = await runTransaction(firestore, async (transaction) => {
        const counterRef = doc(firestore, 'counters', 'cartItems');
        const counterDoc = await transaction.get(counterRef);
        
        let nextNumber = 1;
        
        if (counterDoc.exists()) {
          const currentCount = counterDoc.data().count || 0;
          nextNumber = currentCount + 1;
        }
        
        transaction.set(counterRef, { 
          count: nextNumber, 
          updatedAt: new Date(),
          lastUsedId: `RACADC${String(nextNumber).padStart(6, '0')}`
        }, { merge: true });
        
        return nextNumber;
      });
      
      return `RACATC${String(nextId).padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating next RAC ID:', error);
      return `RACATC${Date.now()}`;
    }
  };

  // Fetch user's cart on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
      setCustomerDocId(null);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const customerDoc = await findCustomerDoc(user.uid);
      
      if (customerDoc) {
        setCustomerDocId(customerDoc.id);
        const cartData = customerDoc.data.cart || [];
        setCart(cartData);
      } else {
        console.warn('Customer document not found for user:', user.uid);
        setCart([]);
        setCustomerDocId(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
      setCustomerDocId(null);
    } finally {
      setLoading(false);
    }
  };

  // IMPROVED: Enhanced addToCart with better image handling and preservation
  const addToCart = async (cartItem) => {
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    if (!cartItem.productId) {
      console.error('Product ID is required');
      return false;
    }

    try {
      console.log('🛒 useCart: Received cart item:', JSON.stringify(cartItem, null, 2));

      let currentCustomerDocId = customerDocId;
      
      if (!currentCustomerDocId) {
        console.log('Customer doc ID not found, searching for customer document...');
        const customerDoc = await findCustomerDoc(user.uid);
        
        if (customerDoc) {
          currentCustomerDocId = customerDoc.id;
          setCustomerDocId(currentCustomerDocId);
        } else {
          console.error('Customer document not found and customerDocId is null');
          return false;
        }
      }

      const customerRef = doc(firestore, 'customers', currentCustomerDocId);
      
      const existingItemIndex = cart.findIndex(item => {
        if ((!item.variant || item.variant === null) && (!cartItem.variant || cartItem.variant === null)) {
          return item.productId === cartItem.productId;
        }
        if (item.variant && cartItem.variant) {
          return item.productId === cartItem.productId && item.variant.id === cartItem.variant.id;
        }
        return false;
      });

      let updatedCart;
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity but PRESERVE image data
        updatedCart = [...cart];
        const existingItem = updatedCart[existingItemIndex];
        
        // CRITICAL: Preserve image data - use new image if existing doesn't have one
        const preservedImage = existingItem.image || cartItem.image || cartItem.imageUrl || null;
        
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + (cartItem.quantity || 1),
          // PRESERVE all image-related fields
          image: preservedImage,
          imageUrl: preservedImage,
          images: cartItem.images || existingItem.images || (preservedImage ? [preservedImage] : []),
          // Update other fields that might have changed
          name: cartItem.name || existingItem.name,
          description: cartItem.description || existingItem.description,
          price: cartItem.price || existingItem.price,
          updatedAt: new Date(),
          // Preserve original data if available
          originalData: cartItem.originalData || existingItem.originalData
        };
        
        console.log(`✅ Updated existing cart item with preserved image: ${preservedImage}`);
        console.log('Updated item:', JSON.stringify(updatedCart[existingItemIndex], null, 2));
      } else {
        // Add new item to cart with comprehensive image preservation
        const racId = await generateNextRacId();
        console.log('Generated new RAC ID:', racId);
        
        // Ensure we capture ALL possible image data
        const imageData = {
          image: cartItem.image || cartItem.imageUrl || null,
          imageUrl: cartItem.imageUrl || cartItem.image || null,
          images: cartItem.images || (cartItem.image ? [cartItem.image] : []),
          // Preserve original data for debugging and fallback
          originalImageData: {
            image: cartItem.image,
            imageUrl: cartItem.imageUrl,
            images: cartItem.images,
            originalData: cartItem.originalData
          }
        };
        
        console.log('📷 Image data being saved:', JSON.stringify(imageData, null, 2));
        
        const newCartItem = {
          id: racId,
          productId: cartItem.productId,
          name: cartItem.name || 'Unnamed Product',
          description: cartItem.description || '',
          price: parseFloat(cartItem.price) || 0,
          quantity: cartItem.quantity || 1,
          variant: cartItem.variant || null,
          addedAt: new Date(),
          updatedAt: new Date(),
          addedFrom: cartItem.addedFrom || 'unknown',
          // CRITICAL: Include ALL image data
          ...imageData,
          // Additional metadata
          sourceData: cartItem.originalData || cartItem // Keep original data for reference
        };
        
        updatedCart = [...cart, newCartItem];
        console.log('✅ Added new item to cart:', JSON.stringify(newCartItem, null, 2));
      }

      // Update Firestore with comprehensive logging
      console.log('💾 Updating Firestore with cart items:', updatedCart.length);
      console.log('💾 Sample cart item being saved:', JSON.stringify(updatedCart[updatedCart.length - 1], null, 2));
      
      await updateDoc(customerRef, {
        cart: updatedCart,
        updatedAt: new Date()
      });
      
      // Update local state
      setCart(updatedCart);
      console.log('✅ Cart updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return false;
    }
  };

  const removeFromCart = async (productId, variantId = null) => {
    if (!user || !productId || !customerDocId) return false;
    
    try {
      const customerRef = doc(firestore, 'customers', customerDocId);
      
      const updatedCart = cart.filter(item => {
        if (variantId === null && (!item.variant || item.variant === null)) {
          return item.productId !== productId;
        }
        return !(item.productId === productId && item.variant?.id === variantId);
      });

      await updateDoc(customerRef, {
        cart: updatedCart,
        updatedAt: new Date()
      });
      
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const updateCartItemQuantity = async (productId, variantId = null, newQuantity) => {
    if (!user || !productId || newQuantity < 1 || !customerDocId) return false;
    
    try {
      const customerRef = doc(firestore, 'customers', customerDocId);
      
      const updatedCart = cart.map(item => {
        if (variantId === null && (!item.variant || item.variant === null)) {
          if (item.productId === productId) {
            return {
              ...item,
              quantity: newQuantity,
              updatedAt: new Date()
            };
          }
        }
        else if (item.productId === productId && item.variant?.id === variantId) {
          return {
            ...item,
            quantity: newQuantity,
            updatedAt: new Date()
          };
        }
        return item;
      });

      await updateDoc(customerRef, {
        cart: updatedCart,
        updatedAt: new Date()
      });
      
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return false;
    }
  };

  const clearCart = async () => {
    if (!user || !customerDocId) return false;
    
    try {
      const customerRef = doc(firestore, 'customers', customerDocId);
      
      await updateDoc(customerRef, {
        cart: [],
        updatedAt: new Date()
      });
      
      setCart([]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const isInCart = (productId, variantId = null) => {
    return cart.some(item => {
      if (variantId === null && (!item.variant || item.variant === null)) {
        return item.productId === productId;
      }
      return item.productId === productId && item.variant?.id === variantId;
    });
  };

  const getCartItemQuantity = (productId, variantId = null) => {
    const item = cart.find(item => {
      if (variantId === null && (!item.variant || item.variant === null)) {
        return item.productId === productId;
      }
      return item.productId === productId && item.variant?.id === variantId;
    });
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
    return cart.find(item => {
      if (variantId === null && (!item.variant || item.variant === null)) {
        return item.productId === productId;
      }
      return item.productId === productId && item.variant?.id === variantId;
    });
  };

  return {
    cart,
    loading,
    customerDocId,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    isInCart,
    getCartItemQuantity,
    getCartTotal,
    getCartItemCount,
    getCartItem,
    isLoggedIn: !!user,
    hasCustomerProfile: !!customerDocId,
    refreshCart: fetchCart
  };
};