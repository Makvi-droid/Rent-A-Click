import { useRef, useEffect, useState } from "react";
import AuthToggle from "../components/Authentication/AuthToggle";
import BackButton from "../components/Authentication/BackButton";
import BackgroundElements from "../components/Authentication/BackgroundElements";
import FormFooter from "../components/Authentication/FormFooter";
import FormHeader from "../components/Authentication/FormHeader";
import ImageSection from "../components/Authentication/ImageSection";
import AuthForm from "../components/Authentication/AuthForm";
import GoogleSSO from "../components/Authentication/GoogleSSO";
import NotificationBar from "../components/Authentication/NotificationBar";
import TwoFactorModal from "../components/Authentication/TwoFactorModal";
import PasswordResetModal from "../components/Authentication/PasswordResetModal"; // NEW
import UseAuthState from "../hooks/UseAuthState";
import UseAuthValidation from "../hooks/UseAuthValidation";
import UseAuthActions from "../hooks/UseAuthActions";

function Auth() {
  const recaptchaRef = useRef();

  // NEW: Password reset modal state
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetReason, setPasswordResetReason] = useState("default");

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
    toggleMode,
  } = UseAuthState();

  const { validateForm } = UseAuthValidation(
    formData,
    isSignUp,
    isAccountLocked,
    lockoutTimeRemaining
  );

  const {
    handleInputChange,
    handleRecaptchaChange,
    handleGoogleSSO,
    handleSubmit,
    showConfirmModal,
    setShowConfirmModal,
    pendingEmailData,
    handleExistingEmailConfirmation,
    checkEmailExists,
    show2FAModal,
    setShow2FAModal,
    twoFactorCode,
    setTwoFactorCode,
    twoFactorError,
    setTwoFactorError,
    handle2FASubmit,
    resend2FACode,
    resendCooldown,
    handlePasswordReset, // NEW: from UseAuthActions
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
    recaptchaRef,
  });

  // Clear form errors when switching between login/signup modes
  useEffect(() => {
    setErrors({});
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, [isSignUp, setErrors]);

  // Clear sensitive form data when switching modes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
      recaptchaToken: null,
    }));
  }, [isSignUp, setFormData]);

  // Auto-hide password fields when switching to login mode
  useEffect(() => {
    if (!isSignUp) {
      setShowConfirmPassword(false);
    }
  }, [isSignUp, setShowConfirmPassword]);

  // NEW: Handle 2FA modal close
  const handle2FAClose = () => {
    setShow2FAModal(false);
    setTwoFactorCode("");
    setTwoFactorError("");
    setIsLoading(false);
  };

  // NEW: Handle forgot password from "Forgot Password" link
  const handleForgotPassword = () => {
    setPasswordResetReason("default");
    setShowPasswordResetModal(true);
  };

  // NEW: Handle password reset from lockout
  const handleLockoutPasswordReset = () => {
    setPasswordResetReason("lockout");
    setShowPasswordResetModal(true);
  };

  // In Auth.jsx, change this:
  // In Auth.jsx, replace the handlePasswordResetSuccess function with this:

  const handlePasswordResetSuccess = async (
    email,
    oldPassword,
    newPassword
  ) => {
    try {
      await handlePasswordReset(email, oldPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };
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
                  isLoading={isLoading}
                />

                <FormHeader isSignUp={isSignUp} />

                <NotificationBar
                  isAccountLocked={isAccountLocked}
                  lockoutTimeRemaining={lockoutTimeRemaining}
                  emailVerificationSent={emailVerificationSent}
                  isSignUp={isSignUp}
                  onResetPassword={handleLockoutPasswordReset} // NEW: Pass handler
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
                  onTogglePassword={() => setShowPassword((prev) => !prev)}
                  onToggleConfirmPassword={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  onSubmit={handleSubmit}
                />

                <FormFooter
                  isSignUp={isSignUp}
                  onForgotPassword={handleForgotPassword} // NEW: Updated handler
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication Modal */}
      <TwoFactorModal
        isOpen={show2FAModal}
        onClose={handle2FAClose}
        onSubmit={handle2FASubmit}
        onResend={resend2FACode}
        twoFactorCode={twoFactorCode}
        setTwoFactorCode={setTwoFactorCode}
        error={twoFactorError}
        isLoading={isLoading}
        resendCooldown={resendCooldown}
      />

      {/* NEW: Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        onSuccess={handlePasswordResetSuccess}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Auth;
