// 4. services/checkoutService.js
import { collection, addDoc, runTransaction, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

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
      return `RACCO${currentYear}${nextNumber.toString().padStart(4, '0')}`;
    });
  } catch (error) {
    console.error('Error generating checkout ID:', error);
    const timestamp = Date.now().toString().slice(-6);
    const currentYear = new Date().getFullYear().toString().slice(-2);
    return `RACCO${currentYear}${timestamp}`;
  }
};

export const updateCustomerProfile = async (customerDocId, formData) => {
  if (!customerDocId) return;

  try {
    const customerRef = doc(db, 'customers', customerDocId);
    const updateData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      apartment: formData.apartment?.trim() || '',
      city: formData.city.trim(),
      state: formData.state.trim(),
      zipCode: formData.zipCode.trim(),
      paypalEmail: formData.paypalEmail?.trim() || '',
      newsletter: formData.newsletter,
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

export const submitCheckout = async ({
  formData,
  customerDocId,
  customerData,
  selectedItemsFromCart,
  pricing,
  paypalPaymentDetails,
  user,
  clearCart
}) => {
  await updateCustomerProfile(customerDocId, formData);
  
  const checkoutId = await generateNextCheckoutId();
  console.log('Generated checkout ID:', checkoutId);
  
  const checkoutData = {
    id: checkoutId,
    orderNumber: checkoutId,
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
    userId: user?.uid || null,
    userEmail: user?.email || formData.email,
    rentalDetails: {
      startDate: formData.startDate,
      endDate: formData.endDate,
      rentalDays: pricing.rentalDays || 1,
      deliveryMethod: formData.deliveryMethod,
    },
    deliveryAddress: formData.deliveryMethod === 'delivery' ? {
      address: formData.address.trim(),
      apartment: formData.apartment?.trim() || null,
      city: formData.city.trim(),
      state: formData.state.trim(),
      zipCode: formData.zipCode.trim(),
    } : null,
    paymentInfo: {
      method: formData.paymentMethod,
      paypalEmail: formData.paymentMethod === 'paypal' ? formData.paypalEmail?.trim() : null,
      paypal: formData.paymentMethod === 'paypal' && paypalPaymentDetails ? paypalPaymentDetails : null
    },
    items: selectedItemsFromCart.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity || 1,
      dailyRate: item.dailyRate || item.price || 0,
      variant: item.variant || null,
    })),
    pricing,
    options: {
      insurance: formData.insurance,
      newsletter: formData.newsletter,
      specialInstructions: formData.specialInstructions?.trim() || null,
    },
    status: formData.paymentMethod === 'paypal' ? 'confirmed' : 'pending',
    paymentStatus: formData.paymentMethod === 'paypal' ? 'paid' : 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    termsAccepted: formData.termsAccepted,
    termsAcceptedAt: formData.termsAccepted ? serverTimestamp() : null,
  };
  
  await setDoc(doc(db, 'checkouts', checkoutId), checkoutData);
  
  try {
    await clearCart();
    console.log('Cart cleared successfully');
  } catch (cartError) {
    console.warn('Failed to clear cart:', cartError);
  }

  return {
    id: checkoutId,
    customerId: customerDocId,
    customerData,
    items: selectedItemsFromCart,
    formData,
    pricing,
    status: formData.paymentMethod === 'paypal' ? 'confirmed' : 'pending',
    paymentStatus: formData.paymentMethod === 'paypal' ? 'paid' : 'pending',
    paymentDetails: paypalPaymentDetails,
    createdAt: new Date().toISOString(),
  };
};