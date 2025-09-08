// hooks/useAuth.js
import { useState } from 'react';
import { AuthService } from '../services/AuthService';
import { getAuthErrorMessage, getGoogleAuthErrorMessage } from '../utils/authErrorHandler';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const signUp = async (formData, { onSuccess, onError }) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const { user, emailVerificationSent } = await AuthService.signUpWithEmail(
        formData.email,
        formData.password,
        {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          agreeToTerms: formData.agreeToTerms
        }
      );

      setEmailVerificationSent(emailVerificationSent);
      onSuccess?.(user);
      
    } catch (error) {
      console.error("Sign up error:", error);
      const errorMessage = getAuthErrorMessage(error.code, true);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (formData, { onSuccess, onError }) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const user = await AuthService.signInWithEmail(formData.email, formData.password);
      onSuccess?.(user);
      
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage = getAuthErrorMessage(error.code, false);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async ({ onSuccess, onError }) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const { user, isNewUser } = await AuthService.signInWithGoogle();
      onSuccess?.(user, isNewUser);
      
    } catch (error) {
      console.error("Google Sign-In error:", error);
      const errorMessage = getGoogleAuthErrorMessage(error.code);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    emailVerificationSent,
    signUp,
    signIn,
    signInWithGoogle,
  };
};