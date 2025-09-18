// Enhanced Checkout Component - Optimized for Customers Collection
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useCart } from '../hooks/useCart';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { 
  collection, 
  addDoc, 
  query, 
  where,
  orderBy, 
  limit, 
  getDocs,
  runTransaction,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Component imports
import CheckoutSteps from "../components/Checkout/CheckoutSteps";
import OrderSummary from "../components/Checkout/OrderSummary";
import CheckoutBackground from "../components/Checkout/CheckoutBackground";
import CheckoutLoadingState from "../components/Checkout/CheckoutLoadingState";
import CheckoutHeader from "../components/Checkout/CheckoutHeader";
import CheckoutFormSection from "../components/Checkout/CheckoutFormSection";
import CheckoutTrustIndicators from "../components/Checkout/CheckoutTrustIndicators";
import Navbar from "../components/Navbar";

const Checkout = ({ 
  userData = null, 
  onOrderComplete = () => {}
}) => {
  const [user, authLoading] = useAuthState(auth);
  const { clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [customerDocId, setCustomerDocId] = useState(null);
  const [loadingCustomerData, setLoadingCustomerData] = useState(true);
  const [shouldCreateCustomerProfile, setShouldCreateCustomerProfile] = useState(false);

  // PayPal state variables
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paypalPaymentDetails, setPaypalPaymentDetails] = useState(null);

  // Get selected items from navigation state
  const selectedItemsFromCart = location.state?.selectedItems || [];
  const totalQuantityFromCart = location.state?.totalQuantity || 0;
  const totalAmountFromCart = location.state?.totalAmount || 0;
  const customerId = location.state?.customerId || null;

  // Enhanced function to find customer document by firebaseUid
  const findCustomerDoc = async (firebaseUid) => {
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

  // Redirect if no selected items
  useEffect(() => {
    if (!authLoading && !loadingCustomerData && selectedItemsFromCart.length === 0) {
      navigate('/cartPage', { replace: true });
    }
  }, [authLoading, loadingCustomerData, selectedItemsFromCart, navigate]);

  // Enhanced form data initialization
  const [formData, setFormData] = useState({
    // Rental Details
    startDate: null,
    endDate: null,
    deliveryMethod: "pickup",

    // Customer Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // Delivery Address
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",

    // Payment Method
    paymentMethod: "cash",
    paypalEmail: "",

    // Additional Options
    insurance: false,
    newsletter: false,
    specialInstructions: "",
    termsAccepted: false,
  });

  // Update form data when customer data is loaded
  useEffect(() => {
    if (customerData) {
      setFormData(prev => ({
        ...prev,
        firstName: customerData.firstName || user?.displayName?.split(' ')[0] || "",
        lastName: customerData.lastName || user?.displayName?.split(' ').slice(1).join(' ') || "",
        email: customerData.email || user?.email || "",
        phone: customerData.phone || "",
        address: customerData.address || "",
        apartment: customerData.apartment || "",
        city: customerData.city || "",
        state: customerData.state || "",
        zipCode: customerData.zipCode || "",
        paypalEmail: customerData.paypalEmail || "",
        newsletter: customerData.newsletter || false,
      }));
    } else if (user) {
      // If no customer data but user exists, use user data
      setFormData(prev => ({
        ...prev,
        firstName: user.displayName?.split(' ')[0] || "",
        lastName: user.displayName?.split(' ').slice(1).join(' ') || "",
        email: user.email || "",
      }));
    }
  }, [customerData, user]);

  // Use selected items from cart
  const rentalItems = selectedItemsFromCart;

  // PayPal configuration
  const paypalInitialOptions = {
    "client-id": "AYzH5iuulriuNHc9Hk4kTONtofhUOrLK0dxI-1yyoI8-liOzYf_fuLYxQ9Z789-vgW6Qph_nAagIwFJ8",
    currency: "PHP",
    intent: "capture",
    components: "buttons,marks,messages"
  };

  // Currency formatter for Philippine Peso
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Helper functions for pricing calculations
  const getDailyRate = (item) => {
    if (item.dailyRate) return parseFloat(item.dailyRate);
    if (item.variant?.price) return parseFloat(item.variant.price);
    if (item.price) return parseFloat(item.price);
    return 0;
  };

  const calculateRentalDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const rentalDays = calculateRentalDays();
  const subtotal = rentalItems.reduce(
    (sum, item) => sum + (getDailyRate(item) * (item.quantity || 1) * rentalDays),
    0
  );
  
  const calculateDeliveryFee = () => {
    if (formData.deliveryMethod !== "delivery") return 0;
    if (subtotal >= 5000) return 0;
    return subtotal * 0.10;
  };
  
  const deliveryFee = calculateDeliveryFee();
  const insuranceFee = formData.insurance ? subtotal * 0.15 : 0;
  const tax = (subtotal + deliveryFee + insuranceFee) * 0.12;
  const total = subtotal + deliveryFee + insuranceFee + tax;

  // Enhanced function to update customer profile during checkout
  const updateCustomerProfile = async (checkoutFormData) => {
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

  // PayPal handlers
  const handlePayPalSuccess = async (paymentDetails) => {
    console.log('PayPal payment successful:', paymentDetails);
    
    try {
      setPaymentStatus('completed');
      setPaypalPaymentDetails(paymentDetails);
      
      setFormData(prev => ({ 
        ...prev, 
        paymentCompletedAt: new Date().toISOString() 
      }));
      
      const message = `✅ Payment successful! 
      
Payment ID: ${paymentDetails.paymentId}
Amount: ${formatCurrency(paymentDetails.amount)}
Payer: ${paymentDetails.payerName}

You can now continue to review your rental.`;
      
      alert(message);
      
      setTimeout(() => {
        setCurrentStep(4);
      }, 1000);
      
    } catch (error) {
      console.error('Error in PayPal success handler:', error);
      setPaymentStatus('failed');
    }
  };

  const handlePayPalError = (error) => {
    console.error('PayPal payment failed:', error);
    setPaymentStatus('failed');
    setPaypalPaymentDetails(null);
    alert('❌ Payment failed. Please try again or choose cash payment.');
  };

  // Enhanced checkout ID generation
  const generateNextCheckoutId = async () => {
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
  const saveCheckoutToFirebase = async (checkoutId) => {
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
          rentalDays: rentalDays,
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
          totalItemCost: getDailyRate(item) * (item.quantity || 1) * rentalDays,
          variant: item.variant || null,
          image: item.image || null,
          category: item.category || null,
          brand: item.brand || null,
        })),
        
        // Pricing Breakdown
        pricing: {
          subtotal: Number(subtotal.toFixed(2)),
          deliveryFee: Number(deliveryFee.toFixed(2)),
          insuranceFee: Number(insuranceFee.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          total: Number(total.toFixed(2)),
          rentalDays: rentalDays,
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

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.startDate) newErrors.startDate = "Start date is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";
        if (formData.startDate && formData.endDate) {
          const startDate = new Date(formData.startDate);
          const endDate = new Date(formData.endDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (startDate < today) {
            newErrors.startDate = "Start date cannot be in the past";
          }
          if (endDate <= startDate) {
            newErrors.endDate = "End date must be after start date";
          }
        }
        break;
      
      case 2:
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        if (!formData.phone.trim()) {
          newErrors.phone = "Phone is required";
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
          newErrors.phone = "Please enter a valid phone number";
        }
        
        if (formData.deliveryMethod === "delivery") {
          if (!formData.address.trim()) newErrors.address = "Address is required";
          if (!formData.city.trim()) newErrors.city = "City is required";
          if (!formData.state.trim()) newErrors.state = "Province is required";
          if (!formData.zipCode.trim()) {
            newErrors.zipCode = "ZIP code is required";
          } else if (!/^\d{4}$/.test(formData.zipCode)) {
            newErrors.zipCode = "Please enter a valid 4-digit ZIP code";
          }
        }
        break;
      
      case 3:
        if (formData.paymentMethod === "paypal") {
          if (!formData.paypalEmail.trim()) {
            newErrors.paypalEmail = "PayPal email is required";
          } else if (!/\S+@\S+\.\S+/.test(formData.paypalEmail)) {
            newErrors.paypalEmail = "Please enter a valid PayPal email address";
          }
        }
        break;
      
      case 4:
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = "You must accept the terms and conditions";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Enhanced submit handler with customer profile update
  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    if (formData.paymentMethod === 'paypal' && paymentStatus !== 'completed') {
      alert('Please complete the PayPal payment first.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Starting checkout submission...');
      
      // Update customer profile with checkout data
      await updateCustomerProfile(formData);
      
      // Generate the checkout ID
      const checkoutId = await generateNextCheckoutId();
      console.log('Generated checkout ID:', checkoutId);
      
      // Save to Firebase
      const savedCheckout = await saveCheckoutToFirebase(checkoutId);
      
      // Clear the cart
      try {
        await clearCart();
        console.log('Cart cleared successfully');
      } catch (cartError) {
        console.warn('Failed to clear cart:', cartError);
      }

      // Create order object for callback
      const orderDetails = {
        id: checkoutId,
        customerId: customerDocId,
        customerData: customerData,
        items: rentalItems,
        formData,
        pricing: { 
          subtotal, 
          deliveryFee, 
          insuranceFee, 
          tax, 
          total, 
          rentalDays 
        },
        status: formData.paymentMethod === 'paypal' ? 'confirmed' : 'pending',
        paymentStatus: formData.paymentMethod === 'paypal' ? 'paid' : 'pending',
        paymentDetails: paypalPaymentDetails,
        createdAt: new Date().toISOString(),
      };

      onOrderComplete(orderDetails);
      
      // Success message based on payment method
      const successMessage = formData.paymentMethod === 'paypal' 
        ? `🎉 Payment successful! Rental booking confirmed!

Order ID: ${checkoutId}
PayPal Transaction ID: ${paypalPaymentDetails?.paymentId}
Total Paid: ${formatCurrency(total)}

Confirmation email sent to ${formData.email}.`
        : `🎉 Rental booking submitted successfully!

Order ID: ${checkoutId}
Total: ${formatCurrency(total)}
Rental Period: ${rentalDays} day${rentalDays > 1 ? 's' : ''}

You'll receive a confirmation email shortly at ${formData.email}.
Our team will contact you within 24 hours to confirm your rental.`;

      alert(successMessage);
      
      // Redirect with success state
      navigate('/productsPage', { 
        state: { 
          orderSuccess: true, 
          orderId: checkoutId,
          paymentMethod: formData.paymentMethod,
          customerId: customerDocId
        } 
      });
      
    } catch (error) {
      console.error('Order submission error:', error);
      
      let errorMessage = "❌ There was an error processing your order. Please try again.";
      
      if (error.message.includes('permission')) {
        errorMessage = "❌ Permission denied. Please make sure you're logged in and try again.";
      } else if (error.message.includes('network')) {
        errorMessage = "❌ Network error. Please check your connection and try again.";
      } else if (error.message.includes('Failed to save checkout')) {
        errorMessage = "❌ Failed to save your order. Please try again or contact support.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Loading states
  if (authLoading || loadingCustomerData) {
    return <CheckoutLoadingState />;
  }

  // Authentication check
  if (!user) {
    return <CheckoutAuthRequired onGoToSignIn={() => navigate('/')} />;
  }

  // Empty cart check
  if (rentalItems.length === 0) {
    return <CheckoutEmptyCart onGoToCart={() => navigate('/cartPage')} />;
  }

  // Main render with PayPal provider
  return (
    <PayPalScriptProvider options={paypalInitialOptions}>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <Navbar/>
        <CheckoutBackground />

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          {/* Header */}
          <CheckoutHeader 
            isVisible={isVisible} 
            userData={customerData} 
            user={user} 
            rentalItems={rentalItems} 
          />

          {/* Step Indicator */}
          <CheckoutSteps currentStep={currentStep} />

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <CheckoutFormSection
              currentStep={currentStep}
              formData={formData}
              errors={errors}
              rentalDays={rentalDays}
              formatCurrency={formatCurrency}
              subtotal={subtotal}
              total={total}
              onDateChange={handleDateChange}
              onInputChange={handleInputChange}
              getTodayDate={getTodayDate}
              isSubmitting={isSubmitting}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              paymentStatus={paymentStatus}
              onPayPalSuccess={handlePayPalSuccess}
              onPayPalError={handlePayPalError}
              rentalItems={rentalItems}
            />

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <OrderSummary
                rentalItems={rentalItems}
                formData={formData}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                insuranceFee={insuranceFee}
                tax={tax}
                total={total}
                rentalDays={rentalDays}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>

          {/* Trust Indicators */}
          <CheckoutTrustIndicators />
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

// Helper components for different states
const CheckoutAuthRequired = ({ onGoToSignIn }) => (
  <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden flex items-center justify-center">
    <Navbar />
    <div className="text-center py-16">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">
          Authentication Required
        </h2>
        <p className="text-gray-300 mb-6">
          Please log in to continue with your rental booking.
        </p>
        <button
          onClick={onGoToSignIn}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
        >
          Sign In
        </button>
      </div>
    </div>
  </div>
);

const CheckoutEmptyCart = ({ onGoToCart }) => (
  <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden flex items-center justify-center">
    <Navbar />
    <div className="text-center py-16">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">
          No Items Selected
        </h2>
        <p className="text-gray-300 mb-6">
          Please select items from your cart to proceed with checkout.
        </p>
        <button
          onClick={onGoToCart}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
        >
          Back to Cart
        </button>
      </div>
    </div>
  </div>
);

export default Checkout;