import React, { useState, useRef, useCallback } from 'react';
import { Mail, User, Lock, Phone, Shield } from 'lucide-react';
import InputField from './InputField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import SubmitButton from './SubmitButton';
import RecaptchaField from './RecaptchaField';
import TermsCheckbox from './TermsCheckBox';
import LoginAttemptsWarning from './LoginAttemptsWarning';
import { useToast } from '../../components/Authentication/Toast';
import ConfirmationModal from '../../components/Authentication/ConfirmationModal';

export default function AuthForm({
  isSignUp,
  formData,
  errors,
  setErrors,
  isLoading,
  isAccountLocked,
  showPassword,
  showConfirmPassword,
  loginAttempts,
  onInputChange,
  onRecaptchaChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit
}) {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  // Use refs to store timeout IDs for proper cleanup
  const timeoutRefs = useRef({
    emailValidation: null,
    passwordMatch: null
  });

  // Client-side validation function
  const validateFormData = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (isSignUp && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (isSignUp) {
      // Full name validation
      if (!formData.fullName?.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      
      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      // Terms agreement validation
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
      
      // reCAPTCHA validation
      if (!formData.recaptchaToken) {
        newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
      }
    }
    
    return newErrors;
  };

  // Enhanced form submission with toast notifications
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any pending validation timeouts when submitting
    Object.values(timeoutRefs.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    
    // FIRST: Always do client-side validation before anything else
    const validationErrors = validateFormData();
    
    // If there are validation errors, show them and don't proceed
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError('Please fix the errors below', 4000);
      return;
    }
    
    // For login, proceed directly with submission
    if (!isSignUp) {
      return await onSubmit(e);
    }
    
    // For sign-up: Show confirmation modal only AFTER validation passes
    setConfirmationModal({
      isOpen: true,
      title: 'Create Account',
      message: 'Are you sure you want to create an account with the provided information?',
      type: 'info',
      onConfirm: () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        processActualSubmit(e);
      }
    });
  };

  // This function handles the actual submission after confirmation
  const processActualSubmit = async (e) => {
    try {
      const result = await onSubmit(e);
      showSuccess('Account created successfully! Please check your email for verification.', 6000);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to create account';
      showError(errorMessage, 5000);
      throw error;
    }
  };

  // Clean up function for timeouts
  const clearValidationTimeout = useCallback((timeoutKey) => {
    if (timeoutRefs.current[timeoutKey]) {
      clearTimeout(timeoutRefs.current[timeoutKey]);
      timeoutRefs.current[timeoutKey] = null;
    }
  }, []);

  // Enhanced input change handler with PROPER validation timing
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Call original handler
    onInputChange(e);
    
    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // FIXED: Only show validation toasts after user has finished typing
    // and only for certain conditions
    
    // Email validation - only show toast after 3 seconds of no typing
    // and only if the email appears to be "complete" but invalid
    if (name === 'email' && value) {
      clearValidationTimeout('emailValidation');
      
      // Only validate if email looks like user is done typing (has @ and .)
      if (value.includes('@') && value.includes('.')) {
        timeoutRefs.current.emailValidation = setTimeout(() => {
          if (value && !/\S+@\S+\.\S+/.test(value)) {
            showWarning('Please enter a valid email address', 3000);
          }
        }, 3000); // Increased timeout to 3 seconds
      }
    }
    
    // Password confirmation validation - only after user pauses typing
    // and only if both fields have substantial content
    if (isSignUp && name === 'confirmPassword' && value) {
      clearValidationTimeout('passwordMatch');
      
      // Only validate if both passwords have some length and appear complete
      if (value.length >= 3 && formData.password && formData.password.length >= 3) {
        timeoutRefs.current.passwordMatch = setTimeout(() => {
          if (value && formData.password && value !== formData.password) {
            showWarning('Passwords do not match', 3000);
          }
        }, 2500); // 2.5 seconds delay
      }
    }
    
    // Clear password match timeout if user is typing in password field
    if (name === 'password') {
      clearValidationTimeout('passwordMatch');
    }
  }, [onInputChange, errors, setErrors, formData.password, isSignUp, showWarning, clearValidationTimeout]);

  // Handle account locked scenario
  const handleAccountLocked = useCallback(() => {
    setConfirmationModal({
      isOpen: true,
      title: 'Account Locked',
      message: 'Your account has been temporarily locked due to multiple failed login attempts. Would you like to reset your password?',
      type: 'warning',
      confirmText: 'Reset Password',
      cancelText: 'Try Later',
      onConfirm: () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        showInfo('Password reset link will be sent to your email', 4000);
        // Add password reset logic here
      }
    });
  }, [showInfo]);

  // Handle terms agreement - REMOVED the immediate toast notification
  const handleTermsChange = useCallback((e) => {
    // Only show toast when user actually checks the box (not unchecks)
    if (e.target.checked) {
      // Use a small delay to make it feel less intrusive
      setTimeout(() => {
        showInfo('Thank you for agreeing to our terms and conditions', 2000);
      }, 300);
    }
    handleInputChange(e);
  }, [handleInputChange, showInfo]);

  // Handle reCAPTCHA completion - this one is fine as it's a deliberate action
  const handleRecaptchaChange = useCallback((token) => {
    if (token) {
      showSuccess('reCAPTCHA verified successfully', 2000);
    }
    onRecaptchaChange(token);
  }, [onRecaptchaChange, showSuccess]);

  // Show warning when login attempts are high
  React.useEffect(() => {
    if (!isSignUp && loginAttempts === 3) {
      showWarning('Warning: 2 more failed attempts will lock your account', 5000);
    } else if (!isSignUp && loginAttempts === 4) {
      showError('Caution: 1 more failed attempt will lock your account', 5000);
    }
  }, [loginAttempts, isSignUp]);

  // Show account locked modal when locked
  React.useEffect(() => {
    if (isAccountLocked) {
      handleAccountLocked();
    }
  }, [isAccountLocked, handleAccountLocked]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Full Name (Sign Up Only) */}
        {isSignUp && (
          <InputField
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Full Name"
            icon={User}
            error={errors.fullName}
          />
        )}

        {/* Email */}
        <InputField
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email Address"
          icon={Mail}
          error={errors.email}
        />

        {/* Phone Number (Sign Up Only) */}
        {isSignUp && (
          <InputField
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Phone Number (Optional)"
            icon={Phone}
            error={errors.phoneNumber}
          />
        )}

        {/* Password */}
        <div>
          <InputField
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            icon={Lock}
            error={errors.password}
            isPassword={true}
            showPassword={showPassword}
            onTogglePassword={onTogglePassword}
          />
          
          {/* Password Strength Indicator (Sign Up Only) */}
          {isSignUp && (
            <PasswordStrengthIndicator 
              password={formData.password}
              checkPasswordStrength={(password) => {
                const minLength = password.length >= 8;
                const hasUpper = /[A-Z]/.test(password);
                const hasLower = /[a-z]/.test(password);
                const hasNumber = /\d/.test(password);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                
                return { minLength, hasUpper, hasLower, hasNumber, hasSpecial };
              }}
            />
          )}
        </div>

        {/* Confirm Password (Sign Up Only) */}
        {isSignUp && (
          <InputField
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
            icon={Lock}
            error={errors.confirmPassword}
            isPassword={true}
            showPassword={showConfirmPassword}
            onTogglePassword={onToggleConfirmPassword}
          />
        )}

        {/* Terms Agreement Checkbox (Sign Up Only) */}
        {isSignUp && (
          <TermsCheckbox
            checked={formData.agreeToTerms}
            onChange={handleTermsChange}
            error={errors.agreeToTerms}
          />
        )}

        {/* Mock reCAPTCHA (Sign Up Only) */}
        {isSignUp && (
          <RecaptchaField
            onChange={handleRecaptchaChange}
            error={errors.recaptcha}
          />
        )}

        {/* Login Attempts Warning */}
        {!isSignUp && loginAttempts > 0 && loginAttempts < 5 && (
          <LoginAttemptsWarning attempts={loginAttempts} />
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{errors.submit}</p>
          </div>
        )}

        <SubmitButton 
          isLoading={isLoading}
          isSignUp={isSignUp}
          onSubmit={handleSubmit}
          disabled={isAccountLocked}
        />
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
      />
    </>
  );
}