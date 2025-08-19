import React from 'react';
import { Mail, User, Lock, Phone, Shield } from 'lucide-react';
import InputField from './InputField';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import SubmitButton from './SubmitButton';
import RecaptchaField from './RecaptchaField';
import TermsCheckbox from './TermsCheckBox';
import LoginAttemptsWarning from './LoginAttemptsWarning';

export default function AuthForm({
  isSignUp,
  formData,
  errors,
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
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      
      {/* Full Name (Sign Up Only) */}
      {isSignUp && (
        <InputField
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={onInputChange}
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
        onChange={onInputChange}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
          error={errors.agreeToTerms}
        />
      )}

      {/* Mock reCAPTCHA (Sign Up Only) */}
      {isSignUp && (
        <RecaptchaField
          onChange={onRecaptchaChange}
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
        onSubmit={onSubmit}
        disabled={isAccountLocked}
      />
    </form>
  );
}