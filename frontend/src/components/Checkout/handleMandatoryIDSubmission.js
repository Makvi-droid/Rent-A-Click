// MandatoryFormHandler.js - Handles the Google Form submission for mandatory ID verification

export const handleMandatoryIDSubmission = (formData, setFormData, setErrors) => {
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
      formData.email ? `?entry.emailAddress=${encodeURIComponent(formData.email)}` : ''
    }`;

    // Open form in new tab
    window.open(formUrl, "_blank");

    // Simulate marking as submitted (since Google Forms doesn't callback to your app)
    setTimeout(() => {
      setFormData(prev => ({ ...prev, idSubmitted: true }));
      showMandatoryCompletionDialog(formData, setFormData, setErrors);
    }, 2000);
  }
};

// Show completion confirmation dialog
const showMandatoryCompletionDialog = (formData, setFormData, setErrors) => {
  const completed = window.confirm(
    `Did you successfully submit your ID photo?\n\n` +
    `✅ If yes, click OK to continue\n` +
    `❌ If no, click Cancel to reopen the form`
  );
  
  if (completed) {
    setFormData(prev => ({
      ...prev,
      idSubmitted: true
    }));
    
    // Clear validation errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.idSubmitted;
      return newErrors;
    });
    
    alert(
      `ID Verification Submitted!\n\n` +
      `✓ Your ID verification has been received\n` +
      `✓ You can now continue with your rental\n\n` +
      `Remember to bring your PHYSICAL ID when you:\n` +
      `• Pick up your rental equipment\n` +
      `• Receive your delivery\n\n` +
      `Your ID must match the one you submitted for verification.`
    );
  } else {
    // Reopen form
    const formUrl = `https://forms.gle/na7LxwpUkZznek7i8${
      formData.email ? `?entry.emailAddress=${encodeURIComponent(formData.email)}` : ''
    }`;
    window.open(formUrl, '_blank');
    
    // Reset submission status
    setFormData(prev => ({
      ...prev,
      idSubmitted: false
    }));
    
    // Retry confirmation after a delay
    setTimeout(() => showMandatoryCompletionDialog(formData, setFormData, setErrors), 2000);
  }
};

// Validation helper specifically for mandatory ID verification
export const validateMandatoryID = (formData) => {
  if (!formData.idSubmitted) {
    return {
      isValid: false,
      error: "ID verification is required for all equipment rentals. Please complete the verification process to continue."
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

// Helper to check if ID verification is complete before allowing progression
export const canProceedWithoutID = () => {
  return false; // Always require ID verification now
};

// Generate reminder message for physical ID
export const generatePhysicalIDReminder = (deliveryMethod) => {
  const action = deliveryMethod === 'pickup' ? 'pick up' : 'receive delivery of';
  
  return `Important: Bring your physical ID (the same one you submitted) when you ${action} your rental equipment. This is mandatory for equipment verification and handover.`;
};