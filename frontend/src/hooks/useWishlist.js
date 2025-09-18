// hooks/useWishlist.js
import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove, query, collection, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../firebase';

export const useWishlist = () => {
  const [user] = useAuthState(auth);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerDocId, setCustomerDocId] = useState(null);

  // Find customer document by firebaseUid and fetch wishlist
  useEffect(() => {
    if (user) {
      fetchCustomerAndWishlist();
    } else {
      setWishlist([]);
      setCustomerDocId(null);
    }
  }, [user]);

  const fetchCustomerAndWishlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Query customers collection to find document with matching firebaseUid
      const customersRef = collection(firestore, 'customers');
      const q = query(customersRef, where('firebaseUid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Customer exists, get their wishlist
        const customerDoc = querySnapshot.docs[0];
        const customerData = customerDoc.data();
        setCustomerDocId(customerDoc.id);
        setWishlist(customerData.wishlist || []);
      } else {
        // Customer doesn't exist, this might happen if they haven't created a profile yet
        console.log('Customer profile not found. Wishlist will be empty until profile is created.');
        setWishlist([]);
        setCustomerDocId(null);
      }
    } catch (error) {
      console.error('Error fetching customer wishlist:', error);
      setWishlist([]);
      setCustomerDocId(null);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user || !productId || !customerDocId) {
      console.log('Cannot add to wishlist: missing user, productId, or customer profile');
      return false;
    }
    
    try {
      const customerRef = doc(firestore, 'customers', customerDocId);
      await updateDoc(customerRef, {
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
    if (!user || !productId || !customerDocId) {
      console.log('Cannot remove from wishlist: missing user, productId, or customer profile');
      return false;
    }
    
    try {
      const customerRef = doc(firestore, 'customers', customerDocId);
      await updateDoc(customerRef, {
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
      console.log('User must be logged in to use wishlist');
      return false;
    }

    if (!customerDocId) {
      console.log('Customer profile not found. Please create a customer profile first.');
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
    isLoggedIn: !!user,
    hasCustomerProfile: !!customerDocId,
    customerDocId
  };
};