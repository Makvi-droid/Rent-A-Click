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
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const strength = checkPasswordStrength(formData.password);
      if (!strength.minLength) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!(strength.hasUpper && strength.hasLower && strength.hasNumber && strength.hasSpecial)) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
      }
    }
    
    // Sign up specific validations
    if (isSignUp) {
      // Full name validation
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
      }
      
      // Phone number validation
      if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
      
      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      // Terms agreement validation
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy';
      }
      
      // Mock reCAPTCHA validation
      if (!formData.recaptchaToken) {
        newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
      }
    }
    
    // Account lockout check
    if (isAccountLocked) {
      newErrors.submit = `Account temporarily locked. Please try again in ${Math.ceil(lockoutTimeRemaining / 60)} minutes.`;
    }
    
    return newErrors;
  };

  return {
    validateForm,
    checkPasswordStrength,
    validateEmail,
    validatePhoneNumber
  };
}