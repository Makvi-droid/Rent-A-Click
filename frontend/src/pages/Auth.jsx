import React, { useState, useRef } from 'react';
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
    setLoginAttempts,        // Added missing setter
    setIsAccountLocked,      // Added missing setter
    setLockoutTimeRemaining, // Added missing setter
    setEmailVerificationSent, // Added missing setter
    setIsLoading,            // Added missing setter
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
    setLoginAttempts,        // Now properly passed
    setIsAccountLocked,      // Now properly passed
    setLockoutTimeRemaining, // Now properly passed
    setEmailVerificationSent, // Now properly passed
    setIsLoading             // Now properly passed
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundElements />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            
            <ImageSection />

            {/* Form Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center relative">
              <div className="w-full max-w-md mx-auto">

                <BackButton />
                
                <AuthToggle isSignUp={isSignUp} toggleMode={toggleMode} />

                <FormHeader isSignUp={isSignUp} />

                <NotificationBar 
                  isAccountLocked={isAccountLocked}
                  lockoutTimeRemaining={lockoutTimeRemaining}
                  emailVerificationSent={emailVerificationSent}
                />

                <GoogleSSO 
                  onGoogleSSO={handleGoogleSSO}
                  isLoading={isLoading}
                  isAccountLocked={isAccountLocked}
                />

                <AuthForm
                  isSignUp={isSignUp}
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  isAccountLocked={isAccountLocked}
                  showPassword={showPassword}
                  showConfirmPassword={showConfirmPassword}
                  loginAttempts={loginAttempts}
                  recaptchaRef={recaptchaRef}  // Added recaptchaRef prop
                  onInputChange={handleInputChange}
                  onRecaptchaChange={handleRecaptchaChange}
                  onTogglePassword={() => setShowPassword(prev => !prev)}
                  onToggleConfirmPassword={() => setShowConfirmPassword(prev => !prev)}
                  onSubmit={handleSubmit}
                />

                <FormFooter isSignUp={isSignUp} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;