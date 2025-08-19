import { useState } from 'react';

export default function useAuthActions({
  formData,
  setFormData,
  errors,
  setErrors,
  validateForm,
  isSignUp,
  isLoading,
  loginAttempts,
  setLoginAttempts,
  setIsAccountLocked,
  setLockoutTimeRemaining,
  setEmailVerificationSent,
  setIsLoading
}) {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: inputValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRecaptchaChange = (token) => {
    setFormData(prev => ({ ...prev, recaptchaToken: token }));
    if (errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: '' }));
    }
  };

  const handleGoogleSSO = async () => {
    setIsLoading(true);
    try {
      console.log('Initiating Google SSO...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Google SSO successful');
      
    } catch (error) {
      setErrors({ submit: 'Google Sign-In failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountLockout = () => {
    setIsAccountLocked(true);
    setLockoutTimeRemaining(15 * 60); // 15 minutes lockout
    
    // Start countdown timer
    const timer = setInterval(() => {
      setLockoutTimeRemaining(prev => {
        if (prev <= 1) {
          setIsAccountLocked(false);
          setLoginAttempts(0);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isSignUp) {
        console.log('Creating account...', {
          ...formData,
          role: 'customer',
          password: '[HASHED]'
        });
        
        setEmailVerificationSent(true);
        console.log('Audit Log: Account created for', formData.email);
        
      } else {
        console.log('Logging in...', {
          email: formData.email,
          password: '[HASHED]'
        });
        
        setLoginAttempts(0);
      }
      
      // Reset form on success
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
      
    } catch (error) {
      if (!isSignUp) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          handleAccountLockout();
          setErrors({ submit: 'Too many failed attempts. Account temporarily locked.' });
        } else {
          setErrors({ 
            submit: `Authentication failed. ${5 - newAttempts} attempts remaining.` 
          });
        }
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleInputChange,
    handleRecaptchaChange,
    handleGoogleSSO,
    handleSubmit
  };
}