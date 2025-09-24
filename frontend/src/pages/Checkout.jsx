// FIXED: Enhanced Checkout Component - Mandatory ID Verification System
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useCart } from '../hooks/useCart';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Component imports
import CheckoutSteps from "../components/Checkout/CheckoutSteps";
import OrderSummary from "../components/Checkout/OrderSummary";
import CheckoutBackground from "../components/Checkout/CheckoutBackground";
import CheckoutLoadingState from "../components/Checkout/CheckoutLoadingState";
import CheckoutHeader from "../components/Checkout/CheckoutHeader";
import CheckoutFormSection from "../components/Checkout/CheckoutFormSection";
import CheckoutTrustIndicators from "../components/Checkout/CheckoutTrustIndicators";
import Navbar from "../components/Navbar";
import { handleMandatoryIDSubmission } from "../components/Checkout/handleMandatoryIDSubmission";

// Separated components
import CheckoutAuthRequired from "../components/Checkout/CheckoutAuthRequired";
import CheckoutEmptyCart from "../components/Checkout/CheckoutEmptyCart";

// Utility functions and hooks
import { 
  formatCurrency, 
  getDailyRate, 
  calculateRentalDays, 
  calculateDeliveryFee, 
  getTodayDate 
} from "../utils/checkOutUtils";
import { validateStep } from "../components/Checkout/checkoutValidation";
import { useCheckoutData } from "../hooks/useCheckoutData";
import { createPayPalHandlers, createSubmitHandler } from "../components/Checkout/checkoutHandlers";

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

  // PayPal state variables
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paypalPaymentDetails, setPaypalPaymentDetails] = useState(null);

  // Get selected items from navigation state
  const selectedItemsFromCart = location.state?.selectedItems || [];
  const totalQuantityFromCart = location.state?.totalQuantity || 0;
  const totalAmountFromCart = location.state?.totalAmount || 0;
  const customerId = location.state?.customerId || null;

  // Use custom hook for customer data management
  const {
    customerData,
    customerDocId,
    loadingCustomerData,
    shouldCreateCustomerProfile
  } = useCheckoutData(user, authLoading, customerId);

  
  // Redirect if no selected items
  useEffect(() => {
    if (!authLoading && !loadingCustomerData && selectedItemsFromCart.length === 0) {
      navigate('/cartPage', { replace: true });
    }
  }, [authLoading, loadingCustomerData, selectedItemsFromCart, navigate]);

  // Form data with mandatory ID verification for all rentals
  const [formData, setFormData] = useState({
    // Rental Details
    startDate: null,
    endDate: null,
    deliveryMethod: "pickup",

    // Time Selection Fields
    pickupTime: "",
    returnTime: "",

    // MANDATORY: ID verification for all rentals
    idSubmitted: false,

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

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Pricing calculations
  const rentalDays = calculateRentalDays(formData.startDate, formData.endDate);
  const subtotal = rentalItems.reduce(
    (sum, item) => sum + (getDailyRate(item) * (item.quantity || 1) * rentalDays),
    0
  );
  
  const deliveryFee = calculateDeliveryFee(formData.deliveryMethod, subtotal);
  const insuranceFee = formData.insurance ? subtotal * 0.15 : 0;
  const tax = (subtotal + deliveryFee + insuranceFee) * 0.12;
  const total = subtotal + deliveryFee + insuranceFee + tax;

  const pricing = {
    subtotal,
    deliveryFee,
    insuranceFee,
    tax,
    total,
    rentalDays
  };

  // PayPal handlers
  const { handlePayPalSuccess, handlePayPalError } = createPayPalHandlers(
    setPaymentStatus,
    setPaypalPaymentDetails,
    setFormData,
    setCurrentStep
  );

  // Submit handler
  const submitHandler = createSubmitHandler(
    formData,
    paymentStatus,
    customerDocId,
    user,
    rentalItems,
    paypalPaymentDetails,
    shouldCreateCustomerProfile,
    pricing,
    clearCart,
    onOrderComplete,
    navigate
  );

  // FIXED: Use the new mandatory ID submission handler
  const handleGoogleFormSubmission = () => {
    handleMandatoryIDSubmission(formData, setFormData, setErrors);
  };

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear specific error when user starts correcting it
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
    
    // Clear related date errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // FIXED: Enhanced validation without hasCameraRental dependency
  const validateCurrentStep = (step) => {
    console.log(`Validating step ${step} with form data:`, {
      step,
      idSubmitted: formData.idSubmitted,
      startDate: formData.startDate,
      endDate: formData.endDate,
      pickupTime: formData.pickupTime,
      returnTime: formData.returnTime,
    });
    
    // FIXED: Remove hasCameraRental parameter since ID is now mandatory for all
    const validation = validateStep(step, formData);
    
    console.log(`Validation result for step ${step}:`, {
      isValid: validation.isValid,
      errors: validation.errors,
      errorCount: Object.keys(validation.errors).length
    });
    
    setErrors(validation.errors);
    
    // Show first validation error to user
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      if (firstError && step === 1) {
        // Only show alert for step 1 critical errors
        const criticalFields = ['startDate', 'endDate', 'pickupTime', 'returnTime', 'idSubmitted'];
        const firstErrorKey = Object.keys(validation.errors)[0];
        if (criticalFields.includes(firstErrorKey)) {
          setTimeout(() => alert(`Please fix: ${firstError}`), 100);
        }
      }
    }
    
    return validation.isValid;
  };

  // Navigation handlers
  const handleNext = () => {
    console.log(`Attempting to move from step ${currentStep} to ${currentStep + 1}`);
    
    const isValid = validateCurrentStep(currentStep);
    console.log(`Step ${currentStep} validation result:`, isValid);
    
    if (isValid && currentStep < 4) {
      console.log(`Moving to step ${currentStep + 1}`);
      setCurrentStep(currentStep + 1);
      // Clear errors when successfully moving to next step
      setErrors({});
    } else if (!isValid) {
      console.log('Validation failed, staying on current step');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Clear errors when going back
      setErrors({});
    }
  };

  // FIXED: Submit handler without camera-specific logic
  const handleSubmit = async () => {
    console.log('Final submission attempt...');
    
    // Final validation check
    if (!validateCurrentStep(4)) {
      console.log('Final validation failed');
      return;
    }
    
    // FIXED: Check for mandatory ID verification (all rentals)
    if (!formData.idSubmitted) {
      alert('Please complete ID verification before submitting your order.');
      return;
    }
    
    await submitHandler(setIsSubmitting);
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
              // FIXED: Remove hasCameraRental, keep form submission handler
              onGoogleFormSubmission={handleGoogleFormSubmission}
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