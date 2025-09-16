// Main Checkout Component - Enhanced with PayPal Integration
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useCart } from '../hooks/useCart';
// Import PayPal at the top
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
// Add Firestore imports
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  runTransaction,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase'; // Make sure you export db from your firebase config

// Component imports
import CheckoutSteps from "../components/Checkout/CheckoutSteps";
import OrderSummary from "../components/Checkout/OrderSummary";
import CheckoutBackground from "../components/Checkout/CheckoutBackground";
import CheckoutLoadingState from "../components/Checkout/CheckoutLoadingState";
import CheckoutHeader from "../components/Checkout/CheckoutHeader";
import CheckoutFormSection from "../components/Checkout/CheckoutFormSection";
import CheckoutTrustIndicators from "../components/Checkout/CheckoutTrustIndicators";


const Checkout = ({ 
  userData = null, 
  onOrderComplete = () => {}
}) => {
  const [user, authLoading] = useAuthState(auth);
  const { clearCart } = useCart(); // Only need clearCart function
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PayPal state variables
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paypalPaymentDetails, setPaypalPaymentDetails] = useState(null);

  // Get selected items from navigation state
  const selectedItemsFromCart = location.state?.selectedItems || [];
  const totalQuantityFromCart = location.state?.totalQuantity || 0;
  const totalAmountFromCart = location.state?.totalAmount || 0;

  // Redirect if no selected items
  useEffect(() => {
    if (!authLoading && selectedItemsFromCart.length === 0) {
      // Redirect back to cart if no items selected
      navigate('/cartPage', { replace: true });
    }
  }, [authLoading, selectedItemsFromCart, navigate]);

  // Initialize form data with user data if available
  const [formData, setFormData] = useState({
    // Rental Details
    startDate: null,
    endDate: null,
    deliveryMethod: "pickup", // pickup or delivery

    // Customer Information (pre-fill with user data if available)
    firstName: userData?.firstName || user?.displayName?.split(' ')[0] || "",
    lastName: userData?.lastName || user?.displayName?.split(' ').slice(1).join(' ') || "",
    email: userData?.email || user?.email || "",
    phone: userData?.phone || "",

    // Delivery Address (if delivery selected, pre-fill with user address)
    address: userData?.address || "",
    apartment: userData?.apartment || "",
    city: userData?.city || "",
    state: userData?.state || "",
    zipCode: userData?.zipCode || "",

    // Payment Method
    paymentMethod: "cash", // cash or paypal
    paypalEmail: userData?.paypalEmail || "",

    // Additional Options
    insurance: false,
    newsletter: userData?.newsletter || false,
    specialInstructions: "",
    termsAccepted: false,
  });

  // Use selected items from cart instead of entire cart
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

  // Helper function to get the correct price for rental calculation
  const getDailyRate = (item) => {
    // Check for dailyRate first (rental specific)
    if (item.dailyRate) return parseFloat(item.dailyRate);
    
    // Fallback to variant price or regular price
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
  
  // Delivery fee is 10% of subtotal, free for orders ₱5,000 and above
  const calculateDeliveryFee = () => {
    if (formData.deliveryMethod !== "delivery") return 0;
    if (subtotal >= 5000) return 0; // Free delivery for orders ₱5,000+
    return subtotal * 0.10; // 10% of subtotal
  };
  
  const deliveryFee = calculateDeliveryFee();
  const insuranceFee = formData.insurance ? subtotal * 0.15 : 0;
  const tax = (subtotal + deliveryFee + insuranceFee) * 0.12; // 12% VAT in Philippines
  const total = subtotal + deliveryFee + insuranceFee + tax;

  // PayPal success handler
  const handlePayPalSuccess = async (paymentDetails) => {
  console.log('PayPal payment successful - handler called:', paymentDetails);
  
  try {
    // Update payment status immediately
    setPaymentStatus('completed');
    setPaypalPaymentDetails(paymentDetails);
    
    console.log('Payment status updated to completed');
    
    // Force a re-render by updating the form data timestamp
    setFormData(prev => ({ 
      ...prev, 
      paymentCompletedAt: new Date().toISOString() 
    }));
    
    // Show success message
    const message = `✅ Payment successful! 
    
Payment ID: ${paymentDetails.paymentId}
Amount: ${formatCurrency(paymentDetails.amount)}
Payer: ${paymentDetails.payerName}

You can now continue to review your rental.`;
    
    alert(message);
    
    // Optional: Auto-advance to next step after a short delay
    setTimeout(() => {
      console.log('Auto-advancing to next step...');
      setCurrentStep(4); // Go to review step
    }, 1000);
    
  } catch (error) {
    console.error('Error in PayPal success handler:', error);
    setPaymentStatus('failed');
  }
};

  // PayPal error handler
  const handlePayPalError = (error) => {
  console.error('PayPal payment failed:', error);
  setPaymentStatus('failed');
  
  // Clear any previous payment details
  setPaypalPaymentDetails(null);
  
  alert('❌ Payment failed. Please try again or choose cash payment.');
};

  // Function to generate next checkout ID with enhanced format
  const generateNextCheckoutId = async () => {
    try {
      return await runTransaction(db, async (transaction) => {
        // Reference to the counters document
        const counterRef = doc(db, 'counters', 'checkouts');
        const counterDoc = await transaction.get(counterRef);
        
        let nextNumber = 1;
        
        if (counterDoc.exists()) {
          nextNumber = (counterDoc.data().lastNumber || 0) + 1;
        }
        
        // Update the counter
        transaction.set(counterRef, { 
          lastNumber: nextNumber,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Enhanced ID format: RAC (Rent-A-Click) + year + sequential number
        const currentYear = new Date().getFullYear().toString().slice(-2); // Last 2 digits of year
        const formattedId = `RAC${currentYear}${nextNumber.toString().padStart(4, '0')}`;
        
        return formattedId;
      });
    } catch (error) {
      console.error('Error generating checkout ID:', error);
      // Enhanced fallback with better format
      const timestamp = Date.now().toString().slice(-6);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      return `RAC${currentYear}${timestamp}`;
    }
  };

  // Enhanced saveCheckoutToFirebase function with PayPal details
  const saveCheckoutToFirebase = async (checkoutId) => {
    try {
      console.log('Saving checkout to Firebase with ID:', checkoutId);
      
      const checkoutData = {
        // Order identification
        id: checkoutId,
        orderNumber: checkoutId, // For easier searching
        
        // User information
        userId: user?.uid || null,
        userEmail: user?.email || formData.email,
        
        // Customer Information
        customerInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`
        },
        
        // Rental Details
        rentalDetails: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          rentalDays: rentalDays,
          deliveryMethod: formData.deliveryMethod,
        },
        
        // Delivery Address (if applicable)
        deliveryAddress: formData.deliveryMethod === 'delivery' ? {
          address: formData.address.trim(),
          apartment: formData.apartment?.trim() || null,
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          fullAddress: `${formData.address.trim()}${formData.apartment ? ', ' + formData.apartment.trim() : ''}, ${formData.city.trim()}, ${formData.state.trim()} ${formData.zipCode.trim()}`
        } : null,
        
        // Enhanced Payment Information with PayPal details
        paymentInfo: {
          method: formData.paymentMethod,
          paypalEmail: formData.paymentMethod === 'paypal' ? formData.paypalEmail?.trim() : null,
          // PayPal specific payment details
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
        
        // Rental Items with detailed information
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
        
        // Update status based on payment method
        status: formData.paymentMethod === 'paypal' ? 'confirmed' : 'pending',
        paymentStatus: formData.paymentMethod === 'paypal' ? 'paid' : 'pending',
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Terms acceptance
        termsAccepted: formData.termsAccepted,
        termsAcceptedAt: formData.termsAccepted ? serverTimestamp() : null,
        
        // Additional metadata
        metadata: {
          source: 'web-checkout',
          userAgent: navigator.userAgent,
          referrer: document.referrer || null,
          itemCount: rentalItems.length,
          totalQuantity: rentalItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error when user starts typing
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
    
    // Clear error when date is selected
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

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

  // Modified handleSubmit function with PayPal integration
  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    // For PayPal payments, ensure payment is completed
    if (formData.paymentMethod === 'paypal' && paymentStatus !== 'completed') {
      alert('Please complete the PayPal payment first.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Starting checkout submission...');
      
      // Generate the next checkout ID
      const checkoutId = await generateNextCheckoutId();
      console.log('Generated checkout ID:', checkoutId);
      
      // Save to Firebase with payment details
      const savedCheckout = await saveCheckoutToFirebase(checkoutId);
      
      // Clear the cart after successful order
      try {
        await clearCart();
        console.log('Cart cleared successfully');
      } catch (cartError) {
        console.warn('Failed to clear cart:', cartError);
        // Don't fail the entire process if cart clearing fails
      }

      // Create order object for callback
      const orderDetails = {
        id: checkoutId,
        userId: user?.uid,
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

      // Call the completion callback
      onOrderComplete(orderDetails);
      
      // Enhanced success message based on payment method
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
      
      // Redirect to a success page or back to products
      navigate('/productsPage', { 
        state: { 
          orderSuccess: true, 
          orderId: checkoutId,
          paymentMethod: formData.paymentMethod
        } 
      });
      
    } catch (error) {
      console.error('Order submission error:', error);
      
      // More specific error messages
      let errorMessage = "❌ There was an error processing your order. Please try again.";
      
      if (error.message.includes('permission')) {
        errorMessage = "❌ Permission denied. Please make sure you're logged in and try again.";
      } else if (error.message.includes('network')) {
        errorMessage = "❌ Network error. Please check your connection and try again.";
      } else if (error.message.includes('Failed to save checkout')) {
        errorMessage = "❌ Failed to save your order. Please try again or contact support.";
      }
      
      alert('Order processing failed. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Show loading state while fetching user data
  if (authLoading) {
    return <CheckoutLoadingState />;
  }

  // Show error if user is not authenticated
  if (!user) {
    return <CheckoutAuthRequired onGoToSignIn={() => navigate('/')} />;
  }

  // Show empty cart message if no items selected
  if (rentalItems.length === 0) {
    return <CheckoutEmptyCart onGoToCart={() => navigate('/cartPage')} />;
  }

  // Wrap return JSX with PayPalScriptProvider
  return (
    <PayPalScriptProvider options={paypalInitialOptions}>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <CheckoutBackground />

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          {/* Header */}
          <CheckoutHeader 
            isVisible={isVisible} 
            userData={userData} 
            user={user} 
            rentalItems={rentalItems} 
          />

          {/* Step Indicator */}
          <CheckoutSteps currentStep={currentStep} />

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section with PayPal props */}
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
              // PayPal specific props
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

export default Checkout;