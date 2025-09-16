import React from "react";
import { ArrowRight, Lock } from "lucide-react";

const NavigationControls = ({ 
  currentStep, 
  isSubmitting, 
  onBack, 
  onNext, 
  onSubmit,
  formData,
  paymentStatus
}) => {
  // Add console logging for debugging
  console.log('NavigationControls Debug:', {
    currentStep,
    paymentMethod: formData?.paymentMethod,
    paymentStatus,
    isPayPalPending: formData?.paymentMethod === 'paypal' && paymentStatus !== 'completed'
  });

  // Check if PayPal payment is required but not completed
  const isPayPalPending = formData?.paymentMethod === 'paypal' && paymentStatus !== 'completed';

  // Enhanced continue button logic
  const canProceed = () => {
    if (currentStep === 3) {
      // For payment step
      if (formData?.paymentMethod === 'paypal') {
        return paymentStatus === 'completed';
      }
      // For cash payment, always allow proceed
      return true;
    }
    // For other steps, always allow proceed (validation happens in parent)
    return true;
  };

  const shouldShowPaymentPending = currentStep === 3 && isPayPalPending;

  return (
    <div className="flex justify-between mt-12 pt-8 border-t border-gray-700">
      {/* Debug info - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div>Step: {currentStep}</div>
          <div>Payment: {formData?.paymentMethod}</div>
          <div>Status: {paymentStatus}</div>
          <div>Can Proceed: {canProceed().toString()}</div>
        </div>
      )}

      <button
        onClick={onBack}
        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
          currentStep === 1
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gray-700 text-white hover:bg-gray-600 hover:scale-105"
        }`}
        disabled={currentStep === 1}
      >
        <ArrowRight className="rotate-180" size={16} />
        <span>Back</span>
      </button>

      {currentStep < 4 ? (
        <button
          onClick={() => {
            console.log('Continue button clicked:', { canProceed: canProceed(), paymentStatus });
            if (canProceed()) {
              onNext();
            }
          }}
          disabled={!canProceed()}
          className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
            !canProceed()
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25'
          }`}
        >
          <span>
            {shouldShowPaymentPending ? 'Complete Payment First' : 'Continue'}
          </span>
          {canProceed() && <ArrowRight size={16} />}
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
            isSubmitting 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-105 hover:shadow-xl hover:shadow-green-500/25'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>
                {formData?.paymentMethod === 'paypal' ? 'Confirm Rental' : 'Confirm Rental'}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default NavigationControls;