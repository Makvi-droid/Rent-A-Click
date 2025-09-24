// FIXED: CheckoutFormSection.jsx
import React from "react";
import RentalDetailsStep from "./RentalDetailsStep";
import CustomerInfoStep from "./CustomerInfoStep";
import PaymentStep from "./PaymentStep";
import ReviewStep from "./ReviewStep";
import NavigationControls from "./NavigationControls";

const CheckoutFormSection = ({
  currentStep,
  formData,
  errors,
  rentalDays,
  formatCurrency,
  subtotal,
  total,
  onDateChange,
  onInputChange,
  getTodayDate,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  // PayPal specific props
  paymentStatus,
  onPayPalSuccess,
  onPayPalError,
  PayPalPaymentButton,
  rentalItems,
  // FIXED: Props for camera rental and ID submission
  hasCameraRental = false,
  onGoogleFormSubmission
}) => {
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RentalDetailsStep
            formData={formData}
            errors={errors}
            rentalDays={rentalDays}
            formatCurrency={formatCurrency}
            subtotal={subtotal}
            onDateChange={onDateChange}
            onInputChange={onInputChange}
            getTodayDate={getTodayDate}
            // FIXED: Pass camera rental props
            hasCameraRental={hasCameraRental}
            onGoogleFormSubmission={onGoogleFormSubmission}
          />
        );
      case 2:
        return (
          <CustomerInfoStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
          />
        );
      case 3:
        return (
          <PaymentStep
            formData={formData}
            errors={errors}
            onInputChange={onInputChange}
            total={total}
            formatCurrency={formatCurrency}
            paymentStatus={paymentStatus}
            onPayPalSuccess={onPayPalSuccess}
            onPayPalError={onPayPalError}
            PayPalPaymentButton={PayPalPaymentButton}
            rentalDays={rentalDays}
            rentalItems={rentalItems}
          />
        );
      case 4:
        return (
          <ReviewStep
            formData={formData}
            errors={errors}
            rentalDays={rentalDays}
            onInputChange={onInputChange}
            paymentStatus={paymentStatus}
            // FIXED: Pass additional props for review
            hasCameraRental={hasCameraRental}
            rentalItems={rentalItems}
            formatCurrency={formatCurrency}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="lg:col-span-2">
      <div className="bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8">
        {renderCurrentStep()}

        <NavigationControls
          currentStep={currentStep}
          isSubmitting={isSubmitting}
          onBack={onBack}
          onNext={onNext}
          onSubmit={onSubmit}
          formData={formData}
          paymentStatus={paymentStatus}
          // FIXED: Pass camera rental validation
          hasCameraRental={hasCameraRental}
        />
      </div>
    </div>
  );
};

export default CheckoutFormSection;