// Checkout.jsx - UPDATED: Excludes blocked dates from cost calculation
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useCart } from "../hooks/useCart";
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
import CheckoutAuthRequired from "../components/Checkout/CheckoutAuthRequired";
import CheckoutEmptyCart from "../components/Checkout/CheckoutEmptyCart";

// Utility functions and hooks
import {
  formatCurrency,
  getDailyRate,
  calculateRentalDays,
  calculateDeliveryFee,
  getTodayDate,
  fetchBlockedDates,
  getRentalCalculationDetails,
} from "../utils/checkOutUtils";
import { validateStep } from "../components/Checkout/checkoutValidation";
import { useCheckoutData } from "../hooks/useCheckoutData";
import {
  createPayPalHandlers,
  createSubmitHandler,
} from "../components/Checkout/checkoutHandlers";

const Checkout = ({ userData = null, onOrderComplete = () => {} }) => {
  const [user, authLoading] = useAuthState(auth);
  const { clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: State for blocked dates
  const [blockedDates, setBlockedDates] = useState([]);
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(true);

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paypalPaymentDetails, setPaypalPaymentDetails] = useState(null);

  const selectedItemsFromCart = location.state?.selectedItems || [];
  const totalQuantityFromCart = location.state?.totalQuantity || 0;
  const totalAmountFromCart = location.state?.totalAmount || 0;
  const customerId = location.state?.customerId || null;

  const {
    customerData,
    customerDocId,
    loadingCustomerData,
    shouldCreateCustomerProfile,
  } = useCheckoutData(user, authLoading, customerId);

  // NEW: Fetch blocked dates on component mount
  useEffect(() => {
    const loadBlockedDates = async () => {
      try {
        setLoadingBlockedDates(true);
        const blocked = await fetchBlockedDates();
        setBlockedDates(blocked);
        console.log("✅ Loaded blocked dates:", blocked.length);
      } catch (error) {
        console.error("Error loading blocked dates:", error);
      } finally {
        setLoadingBlockedDates(false);
      }
    };
    loadBlockedDates();
  }, []);

  useEffect(() => {
    if (
      !authLoading &&
      !loadingCustomerData &&
      selectedItemsFromCart.length === 0
    ) {
      navigate("/cartPage", { replace: true });
    }
  }, [authLoading, loadingCustomerData, selectedItemsFromCart, navigate]);

  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    deliveryMethod: "pickup",
    pickupTime: "",
    returnTime: "",
    idSubmitted: false,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "cash",
    paypalEmail: "",
    insurance: false,
    newsletter: false,
    specialInstructions: "",
    termsAccepted: false,
    usingSavedId: false,
    uploadNewId: false,
    savedIdUrl: "",
  });

  useEffect(() => {
    if (customerData) {
      setFormData((prev) => ({
        ...prev,
        firstName:
          customerData.firstName || user?.displayName?.split(" ")[0] || "",
        lastName:
          customerData.lastName ||
          user?.displayName?.split(" ").slice(1).join(" ") ||
          "",
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
      setFormData((prev) => ({
        ...prev,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
      }));
    }
  }, [customerData, user]);

  const rentalItems = selectedItemsFromCart;

  const paypalInitialOptions = {
    "client-id":
      "AYzH5iuulriuNHc9Hk4kTONtofhUOrLK0dxI-1yyoI8-liOzYf_fuLYxQ9Z789-vgW6Qph_nAagIwFJ8",
    currency: "PHP",
    intent: "capture",
    components: "buttons,marks,messages",
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // NEW: Enhanced pricing calculations with blocked dates exclusion
  const rentalCalculation = getRentalCalculationDetails(
    formData.startDate,
    formData.endDate,
    blockedDates
  );

  const rentalDays = rentalCalculation.billableDays;

  const subtotal = rentalItems.reduce(
    (sum, item) => sum + getDailyRate(item) * (item.quantity || 1) * rentalDays,
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
    rentalDays,
    totalDays: rentalCalculation.totalDays,
    blockedDays: rentalCalculation.blockedDays,
    blockedDatesArray: rentalCalculation.blockedDatesArray,
  };

  const { handlePayPalSuccess, handlePayPalError } = createPayPalHandlers(
    setPaymentStatus,
    setPaypalPaymentDetails,
    setFormData,
    setCurrentStep
  );

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

  const handleGoogleFormSubmission = () => {
    handleMandatoryIDSubmission(formData, setFormData, setErrors);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateCurrentStep = (step) => {
    console.log(`[VALIDATION] Checking step ${step}`);

    const validation = validateStep(step, formData);

    if (!validation.isValid) {
      setErrors(validation.errors);

      if (step === 1) {
        const criticalFields = [
          "startDate",
          "endDate",
          "pickupTime",
          "returnTime",
          "idSubmitted",
        ];
        const firstErrorKey = Object.keys(validation.errors).find((key) =>
          criticalFields.includes(key)
        );

        if (firstErrorKey) {
          const firstError = validation.errors[firstErrorKey];
          setTimeout(() => alert(`Please fix: ${firstError}`), 100);
        }
      }
    } else {
      setErrors({});
    }

    return validation.isValid;
  };

  const handleNext = () => {
    const isValid = validateCurrentStep(currentStep);

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep(4)) {
      return;
    }

    if (!formData.idSubmitted) {
      alert("Please complete ID verification before submitting your order.");
      return;
    }

    await submitHandler(setIsSubmitting);
  };

  if (authLoading || loadingCustomerData || loadingBlockedDates) {
    return <CheckoutLoadingState />;
  }

  if (!user) {
    return <CheckoutAuthRequired onGoToSignIn={() => navigate("/")} />;
  }

  if (rentalItems.length === 0) {
    return <CheckoutEmptyCart onGoToCart={() => navigate("/cartPage")} />;
  }

  return (
    <PayPalScriptProvider options={paypalInitialOptions}>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <Navbar />
        <CheckoutBackground />

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <CheckoutHeader
            isVisible={isVisible}
            userData={customerData}
            user={user}
            rentalItems={rentalItems}
          />

          <CheckoutSteps currentStep={currentStep} />

          <div className="grid lg:grid-cols-3 gap-8">
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
              onGoogleFormSubmission={handleGoogleFormSubmission}
              setFormData={setFormData}
              setErrors={setErrors}
              savedIdUrl={customerData?.idVerification?.documentUrl || ""}
              blockedDates={blockedDates}
            />

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
                rentalCalculation={rentalCalculation}
              />
            </div>
          </div>

          <CheckoutTrustIndicators />
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default Checkout;
