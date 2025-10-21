// handleMandatoryIDSubmission.js - FIXED: No automatic dialog, customer confirms manually

export const handleMandatoryIDSubmission = (
  formData,
  setFormData,
  setErrors
) => {
  // If already submitted, prevent re-submission
  if (formData.idSubmitted) {
    alert("✅ ID verification already submitted!");
    return;
  }

  const confirmed = window.confirm(
    `Equipment Rental ID Verification Required\n\n` +
      `All equipment rentals require ID verification for security and insurance purposes.\n\n` +
      `Please submit a photo of your valid government ID through our secure form.\n\n` +
      `⚠️ Important: You must bring the SAME physical ID when picking up/receiving your rental.\n\n` +
      `After submitting the form, come back here and check the confirmation box.\n\n` +
      `Click OK to open the verification form.`
  );

  if (confirmed) {
    // Use your actual Google Form URL with pre-filled email if available
    const formUrl = `https://forms.gle/na7LxwpUkZznek7i8${
      formData.email
        ? `?entry.emailAddress=${encodeURIComponent(formData.email)}`
        : ""
    }`;

    // Open form in new tab
    const formWindow = window.open(formUrl, "_blank");

    // Check if popup was blocked
    if (
      !formWindow ||
      formWindow.closed ||
      typeof formWindow.closed === "undefined"
    ) {
      alert(
        "Popup Blocked!\n\n" +
          "Please allow popups for this site and try again.\n\n" +
          "Or copy this link and open it manually:\n" +
          formUrl
      );
      return;
    }

    // FIXED: No automatic dialog - let customer confirm manually via checkbox
    alert(
      "Form opened in new tab!\n\n" +
        "After completing the form, come back here and check the confirmation box below the button."
    );
  }
};

// Manual confirmation handler (called when checkbox is checked)
export const handleManualIDConfirmation = (setFormData, setErrors) => {
  // Update form data
  setFormData((prev) => ({
    ...prev,
    idSubmitted: true,
  }));

  // Clear the ID verification error
  setErrors((prev) => {
    const newErrors = { ...prev };
    delete newErrors.idSubmitted;
    return newErrors;
  });

  // Success confirmation
  alert(
    `✅ ID Verification Confirmed!\n\n` +
      `Thank you for completing the verification.\n` +
      `You can now continue with your rental.\n\n` +
      `📋 Important Reminders:\n` +
      `• Bring your PHYSICAL ID when picking up equipment\n` +
      `• ID must match the one you submitted\n` +
      `• Keep your ID with you during the entire rental period`
  );
};

// Validation helper specifically for mandatory ID verification
export const validateMandatoryID = (formData) => {
  if (!formData.idSubmitted) {
    return {
      isValid: false,
      error:
        "ID verification is required for all equipment rentals. Please complete the verification process to continue.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

// Helper to check if ID verification is complete before allowing progression
export const canProceedWithoutID = () => {
  return false; // Always require ID verification now
};

// Generate reminder message for physical ID
export const generatePhysicalIDReminder = (deliveryMethod) => {
  const action =
    deliveryMethod === "pickup" ? "pick up" : "receive delivery of";

  return `Important: Bring your physical ID (the same one you submitted) when you ${action} your rental equipment. This is mandatory for equipment verification and handover.`;
};
