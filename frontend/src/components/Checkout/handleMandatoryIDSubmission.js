// handleMandatoryIDSubmission.js - FIXED: Proper state management without loops

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

    // Give user a moment to see the form opened, then ask for confirmation
    setTimeout(() => {
      showCompletionDialog(setFormData, setErrors);
    }, 1500);
  }
};

// Completion dialog without infinite loops
const showCompletionDialog = (setFormData, setErrors) => {
  const completed = window.confirm(
    `Did you successfully submit your ID photo?\n\n` +
      `✅ Click OK if you completed the form submission\n` +
      `❌ Click Cancel if you need to submit it later`
  );

  if (completed) {
    // Update form data
    setFormData((prev) => ({
      ...prev,
      idSubmitted: true,
    }));

    // IMPORTANT: Clear the ID verification error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.idSubmitted;
      return newErrors;
    });

    // Success confirmation
    setTimeout(() => {
      alert(
        `✅ ID Verification Submitted!\n\n` +
          `Your ID verification has been received.\n` +
          `You can now continue with your rental.\n\n` +
          `📋 Important Reminders:\n` +
          `• Bring your PHYSICAL ID when picking up equipment\n` +
          `• ID must match the one you submitted\n` +
          `• Keep your ID with you during the entire rental period`
      );
    }, 100);
  } else {
    // User clicked Cancel - they haven't submitted yet
    // Just inform them, don't change any state
    alert(
      `ID Verification Pending\n\n` +
        `No problem! You can complete the verification anytime.\n\n` +
        `Click the "Submit ID Verification" button when you're ready.\n\n` +
        `Note: You must complete ID verification before proceeding to checkout.`
    );
  }
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
