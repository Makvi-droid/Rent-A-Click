// COMPLETE: NavigationControls component with proper ID verification handling
import React from 'react';
import { ArrowLeft, ArrowRight, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const NavigationControls = ({
  currentStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  formData,
  paymentStatus,
  hasCameraRental = false
}) => {
  
  // Check if current step can proceed
  const canProceedFromCurrentStep = () => {
    switch (currentStep) {
      case 1:
        // Check dates, times, and ID verification for camera rentals
        const hasRequiredDates = formData.startDate && formData.endDate;
        const hasRequiredTimes = formData.returnTime && 
          (formData.deliveryMethod !== "pickup" || formData.pickupTime);
        const hasIDVerification = !hasCameraRental || formData.googleFormCompleted;
        
        return hasRequiredDates && hasRequiredTimes && hasIDVerification;
        
      case 2:
        const hasBasicInfo = formData.firstName && formData.lastName && 
          formData.email && formData.phone;
        
        if (formData.deliveryMethod === "delivery") {
          return hasBasicInfo && formData.address && formData.city && 
            formData.state && formData.zipCode;
        }
        
        return hasBasicInfo;
        
      case 3:
        if (formData.paymentMethod === "paypal") {
          return formData.paypalEmail && paymentStatus === 'completed';
        }
        return true;
        
      case 4:
        return formData.termsAccepted && (!hasCameraRental || formData.googleFormCompleted);
        
      default:
        return true;
    }
  };

  // Get step-specific button text and validation messages
  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        if (hasCameraRental && !formData.googleFormCompleted) {
          return {
            nextText: "Complete ID Verification First",
            canProceed: false,
            message: "ID verification is required for camera rentals"
          };
        }
        return {
          nextText: "Continue to Customer Info",
          canProceed: canProceedFromCurrentStep(),
          message: null
        };
        
      case 2:
        return {
          nextText: "Continue to Payment",
          canProceed: canProceedFromCurrentStep(),
          message: null
        };
        
      case 3:
        if (formData.paymentMethod === "paypal" && paymentStatus !== 'completed') {
          return {
            nextText: "Complete PayPal Payment First",
            canProceed: false,
            message: "Please complete your PayPal payment to continue"
          };
        }
        return {
          nextText: "Review Order",
          canProceed: canProceedFromCurrentStep(),
          message: null
        };
        
      case 4:
        return {
          nextText: "Complete Rental",
          canProceed: canProceedFromCurrentStep(),
          message: formData.termsAccepted ? null : "Please accept the terms and conditions"
        };
        
      default:
        return {
          nextText: "Continue",
          canProceed: true,
          message: null
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="mt-8 pt-6 border-t border-gray-700">
      {/* Validation Message */}
      {stepInfo.message && (
        <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-200 text-sm">{stepInfo.message}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        {/* Back Button */}
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        ) : (
          <div></div>
        )}

        {/* Next/Submit Button */}
        <div className="flex items-center space-x-4">
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={onNext}
              disabled={!stepInfo.canProceed || isSubmitting}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                stepInfo.canProceed && !isSubmitting
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              <span>{stepInfo.nextText}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!stepInfo.canProceed || isSubmitting}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                stepInfo.canProceed && !isSubmitting
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>{stepInfo.nextText}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Additional Info Text */}
      {currentStep === 4 && !formData.termsAccepted && (
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Please review and accept the terms and conditions to complete your rental
          </p>
        </div>
      )}

      {/* Step Progress Indicator */}
      <div className="mt-6 relative">
        <div className="flex items-center justify-center space-x-12">
          {[
            { step: 1, label: "Details" },
            { step: 2, label: "Customer" }, 
            { step: 3, label: "Payment" },
            { step: 4, label: "Review" }
          ].map(({ step, label }) => (
            <div key={step} className="flex flex-col items-center space-y-2 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step === currentStep
                    ? 'bg-purple-500 text-white ring-2 ring-purple-300 ring-offset-2 ring-offset-gray-900'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-600 text-gray-400'
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle size={16} />
                ) : (
                  step
                )}
              </div>
              <span className={`text-xs font-medium ${
                step === currentStep 
                  ? 'text-purple-400' 
                  : step < currentStep 
                  ? 'text-green-400' 
                  : 'text-gray-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Connection Lines */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-8 -z-0">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-20 h-0.5 transition-all duration-300 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationControls;