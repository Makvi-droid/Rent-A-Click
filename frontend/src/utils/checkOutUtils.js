// checkoutUtils.js
import { 
  collection, 
  addDoc, 
  query, 
  where,
  getDocs,
  runTransaction,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Currency formatter for Philippine Peso
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper functions for pricing calculations
export const getDailyRate = (item) => {
  if (item.dailyRate) return parseFloat(item.dailyRate);
  if (item.variant?.price) return parseFloat(item.variant.price);
  if (item.price) return parseFloat(item.price);
  return 0;
};

export const calculateRentalDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

export const calculateDeliveryFee = (deliveryMethod, subtotal) => {
  if (deliveryMethod !== "delivery") return 0;
  if (subtotal >= 5000) return 0;
  return subtotal * 0.10;
};

export const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Enhanced function to find customer document by firebaseUid
export const findCustomerDoc = async (firebaseUid) => {
  try {
    const customersRef = collection(db, 'customers');
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

// Enhanced function to create a new customer profile
export const createCustomerProfile = async (firebaseUid, userData) => {
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
    
    console.log('New customer profile created:', docRef.id);
    
    return {
      id: docRef.id,
      data: newCustomerData
    };
  } catch (error) {
    console.error('Error creating customer profile:', error);
    throw error;
  }
};

// Enhanced function to update customer profile during checkout
export const updateCustomerProfile = async (customerDocId, checkoutFormData) => {
  if (!customerDocId) return;

  try {
    const customerRef = doc(db, 'customers', customerDocId);
    const updateData = {
      firstName: checkoutFormData.firstName.trim(),
      lastName: checkoutFormData.lastName.trim(),
      email: checkoutFormData.email.trim(),
      phone: checkoutFormData.phone.trim(),
      address: checkoutFormData.address.trim(),
      apartment: checkoutFormData.apartment?.trim() || '',
      city: checkoutFormData.city.trim(),
      state: checkoutFormData.state.trim(),
      zipCode: checkoutFormData.zipCode.trim(),
      paypalEmail: checkoutFormData.paypalEmail?.trim() || '',
      newsletter: checkoutFormData.newsletter,
      updatedAt: serverTimestamp(),
      profileCompleted: true,
      lastCheckoutAt: serverTimestamp()
    };

    await updateDoc(customerRef, updateData);
    console.log('Customer profile updated during checkout');
  } catch (error) {
    console.error('Error updating customer profile:', error);
  }
};

// Enhanced checkout ID generation
export const generateNextCheckoutId = async () => {
  try {
    return await runTransaction(db, async (transaction) => {
      const counterRef = doc(db, 'counters', 'checkouts');
      const counterDoc = await transaction.get(counterRef);
      
      let nextNumber = 1;
      
      if (counterDoc.exists()) {
        nextNumber = (counterDoc.data().lastNumber || 0) + 1;
      }
      
      transaction.set(counterRef, { 
        lastNumber: nextNumber,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const formattedId = `RACCO${currentYear}${nextNumber.toString().padStart(4, '0')}`;
      
      return formattedId;
    });
  } catch (error) {
    console.error('Error generating checkout ID:', error);
    const timestamp = Date.now().toString().slice(-6);
    const currentYear = new Date().getFullYear().toString().slice(-2);
    return `RACCO${currentYear}${timestamp}`;
  }
};

// Enhanced saveCheckoutToFirebase function
export const saveCheckoutToFirebase = async (checkoutId, formData, customerDocId, user, rentalItems, paypalPaymentDetails, shouldCreateCustomerProfile, pricing) => {
  try {
    console.log('Saving checkout to Firebase with ID:', checkoutId);
    
    const checkoutData = {
      // Order identification
      id: checkoutId,
      orderNumber: checkoutId,
      
      // Customer information - Primary reference to customers collection
      customerId: customerDocId,
      customerInfo: {
        customerDocId: customerDocId,
        firebaseUid: user?.uid,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      },
      
      // Legacy compatibility (can be removed later)
      userId: user?.uid || null,
      userEmail: user?.email || formData.email,
      
      // Rental Details
      rentalDetails: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        rentalDays: pricing.rentalDays,
        deliveryMethod: formData.deliveryMethod,
      },
      
      // Delivery Address
      deliveryAddress: formData.deliveryMethod === 'delivery' ? {
        address: formData.address.trim(),
        apartment: formData.apartment?.trim() || null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        fullAddress: `${formData.address.trim()}${formData.apartment ? ', ' + formData.apartment.trim() : ''}, ${formData.city.trim()}, ${formData.state.trim()} ${formData.zipCode.trim()}`
      } : null,
      
      // Payment Information with enhanced PayPal details
      paymentInfo: {
        method: formData.paymentMethod,
        paypalEmail: formData.paymentMethod === 'paypal' ? formData.paypalEmail?.trim() : null,
        paypal: formData.paymentMethod === 'paypal' && paypalPaymentDetails ? {
          orderId: paypalPaymentDetails.paypalOrderId,
          paymentId: paypalPaymentDetails.paymentId,
          captureId: paypalPaymentDetails.captureId,
          payerEmail: paypalPaymentDetails.payerEmail,
          payerName: paypalPaymentDetails.payerName,
          amount: paypalPaymentDetails.amount,
          currency: paypalPaymentDetails.currency,
          status: paypalPaymentDetails.status,
          createTime: paypalPaymentDetails.createTime,
          updateTime: paypalPaymentDetails.updateTime
        } : null
      },
      
      // Rental Items
      items: rentalItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        dailyRate: getDailyRate(item),
        totalItemCost: getDailyRate(item) * (item.quantity || 1) * pricing.rentalDays,
        variant: item.variant || null,
        image: item.image || null,
        category: item.category || null,
        brand: item.brand || null,
      })),
      
      // Pricing Breakdown
      pricing: {
        subtotal: Number(pricing.subtotal.toFixed(2)),
        deliveryFee: Number(pricing.deliveryFee.toFixed(2)),
        insuranceFee: Number(pricing.insuranceFee.toFixed(2)),
        tax: Number(pricing.tax.toFixed(2)),
        total: Number(pricing.total.toFixed(2)),
        rentalDays: pricing.rentalDays,
        currency: 'PHP'
      },
      
      // Additional Options
      options: {
        insurance: formData.insurance,
        newsletter: formData.newsletter,
        specialInstructions: formData.specialInstructions?.trim() || null,
      },
      
      // Status based on payment method
      status: formData.paymentMethod === 'paypal' ? 'confirmed' : 'pending',
      paymentStatus: formData.paymentMethod === 'paypal' ? 'paid' : 'pending',
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Terms acceptance
      termsAccepted: formData.termsAccepted,
      termsAcceptedAt: formData.termsAccepted ? serverTimestamp() : null,
      
      // Metadata for customers collection
      metadata: {
        source: 'web-checkout',
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        itemCount: rentalItems.length,
        totalQuantity: rentalItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
        collectionVersion: 'customers-v1',
        checkoutVersion: '2.0',
        customerProfileExists: !!customerDocId,
        autoCreatedProfile: shouldCreateCustomerProfile
      }
    };
    
    // Save to Firestore with the custom ID
    await setDoc(doc(db, 'checkouts', checkoutId), checkoutData);
    
    console.log('Checkout saved successfully:', checkoutId);
    return checkoutData;
  } catch (error) {
    console.error('Error saving checkout to Firebase:', error);
    throw new Error(`Failed to save checkout: ${error.message}`);
  }
};