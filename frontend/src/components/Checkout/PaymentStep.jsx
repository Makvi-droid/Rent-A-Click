// In your PaymentStep component, make sure to import and use the fixed button:
import PayPalPaymentButton from "./PayPalPaymentButton";
import React, {  useMemo } from "react";

const PaymentStep = ({
  formData,
  errors,
  onInputChange,
  total,
  formatCurrency,
  paymentStatus,
  onPayPalSuccess,
  onPayPalError,
  rentalDays,
  rentalItems
}) => {
  // Create stable order data
  const orderData = useMemo(() => ({
    items: rentalItems,
    rentalDays: rentalDays,
    tempOrderId: `temp_${Date.now()}`
  }), [rentalItems, rentalDays]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
      
      {/* Payment Method Selection */}
      <div className="space-y-4">
        <label className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={formData.paymentMethod === "cash"}
            onChange={onInputChange}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="text-white font-medium">Cash Payment</div>
            <div className="text-gray-400 text-sm">Pay when you pick up or receive delivery</div>
          </div>
        </label>

        <label className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={formData.paymentMethod === "paypal"}
            onChange={onInputChange}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="text-white font-medium">PayPal</div>
            <div className="text-gray-400 text-sm">Secure online payment with PayPal</div>
          </div>
        </label>
      </div>

      {/* PayPal Section */}
      {formData.paymentMethod === "paypal" && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-medium mb-2">PayPal Payment</h3>
            <p className="text-gray-400 text-sm mb-4">
              Total Amount: <span className="text-white font-semibold">{formatCurrency(total)}</span>
            </p>
            
            {/* Status Messages */}
            {paymentStatus === 'completed' && (
              <div className="mb-4 p-3 bg-green-800/30 border border-green-600 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-400 font-medium">Payment Successful!</span>
                </div>
              </div>
            )}
            
            {paymentStatus === 'failed' && (
              <div className="mb-4 p-3 bg-red-800/30 border border-red-600 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-400 font-medium">Payment Failed. Please try again.</span>
                </div>
              </div>
            )}

            {/* PayPal Button */}
            <PayPalPaymentButton
              total={total}
              currency="PHP"
              onSuccess={onPayPalSuccess}
              onError={onPayPalError}
              disabled={paymentStatus === 'completed'}
              orderData={orderData}
            />
          </div>
        </div>
      )}

      {errors.paymentMethod && (
        <p className="text-red-400 text-sm">{errors.paymentMethod}</p>
      )}
    </div>
  );
};

export default PaymentStep;