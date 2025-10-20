// Fixed checkoutValidation.js - Removed unused parameter and ensured proper validation

export const validateStep = (step, formData) => {
  const newErrors = {};

  // Helper function for proper date comparison
  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const today = normalizeDate(new Date());

  switch (step) {
    case 1:
      // Date validation
      if (!formData.startDate) {
        newErrors.startDate = "Start date is required";
      } else {
        const startDate = normalizeDate(formData.startDate);
        if (startDate < today) {
          newErrors.startDate = "Start date cannot be in the past";
        }
      }

      if (!formData.endDate) {
        newErrors.endDate = "End date is required";
      } else if (formData.startDate) {
        const startDate = normalizeDate(formData.startDate);
        const endDate = normalizeDate(formData.endDate);

        if (endDate < today) {
          newErrors.endDate = "End date cannot be in the past";
        } else if (endDate <= startDate) {
          newErrors.endDate = "End date must be after start date";
        }
      }

      // Time validation
      if (!formData.pickupTime && formData.deliveryMethod === "pickup") {
        newErrors.pickupTime = "Pickup time is required for store pickup";
      }

      if (!formData.returnTime) {
        newErrors.returnTime = "Return time is required";
      }

      // MANDATORY ID VERIFICATION - Required for ALL rentals
      if (!formData.idSubmitted) {
        newErrors.idSubmitted =
          "ID verification is required for all equipment rentals. Please complete the verification process.";
      }

      break;

    case 2:
      // Customer information validation
      if (!formData.firstName?.trim()) {
        newErrors.firstName = "First name is required";
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = "First name must be at least 2 characters";
      }

      if (!formData.lastName?.trim()) {
        newErrors.lastName = "Last name is required";
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters";
      }

      if (!formData.email?.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.phone?.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      } else if (formData.phone.replace(/\D/g, "").length < 10) {
        newErrors.phone = "Phone number must be at least 10 digits";
      }

      // Delivery address validation (only if delivery method is selected)
      if (formData.deliveryMethod === "delivery") {
        if (!formData.address?.trim()) {
          newErrors.address = "Street address is required for delivery";
        } else if (formData.address.trim().length < 5) {
          newErrors.address = "Please provide a complete address";
        }

        if (!formData.city?.trim()) {
          newErrors.city = "City is required for delivery";
        }

        if (!formData.state?.trim()) {
          newErrors.state = "Province/State is required for delivery";
        }

        if (!formData.zipCode?.trim()) {
          newErrors.zipCode = "ZIP code is required for delivery";
        } else if (!/^\d{4}$/.test(formData.zipCode.trim())) {
          newErrors.zipCode = "Please enter a valid 4-digit ZIP code";
        }
      }
      break;

    case 3:
      // Payment method validation
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = "Please select a payment method";
      }

      if (formData.paymentMethod === "paypal") {
        if (!formData.paypalEmail?.trim()) {
          newErrors.paypalEmail = "PayPal email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.paypalEmail)) {
          newErrors.paypalEmail = "Please enter a valid PayPal email address";
        }
      }
      break;

    case 4:
      // Final review validation
      if (!formData.termsAccepted) {
        newErrors.termsAccepted =
          "You must accept the terms and conditions to proceed";
      }

      // MANDATORY ID VERIFICATION - Re-check for final submission
      if (!formData.idSubmitted) {
        newErrors.idSubmitted =
          "ID verification is required for all equipment rentals. Please complete the verification process.";
      }

      // Ensure all required times are still selected
      if (formData.deliveryMethod === "pickup" && !formData.pickupTime) {
        newErrors.pickupTime = "Pickup time selection is required";
      }

      if (!formData.returnTime) {
        newErrors.returnTime = "Return time selection is required";
      }

      // Final date validation
      if (formData.startDate) {
        const startDate = normalizeDate(formData.startDate);
        if (startDate < today) {
          newErrors.startDate = "Start date cannot be in the past";
        }
      }

      if (formData.endDate && formData.startDate) {
        const startDate = normalizeDate(formData.startDate);
        const endDate = normalizeDate(formData.endDate);
        if (endDate <= startDate) {
          newErrors.endDate = "End date must be after start date";
        }
      }

      // Ensure basic info is still valid
      if (!formData.firstName?.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName?.trim()) {
        newErrors.lastName = "Last name is required";
      }
      if (!formData.email?.trim()) {
        newErrors.email = "Email is required";
      }
      if (!formData.phone?.trim()) {
        newErrors.phone = "Phone number is required";
      }

      break;
  }

  const isValid = Object.keys(newErrors).length === 0;

  // Debug logging
  console.log(`VALIDATION RESULT for Step ${step}:`, {
    idSubmitted: formData.idSubmitted,
    errors: newErrors,
    errorCount: Object.keys(newErrors).length,
    isValid,
  });

  return {
    isValid,
    errors: newErrors,
  };
};

// Helper function to validate individual date
export const validateDate = (date, minDate = null) => {
  if (!date) return { isValid: false, error: "Date is required" };

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (normalizedDate < today) {
    return { isValid: false, error: "Date cannot be in the past" };
  }

  if (minDate) {
    const normalizedMinDate = new Date(minDate);
    normalizedMinDate.setHours(0, 0, 0, 0);

    if (normalizedDate < normalizedMinDate) {
      return { isValid: false, error: "Date must be after the start date" };
    }
  }

  return { isValid: true, error: null };
};

// Helper function to validate ID verification - Mandatory for ALL rentals
export const validateIDVerification = (formData) => {
  if (!formData.idSubmitted) {
    return {
      isValid: false,
      error: "ID verification is required for all equipment rentals",
    };
  }

  return { isValid: true, error: null };
};
