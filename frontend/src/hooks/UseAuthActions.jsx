// hooks/useAuthActions.js
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added navigation import
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { useToast } from "../components/Authentication/Toast";

function UseAuthActions({
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
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const navigate = useNavigate(); // Added navigation hook
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState(null);
  
  // Refs for debouncing
  const emailCheckTimeoutRef = useRef(null);
  const lastCheckedEmailRef = useRef("");

  // Improved email completion check
  const isEmailLikelyComplete = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email) && email.length >= 8;
  };

  // Check if email is already registered
  const checkEmailExists = async (email) => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return {
        exists: signInMethods.length > 0,
        methods: signInMethods,
        isGoogleUser: signInMethods.includes('google.com'),
        isEmailUser: signInMethods.includes('password')
      };
    } catch (error) {
      console.error("Error checking email:", error);
      return { exists: false, methods: [], isGoogleUser: false, isEmailUser: false };
    }
  };

  // Debounced email validation function - NO toast notifications during real-time validation
  const debouncedEmailCheck = useCallback(async (email) => {
    // Don't check the same email twice
    if (email === lastCheckedEmailRef.current) return;
    
    lastCheckedEmailRef.current = email;
    
    const emailCheck = await checkEmailExists(email);
    
    // Only show validation if the email is still the current one
    if (email === formData.email.toLowerCase().trim()) {
      if (emailCheck.exists) {
        if (emailCheck.isGoogleUser && !emailCheck.isEmailUser) {
          // Only set form error - NO toast notification during typing
          setErrors(prev => ({ 
            ...prev, 
            email: "Email registered with Google. Use Google Sign-In." 
          }));
        } else {
          // Only set form error - NO toast notification during typing
          setErrors(prev => ({ 
            ...prev, 
            email: "Email already exists. Try logging in." 
          }));
        }
      } else {
        // Clear email error if email is available
        setErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors.email && (
            newErrors.email.includes("already exists") || 
            newErrors.email.includes("registered with Google")
          )) {
            delete newErrors.email;
          }
          return newErrors;
        });
      }
    }
  }, [formData.email, setErrors]);

  // Input handling with improved debounced validation
  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: inputValue }));

    // Clear errors for this field immediately
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Debounced email validation for sign-up only
    if (name === "email" && isSignUp) {
      const trimmedEmail = value.toLowerCase().trim();
      
      // Clear previous timeout
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }

      // Use improved email completion check
      if (isEmailLikelyComplete(trimmedEmail)) {
        // Set new timeout for validation (wait 2 seconds after user stops typing)
        emailCheckTimeoutRef.current = setTimeout(() => {
          debouncedEmailCheck(trimmedEmail);
        }, 2000);
      } else {
        // Clear any existing email validation errors if email is incomplete
        setErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors.email && (
            newErrors.email.includes("already exists") || 
            newErrors.email.includes("registered with Google")
          )) {
            delete newErrors.email;
          }
          return newErrors;
        });
        lastCheckedEmailRef.current = "";
      }
    }
  };

  const handleRecaptchaChange = (token) => {
    setFormData((prev) => ({ ...prev, recaptchaToken: token }));
    if (errors.recaptcha) {
      setErrors((prev) => ({ ...prev, recaptcha: "" }));
    }
  };

  // Enhanced Google SSO with better validation and navigation
  const handleGoogleSSO = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists
      const userRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        // New Google user
        const userData = {
          fullName: user.displayName || "",
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          provider: "google",
          role: "customer",
          twoFA: false,
          isEmailVerified: user.emailVerified || false,
          profileComplete: false
        };

        await setDoc(userRef, userData);
        
        showSuccess(
          `Welcome ${user.displayName || 'User'}! Your account has been created successfully.`,
          6000
        );
        console.log("New Google user profile created:", user.email);
        
        // Navigate to dashboard after successful Google signup
        setTimeout(() => {
          navigate('/homePage');
        }, 1500); // Small delay to show success message
        
      } else {
        // Existing Google user
        await setDoc(userRef, { 
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        showSuccess(
          `Welcome back ${user.displayName || 'User'}!`,
          4000
        );
        console.log("Existing Google user logged in:", user.email);
        
        // Navigate to dashboard after successful Google login
        setTimeout(() => {
          navigate('/homePage');
        }, 1500); // Small delay to show success message
      }

    } catch (error) {
      console.error("Google Sign-In error:", error);
      
      let errorMessage = "Google Sign-In failed. Please try again.";
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          showInfo("Sign-in was cancelled.", 3000);
          return; // Don't show error for user cancellation
        case 'auth/popup-blocked':
          errorMessage = "Pop-up was blocked. Please allow pop-ups and try again.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection and try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many requests. Please wait a moment and try again.";
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = "An account already exists with this email using a different sign-in method.";
          break;
        default:
          errorMessage = error.message || "Google Sign-In failed. Please try again.";
      }
      
      showError(errorMessage, 6000);
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Account lockout with notifications
  const handleAccountLockout = () => {
    setIsAccountLocked(true);
    setLockoutTimeRemaining(15 * 60);

    showError(
      "Too many failed login attempts. Your account has been temporarily locked for 15 minutes for security.",
      8000
    );

    const timer = setInterval(() => {
      setLockoutTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsAccountLocked(false);
          setLoginAttempts(0);
          clearInterval(timer);
          showInfo("Account lockout has been lifted. You can now try logging in again.", 5000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle existing email confirmation for sign up
  const handleExistingEmailConfirmation = () => {
    setShowConfirmModal(false);
    if (pendingEmailData) {
      // Switch to login mode or show login suggestion
      showInfo("Please use the login form to access your existing account.", 5000);
      setPendingEmailData(null);
    }
  };

  // Enhanced form submission with better validation and navigation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Clear any pending email validation timeouts
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showError("Please fix the errors in the form before submitting.", 4000);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        // Final check if email exists before attempting registration
        const emailCheck = await checkEmailExists(formData.email.toLowerCase().trim());
        
        if (emailCheck.exists) {
          if (emailCheck.isGoogleUser && !emailCheck.isEmailUser) {
            // NOW show toast notification since user is submitting
            showWarning(
              "This email is registered with Google. Please use 'Continue with Google' to sign in.",
              7000
            );
            setErrors({ 
              submit: "Email registered with Google. Please use Google Sign-In above." 
            });
            setIsLoading(false);
            return;
          } else {
            setPendingEmailData({ email: formData.email });
            setShowConfirmModal(true);
            setIsLoading(false);
            return;
          }
        }

        // Proceed with registration
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email.toLowerCase().trim(),
          formData.password
        );
        const user = userCredential.user;

        // Create user document
        const userData = {
          fullName: formData.fullName?.trim() || "",
          email: formData.email?.toLowerCase()?.trim() || "",
          phoneNumber: formData.phoneNumber?.trim() || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: "customer",
          provider: "email",
          twoFA: false,
          isEmailVerified: false,
          profileComplete: true,
          agreeToTerms: formData.agreeToTerms || false
        };

        const userRef = doc(firestore, "users", user.uid);
        await setDoc(userRef, userData);

        // Send email verification
        try {
          await sendEmailVerification(user);
          setEmailVerificationSent(true);
          showSuccess(
            `Account created successfully! Please check your email (${formData.email}) for verification link.`,
            8000
          );
        } catch (verificationError) {
          console.warn("Email verification failed:", verificationError.message);
          showWarning(
            "Account created successfully, but email verification failed. You can request verification later.",
            6000
          );
        }

        console.log("Account created:", formData.email);
        
        // Navigate to dashboard/welcome page after successful signup
        setTimeout(() => {
          navigate('/homePage'); // You can change this to '/welcome' or any other route
        }, 2000); // Delay to let user see the success message

      } else {
        // Login process
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email.toLowerCase().trim(), 
          formData.password
        );
        const user = userCredential.user;

        // Update last login
        const userRef = doc(firestore, "users", user.uid);
        await setDoc(userRef, { 
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        setLoginAttempts(0);
        showSuccess("Welcome back! You've been logged in successfully.", 4000);
        console.log("User logged in:", formData.email);
        
        // Navigate to dashboard immediately after successful login
        setTimeout(() => {
          navigate('/homePage'); // You can change this to '/home' or any other route
        }, 1000); // Small delay to show success message
      }

      // Reset form on success
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phoneNumber: "",
        agreeToTerms: false,
        recaptchaToken: null,
      });
      setErrors({});

    } catch (error) {
      console.error("Authentication error:", error);

      let errorMessage = "An error occurred. Please try again.";
      let toastDuration = 5000;

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered. Please try logging in instead.";
          showWarning(errorMessage, 6000);
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Please choose a stronger password with at least 6 characters.";
          showError(errorMessage, toastDuration);
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          showError(errorMessage, toastDuration);
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email. Please sign up first.";
          showError(errorMessage, 6000);
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Incorrect email or password. Please try again.";
          showError(errorMessage, toastDuration);
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled. Please contact support.";
          showError(errorMessage, 8000);
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please wait before trying again or reset your password.";
          showWarning(errorMessage, 8000);
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection and try again.";
          showError(errorMessage, toastDuration);
          break;
        case 'permission-denied':
          errorMessage = "Database access denied. Please contact support.";
          showError(errorMessage, 8000);
          break;
        default:
          errorMessage = error.message || "Authentication failed. Please try again.";
          showError(errorMessage, toastDuration);
      }

      // Handle login attempt tracking
      if (!isSignUp) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          handleAccountLockout();
        } else {
          const remainingAttempts = 5 - newAttempts;
          setErrors({ 
            submit: `${errorMessage} ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
          });
          
          if (remainingAttempts <= 2) {
            showWarning(
              `Only ${remainingAttempts} login attempt${remainingAttempts !== 1 ? 's' : ''} remaining before account lockout.`,
              6000
            );
          }
        }
      } else {
        setErrors({ submit: errorMessage });
      }

    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleInputChange,
    handleRecaptchaChange,
    handleGoogleSSO,
    handleSubmit,
    showConfirmModal,
    setShowConfirmModal,
    pendingEmailData,
    handleExistingEmailConfirmation,
    checkEmailExists
  };
}

export default UseAuthActions;