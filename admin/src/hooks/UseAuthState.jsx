import { useState } from 'react';

export default function UseAuthState() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    agreeToTerms: false,
    recaptchaToken: null
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = (mode) => {
    console.log('toggleMode called with:', mode, 'current isSignUp:', isSignUp);
    
    if (typeof mode === 'boolean') {
      setIsSignUp(mode);
    } else {
      setIsSignUp(!isSignUp);
    }
    
    // Reset form data and errors
    setFormData({ 
      email: '', 
      password: '', 
      confirmPassword: '', 
      fullName: '',
      phoneNumber: '',
      agreeToTerms: false,
      recaptchaToken: null
    });
    setErrors({});
    setLoginAttempts(0);
    setEmailVerificationSent(false);
  };

  return {
    isSignUp,
    showPassword,
    showConfirmPassword,
    loginAttempts,
    isAccountLocked,
    lockoutTimeRemaining,
    emailVerificationSent,
    formData,
    errors,
    isLoading,
    setIsSignUp,
    setShowPassword,
    setShowConfirmPassword,
    setLoginAttempts,
    setIsAccountLocked,
    setLockoutTimeRemaining,
    setEmailVerificationSent,
    setFormData,
    setErrors,
    setIsLoading,
    toggleMode
  };
}