import React, { useState, useCallback, useMemo } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

const PayPalPaymentButton = ({ 
  total, 
  currency = "PHP", 
  onSuccess, 
  onError, 
  disabled = false,
  orderData 
}) => {
  const [isPaying, setIsPaying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Memoize the createOrder function to prevent unnecessary re-renders
  const createOrder = useCallback((data, actions) => {
    console.log('PayPal createOrder called with total:', total);
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: total.toFixed(2),
            currency_code: currency,
          },
          description: `Rent-A-Click Equipment Rental - ${orderData?.items?.length || 0} items for ${orderData?.rentalDays || 1} day${orderData?.rentalDays > 1 ? 's' : ''}`,
          custom_id: orderData?.tempOrderId || `temp_${Date.now()}`,
          invoice_id: orderData?.tempOrderId || `inv_${Date.now()}`,
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        brand_name: "Rent-A-Click",
        locale: "en-PH",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW"
      }
    });
  }, [total, currency, orderData]);

  // Memoize the onApprove function with better error handling
  const onApprove = useCallback(async (data, actions) => {
    console.log('PayPal onApprove called with data:', data);
    setIsPaying(true);
    
    try {
      const details = await actions.order.capture();
      console.log("PayPal payment successful - full details:", details);
      
      // Validate the payment details
      if (!details || !details.purchase_units || !details.purchase_units[0]) {
        throw new Error('Invalid payment details received from PayPal');
      }

      const capture = details.purchase_units[0].payments?.captures?.[0];
      if (!capture) {
        throw new Error('No capture information found in payment details');
      }
      
      const paymentDetails = {
        paypalOrderId: details.id,
        paymentId: capture.id,
        payerEmail: details.payer?.email_address || 'Not provided',
        payerName: details.payer?.name ? 
          `${details.payer.name.given_name || ''} ${details.payer.name.surname || ''}`.trim() : 
          'Not provided',
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
        status: details.status,
        captureId: capture.id,
        createTime: details.create_time,
        updateTime: details.update_time
      };
      
      console.log('Processed payment details:', paymentDetails);
      
      // Mark as completed locally
      setPaymentCompleted(true);
      
      // Call the success callback
      console.log('Calling onSuccess callback...');
      onSuccess(paymentDetails);
      
    } catch (error) {
      console.error("PayPal payment error:", error);
      onError(error);
    } finally {
      setIsPaying(false);
    }
  }, [onSuccess, onError]);

  // Memoize the onCancel function
  const onCancel = useCallback(() => {
    console.log("PayPal payment cancelled");
    setIsPaying(false);
    setPaymentCompleted(false);
  }, []);

  // Enhanced onError handler
  const handleError = useCallback((err) => {
    console.error('PayPal error:', err);
    setIsPaying(false);
    setPaymentCompleted(false);
    onError(err);
  }, [onError]);

  // Memoize the button style to prevent re-renders
  const buttonStyle = useMemo(() => ({
    layout: "vertical",
    color: "blue",
    shape: "rect",
    label: "paypal",
    height: 50,
    tagline: false
  }), []);

  // Show different states
  if (paymentCompleted && !disabled) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center px-4 py-2 border border-green-500 text-sm font-medium rounded-md text-green-400 bg-green-900/20">
          <svg className="mr-2 h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Payment Completed Successfully!
        </div>
      </div>
    );
  }

  return (
    <div className="paypal-button-container">
      {isPaying && (
        <div className="text-center py-4">
          <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </div>
        </div>
      )}
      
      <PayPalButtons
        disabled={disabled || isPaying || paymentCompleted}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={handleError}
        onCancel={onCancel}
        style={buttonStyle}
      />
    </div>
  );
};

export default PayPalPaymentButton;