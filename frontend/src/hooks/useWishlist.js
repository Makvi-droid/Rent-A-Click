// hooks/useWishlist.js
import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../firebase';

export const useWishlist = () => {
  const [user] = useAuthState(auth);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's wishlist on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setWishlist(userData.wishlist || []);
      } else {
        // If user document doesn't exist, create it with empty wishlist
        await updateDoc(userRef, {
          wishlist: []
        });
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user || !productId) return false;
    
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        wishlist: arrayUnion(productId),
        updatedAt: new Date()
      });
      
      // Update local state
      setWishlist(prev => [...prev, productId]);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user || !productId) return false;
    
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        wishlist: arrayRemove(productId),
        updatedAt: new Date()
      });
      
      // Update local state
      setWishlist(prev => prev.filter(id => id !== productId));
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      // You can show a toast or redirect to login here
      console.log('User must be logged in to use wishlist');
      return false;
    }

    const isInWishlist = wishlist.includes(productId);
    
    if (isInWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    isLoggedIn: !!user
  };
};