// checkoutHandlers.js - FIXED: Removed customer collection updates
import {
  formatCurrency,
  generateNextCheckoutId,
  saveCheckoutToFirebase,
} from "../../utils/checkOutUtils";

export const createPayPalHandlers = (
  setPaymentStatus,
  setPaypalPaymentDetails,
  setFormData,
  setCurrentStep
) => {
  const handlePayPalSuccess = async (paymentDetails) => {
    console.log("PayPal payment successful:", paymentDetails);

    try {
      setPaymentStatus("completed");
      setPaypalPaymentDetails(paymentDetails);

      setFormData((prev) => ({
        ...prev,
        paymentCompletedAt: new Date().toISOString(),
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
      console.error("Error in PayPal success handler:", error);
      setPaymentStatus("failed");
    }
  };

  const handlePayPalError = (error) => {
    console.error("PayPal payment failed:", error);
    setPaymentStatus("failed");
    setPaypalPaymentDetails(null);
    alert("❌ Payment failed. Please try again or choose cash payment.");
  };

  return { handlePayPalSuccess, handlePayPalError };
};

export const createSubmitHandler = (
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
) => {
  return async (setIsSubmitting) => {
    if (formData.paymentMethod === "paypal" && paymentStatus !== "completed") {
      alert("Please complete the PayPal payment first.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting checkout submission...");

      // Enhanced form data with time selections and ID verification
      const enhancedFormData = {
        ...formData,
        // Store time selections
        pickupTime: formData.pickupTime || null,
        returnTime: formData.returnTime,
        // Store ID verification status
        idVerificationCompleted: formData.idSubmitted,
        idSubmissionTimestamp: formData.idSubmitted
          ? new Date().toISOString()
          : null,
        // Store penalty agreement
        penaltyAgreementAccepted: true,
        submittedAt: new Date().toISOString(),
      };

      // REMOVED: Customer profile update - checkout data stays separate
      // await updateCustomerProfile(customerDocId, enhancedFormData);

      // Generate the checkout ID
      const checkoutId = await generateNextCheckoutId();
      console.log("Generated checkout ID:", checkoutId);

      // Save to Firebase with enhanced data - this creates the order/checkout record only
      const savedCheckout = await saveCheckoutToFirebase(
        checkoutId,
        enhancedFormData,
        customerDocId,
        user,
        rentalItems,
        paypalPaymentDetails,
        shouldCreateCustomerProfile,
        pricing
      );

      // Clear the cart
      try {
        await clearCart();
        console.log("Cart cleared successfully");
      } catch (cartError) {
        console.warn("Failed to clear cart:", cartError);
      }

      // Create enhanced order object for callback
      const orderDetails = {
        id: checkoutId,
        customerId: customerDocId,
        items: rentalItems,
        formData: enhancedFormData,
        pricing,
        status: formData.paymentMethod === "paypal" ? "confirmed" : "pending",
        paymentStatus: formData.paymentMethod === "paypal" ? "paid" : "pending",
        paymentDetails: paypalPaymentDetails,
        // Include time and verification details
        timeDetails: {
          pickupTime: enhancedFormData.pickupTime,
          returnTime: enhancedFormData.returnTime,
          deliveryMethod: enhancedFormData.deliveryMethod,
        },
        verification: {
          idRequired: true, // All rentals now require ID
          idSubmitted: enhancedFormData.idVerificationCompleted,
          submissionTimestamp: enhancedFormData.idSubmissionTimestamp,
        },
        createdAt: new Date().toISOString(),
      };

      onOrderComplete(orderDetails);

      // Enhanced success message based on payment method
      const timeInfo =
        enhancedFormData.deliveryMethod === "pickup"
          ? `Pickup: ${formatTime(
              enhancedFormData.pickupTime
            )}\nReturn: ${formatTime(enhancedFormData.returnTime)}`
          : `Return: ${formatTime(enhancedFormData.returnTime)}`;

      const idVerificationNote = enhancedFormData.idVerificationCompleted
        ? "\n✅ ID verification completed"
        : "";

      const successMessage =
        formData.paymentMethod === "paypal"
          ? `🎉 Payment successful! Rental booking confirmed!

Order ID: ${checkoutId}
PayPal Transaction ID: ${paypalPaymentDetails?.paymentId}
Total Paid: ${formatCurrency(pricing.total)}
Rental Period: ${pricing.rentalDays} day${pricing.rentalDays > 1 ? "s" : ""}

${timeInfo}${idVerificationNote}

⚠️ IMPORTANT: Late returns incur penalty charges.
Confirmation email sent to ${formData.email}.`
          : `🎉 Rental booking submitted successfully!

Order ID: ${checkoutId}
Total: ${formatCurrency(pricing.total)}
Rental Period: ${pricing.rentalDays} day${pricing.rentalDays > 1 ? "s" : ""}

${timeInfo}${idVerificationNote}

⚠️ IMPORTANT: Late returns incur penalty charges.
You'll receive a confirmation email shortly at ${formData.email}.
Our team will contact you within 24 hours to confirm your rental.`;

      alert(successMessage);

      // Redirect with success state
      navigate("/productsPage", {
        state: {
          orderSuccess: true,
          orderId: checkoutId,
          paymentMethod: formData.paymentMethod,
          customerId: customerDocId,
          timeDetails: orderDetails.timeDetails,
          verification: orderDetails.verification,
        },
      });
    } catch (error) {
      console.error("Order submission error:", error);

      let errorMessage =
        "❌ There was an error processing your order. Please try again.";

      if (error.message.includes("permission")) {
        errorMessage =
          "❌ Permission denied. Please make sure you're logged in and try again.";
      } else if (error.message.includes("network")) {
        errorMessage =
          "❌ Network error. Please check your connection and try again.";
      } else if (error.message.includes("Failed to save checkout")) {
        errorMessage =
          "❌ Failed to save your order. Please try again or contact support.";
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
};

// Helper function to format time for display
const formatTime = (time24) => {
  if (!time24) return "";
  const [hour, minute] = time24.split(":");
  const hour12 = parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);
  const ampm = parseInt(hour) >= 12 ? "PM" : "AM";
  return `${hour12}:${minute} ${ampm}`;
};
