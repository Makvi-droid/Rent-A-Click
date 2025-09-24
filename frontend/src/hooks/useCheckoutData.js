// useCheckoutData.js - Custom hook for managing checkout data
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { findCustomerDoc, createCustomerProfile } from '../utils/checkOutUtils';

export const useCheckoutData = (user, authLoading, customerId) => {
  const [customerData, setCustomerData] = useState(null);
  const [customerDocId, setCustomerDocId] = useState(null);
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);
  const [shouldCreateCustomerProfile, setShouldCreateCustomerProfile] = useState(false);

  // Enhanced customer data fetching with auto-creation
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) {
        setLoadingCustomerData(false);
        return;
      }

      try {
        setLoadingCustomerData(true);
        
        let customerDoc = null;
        
        // Try to get customer data using customerId from cart page first
        if (customerId) {
          try {
            const customerRef = doc(db, 'customers', customerId);
            const customerSnapshot = await getDoc(customerRef);
            if (customerSnapshot.exists()) {
              customerDoc = {
                id: customerSnapshot.id,
                data: customerSnapshot.data()
              };
            }
          } catch (error) {
            console.warn('Error fetching customer by ID, falling back to firebaseUid query:', error);
          }
        }
        
        // Fallback: find by firebaseUid if customerId method failed
        if (!customerDoc) {
          customerDoc = await findCustomerDoc(user.uid);
        }
        
        if (customerDoc) {
          setCustomerDocId(customerDoc.id);
          setCustomerData(customerDoc.data);
          setShouldCreateCustomerProfile(false);
          console.log('Customer data loaded:', customerDoc.data);
        } else {
          // Customer doesn't exist, prepare for creation
          console.warn('Customer document not found for user:', user.uid);
          setShouldCreateCustomerProfile(true);
          setCustomerDocId(null);
          setCustomerData(null);
          
          // Optionally auto-create customer profile
          try {
            const newCustomerDoc = await createCustomerProfile(user.uid, user);
            setCustomerDocId(newCustomerDoc.id);
            setCustomerData(newCustomerDoc.data);
            setShouldCreateCustomerProfile(false);
            console.log('Auto-created customer profile:', newCustomerDoc.id);
          } catch (createError) {
            console.error('Failed to auto-create customer profile:', createError);
            // Keep the shouldCreateCustomerProfile flag true for manual handling
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