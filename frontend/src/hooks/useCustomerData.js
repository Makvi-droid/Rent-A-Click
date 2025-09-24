// 1. hooks/useCustomerData.js
import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const useCustomerData = (user, authLoading, customerId) => {
  const [customerData, setCustomerData] = useState(null);
  const [customerDocId, setCustomerDocId] = useState(null);
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);
  const [shouldCreateCustomerProfile, setShouldCreateCustomerProfile] = useState(false);

  const findCustomerDoc = async (firebaseUid) => {
    try {
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('firebaseUid', '==', firebaseUid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const customerDoc = querySnapshot.docs[0];
        return { id: customerDoc.id, data: customerDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error finding customer document:', error);
      return null;
    }
  };

  const createCustomerProfile = async (firebaseUid, userData) => {
    try {
      const customersRef = collection(db, 'customers');
      const newCustomerData = {
        firebaseUid: firebaseUid,
        firstName: userData?.displayName?.split(' ')[0] || '',
        lastName: userData?.displayName?.split(' ').slice(1).join(' ') || '',
        email: userData?.email || '',
        phone: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
        paypalEmail: '',
        newsletter: false,
        cart: [],
        orderHistory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileCompleted: false,
        lastLoginAt: serverTimestamp(),
        accountStatus: 'active',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false
        }
      };

      const docRef = await addDoc(customersRef, newCustomerData);
      return { id: docRef.id, data: newCustomerData };
    } catch (error) {
      console.error('Error creating customer profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) {
        setLoadingCustomerData(false);
        return;
      }

      try {
        setLoadingCustomerData(true);
        let customerDoc = null;
        
        if (customerId) {
          try {
            const customerRef = doc(db, 'customers', customerId);
            const customerSnapshot = await getDoc(customerRef);
            if (customerSnapshot.exists()) {
              customerDoc = { id: customerSnapshot.id, data: customerSnapshot.data() };
            }
          } catch (error) {
            console.warn('Error fetching customer by ID, falling back to firebaseUid query:', error);
          }
        }
        
        if (!customerDoc) {
          customerDoc = await findCustomerDoc(user.uid);
        }
        
        if (customerDoc) {
          setCustomerDocId(customerDoc.id);
          setCustomerData(customerDoc.data);
          setShouldCreateCustomerProfile(false);
        } else {
          setShouldCreateCustomerProfile(true);
          try {
            const newCustomerDoc = await createCustomerProfile(user.uid, user);
            setCustomerDocId(newCustomerDoc.id);
            setCustomerData(newCustomerDoc.data);
            setShouldCreateCustomerProfile(false);
          } catch (createError) {
            console.error('Failed to auto-create customer profile:', createError);
          }
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
        setCustomerDocId(null);
        setCustomerData(null);
        setShouldCreateCustomerProfile(true);
      } finally {
        setLoadingCustomerData(false);
      }
    };

    if (!authLoading) {
      fetchCustomerData();
    }
  }, [user, authLoading, customerId]);

  return {
    customerData,
    customerDocId,
    loadingCustomerData,
    shouldCreateCustomerProfile
  };
};