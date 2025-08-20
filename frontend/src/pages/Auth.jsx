import React, { useState, useRef, useEffect } from 'react';
import AuthToggle from '../components/Authentication/AuthToggle';
import BackButton from '../components/Authentication/BackButton';
import BackgroundElements from '../components/Authentication/BackgroundElements';
import FormFooter from '../components/Authentication/FormFooter';
import FormHeader from '../components/Authentication/FormHeader';
import ImageSection from '../components/Authentication/ImageSection';
import AuthForm from '../components/Authentication/AuthForm';
import GoogleSSO from '../components/Authentication/GoogleSSO';
import NotificationBar from '../components/Authentication/NotificationBar';
import UseAuthState from '../hooks/UseAuthState';
import UseAuthValidation from '../hooks/UseAuthValidation';
import UseAuthActions from '../hooks/UseAuthActions';

function Auth() {
  const recaptchaRef = useRef();

  // Custom hooks for state management
  const {
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
    setFormData,
    setErrors,
    setLoginAttempts,
    setIsAccountLocked,
    setLockoutTimeRemaining,
    setEmailVerificationSent,
    setIsLoading,
    toggleMode
  } = UseAuthState();

  const { validateForm } = UseAuthValidation(formData, isSignUp, isAccountLocked, lockoutTimeRemaining);

  const {
    handleInputChange,
    handleRecaptchaChange,
    handleGoogleSSO,
    handleSubmit
  } = UseAuthActions({
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
    setIsLoading,
    recaptchaRef // Pass recaptchaRef to actions hook
  });

  // Clear form errors when switching between login/signup modes
  useEffect(() => {
    setErrors({});
    // Reset reCAPTCHA when switching modes
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, [isSignUp, setErrors]);

  // Clear sensitive form data when switching modes (optional security measure)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: '',
      recaptchaToken: null
    }));
  }, [isSignUp, setFormData]);

  // Auto-hide password fields when switching to login mode
  useEffect(() => {
    if (!isSignUp) {
      setShowConfirmPassword(false);
    }
  }, [isSignUp, setShowConfirmPassword]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundElements />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            
            <ImageSection isSignUp={isSignUp} />

            {/* Form Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center relative">
              <div className="w-full max-w-md mx-auto">

                <BackButton />
                
                <AuthToggle 
                  isSignUp={isSignUp} 
                  toggleMode={toggleMode}
                  isLoading={isLoading} // Disable toggle during loading
                />

                <FormHeader isSignUp={isSignUp} />

                <NotificationBar 
                  isAccountLocked={isAccountLocked}
                  lockoutTimeRemaining={lockoutTimeRemaining}
                  emailVerificationSent={emailVerificationSent}
                  isSignUp={isSignUp}
                />

                <GoogleSSO 
                  onGoogleSSO={handleGoogleSSO}
                  isLoading={isLoading}
                  isAccountLocked={isAccountLocked}
                  isSignUp={isSignUp}
                />

                <AuthForm
                  isSignUp={isSignUp}
                  formData={formData}
                  errors={errors}
                  setErrors={setErrors} 
                  isLoading={isLoading}
                  isAccountLocked={isAccountLocked}
                  showPassword={showPassword}
                  showConfirmPassword={showConfirmPassword}
                  loginAttempts={loginAttempts}
                  recaptchaRef={recaptchaRef}
                  onInputChange={handleInputChange}
                  onRecaptchaChange={handleRecaptchaChange}
                  onTogglePassword={() => setShowPassword(prev => !prev)}
                  onToggleConfirmPassword={() => setShowConfirmPassword(prev => !prev)}
                  onSubmit={handleSubmit}
                />

                <FormFooter 
                  isSignUp={isSignUp} 
                  onForgotPassword={() => {
                    // Handle forgot password logic here
                    console.log('Forgot password clicked');
                    // You could add a modal or redirect to forgot password page
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;