import { useMemo } from 'react';

export default function useAuthValidation(formData, isSignUp, isAccountLocked, lockoutTimeRemaining) {
  const checkPasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return { minLength, hasUpper, hasLower, hasNumber, hasSpecial };
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
  if (!phone) return true; // Optional field
  
  // Remove all non-digit characters except + at the start
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // More flexible regex that handles various international formats
  const phoneRegex = /^[\+]?[\d]{7,15}$/;
  
  // Additional checks for common formats
  const isValid = phoneRegex.test(cleanPhone);
  

  // This is a more permissive approach that accepts most reasonable formats
  if (!isValid) {
    // Check if it's a US format like (123) 456-7890 or 123-456-7890
    const usFormatRegex = /^(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    if (usFormatRegex.test(phone)) {
      return true;
    }
    
    // Check if it's an international format
    const intlFormatRegex = /^[\+][1-9]{1}[0-9]{3,14}$/;
    if (intlFormatRegex.test(cleanPhone)) {
      return true;
    }
  }
  
  return isValid;
};

  // Memoized validation function that RETURNS the validation results
  const validateForm = useMemo(() => {
    return () => { // Return a function that performs validation
      const newErrors = {};
      
      // Common validations for both login and signup
      // Email validation
      if (!formData.email || formData.email.trim() === '') {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Password validation
      if (!formData.password || formData.password.trim() === '') {
        newErrors.password = 'Password is required';
      } else if (isSignUp) {
        // Strict password validation only for sign up
        const strength = checkPasswordStrength(formData.password);
        if (!strength.minLength) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!(strength.hasUpper && strength.hasLower && strength.hasNumber && strength.hasSpecial)) {
          newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
        }
      } else {
        // For login, just check minimum length (less strict)
        if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }
      }
      
      // Sign up specific validations
      if (isSignUp) {
        // Full name validation
        if (!formData.fullName || formData.fullName.trim() === '') {
          newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
          newErrors.fullName = 'Full name must be at least 2 characters';
        }
        
        // Phone number validation (optional for signup)
        if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Please enter a valid phone number';
        }
        
        // Confirm password validation
        if (!formData.confirmPassword || formData.confirmPassword.trim() === '') {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        
        // Terms agreement validation
        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy';
        }
        
        // reCAPTCHA validation (only for signup)
        if (!formData.recaptchaToken) {
          newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
        }
      }
      
      // Account lockout check (applies to both login and signup attempts)
      if (isAccountLocked && lockoutTimeRemaining > 0) {
        const minutesRemaining = Math.ceil(lockoutTimeRemaining / 60);
        newErrors.submit = `Account temporarily locked. Please try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`;
      }
      
      return newErrors;
    };
  }, [
    formData.email,
    formData.password,
    formData.fullName,
    formData.phoneNumber,
    formData.confirmPassword,
    formData.agreeToTerms,
    formData.recaptchaToken,
    isSignUp,
    isAccountLocked,
    lockoutTimeRemaining
  ]);

  return {
    validateForm,
    checkPasswordStrength,
    validateEmail,
    validatePhoneNumber
  };
}