// hooks/UseAuthActions.js
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification,
  fetchSignInMethodsForEmail
} from "firebase/auth";

import { auth, firestore } from "../firebase";
import { useToast } from "../components/Authentication/Toast";
import { getNextAvailableCustomerId } from "../utils/generateSequentialCustomerId";
import { doc, setDoc, getDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";

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
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState(null);
  
  // Refs for debouncing
  const emailCheckTimeoutRef = useRef(null);
  const lastCheckedEmailRef = useRef("");

  // Check if user is admin and navigate accordingly
  const checkAdminAndNavigate = async (user, welcomeMessage = null, isNewUser = false) => {
    try {
      const adminRef = doc(firestore, "admin", user.uid);
      const adminSnap = await getDoc(adminRef);
      
      if (adminSnap.exists()) {
        console.log("Admin user detected:", user.email);
        if (welcomeMessage) {
          const adminMessage = isNewUser 
            ? `${welcomeMessage} (Admin Access)` 
            : `${welcomeMessage} (Admin Access)`;
          showSuccess(adminMessage, 4000);
        }
        setTimeout(() => navigate('/adminDashboard'), 1500);
      } else {
        console.log("Regular customer:", user.email);
        if (welcomeMessage) {
          showSuccess(welcomeMessage, 4000);
        }
        setTimeout(() => navigate('/homePage'), 1500);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      showWarning("Unable to verify admin status. Proceeding as regular customer.", 4000);
      setTimeout(() => navigate('/homePage'), 1500);
    }
  };

  // Check if email is already registered in Firebase Auth
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

  // Find existing customer by Firebase UID (primary method)
  const findCustomerByFirebaseUid = async (firebaseUid) => {
    try {
      console.log("Searching for customer with Firebase UID:", firebaseUid);
      
      const customersRef = collection(firestore, "customers");
      const q = query(customersRef, where("firebaseUid", "==", firebaseUid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const customerDoc = querySnapshot.docs[0];
        const customerData = { id: customerDoc.id, ...customerDoc.data() };
        console.log("Found existing customer:", customerDoc.id);
        return customerData;
      }
      
      console.log("No customer found with Firebase UID");
      return null;
    } catch (error) {
      console.error("Error finding customer:", error);
      return null;
    }
  };

  // Create new customer document
  const createCustomerDocument = async (user, additionalData = {}) => {
    try {
      const customId = await getNextAvailableCustomerId();
      console.log("Generated custom customer ID:", customId);

      const customerData = {
        firebaseUid: user.uid,
        fullName: additionalData.fullName || user.displayName || "",
        email: user.email.toLowerCase(),
        phoneNumber: additionalData.phoneNumber || user.phoneNumber || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        provider: additionalData.provider || "email",
        role: "customer",
        twoFA: false,
        isEmailVerified: user.emailVerified || false,
        profileComplete: Boolean(additionalData.fullName),
        agreeToTerms: additionalData.agreeToTerms || false
      };

      const customerRef = doc(firestore, "customers", customId);
      await setDoc(customerRef, customerData);
      
      console.log("Created new customer document:", customId);
      return { id: customId, ...customerData };
    } catch (error) {
      console.error("Error creating customer document:", error);
      throw new Error("Failed to create customer profile");
    }
  };

  // Update customer last login
  const updateCustomerLogin = async (customerId) => {
    try {
      const customerRef = doc(firestore, "customers", customerId);
      await setDoc(customerRef, { 
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating customer login:", error);
    }
  };

  // Improved email validation
  const isEmailLikelyComplete = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email) && email.length >= 8;
  };

  // Debounced email validation
  const debouncedEmailCheck = useCallback(async (email) => {
    if (email === lastCheckedEmailRef.current) return;
    
    lastCheckedEmailRef.current = email;
    
    const emailCheck = await checkEmailExists(email);
    
    if (email === formData.email.toLowerCase().trim()) {
      if (emailCheck.exists) {
        if (emailCheck.isGoogleUser && !emailCheck.isEmailUser) {
          setErrors(prev => ({ 
            ...prev, 
            email: "Email registered with Google. Use Google Sign-In." 
          }));
        } else if (isSignUp) {
          setErrors(prev => ({ 
            ...prev, 
            email: "Email already exists. Try logging in." 
          }));
        }
      } else {
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
  }, [formData.email, setErrors, isSignUp]);

  // Input handling
  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: inputValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Debounced email validation
    if (name === "email") {
      const trimmedEmail = value.toLowerCase().trim();
      
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }

      if (isEmailLikelyComplete(trimmedEmail)) {
        emailCheckTimeoutRef.current = setTimeout(() => {
          debouncedEmailCheck(trimmedEmail);
        }, 2000);
      } else {
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

  // Google SSO - FIXED to prevent duplicates
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

      console.log("Google SSO - User authenticated:", user.email);

      // Check if customer already exists
      let existingCustomer = await findCustomerByFirebaseUid(user.uid);

      if (!existingCustomer) {
        // Create new customer
        console.log("Creating new Google customer...");
        existingCustomer = await createCustomerDocument(user, { 
          provider: "google" 
        });
        
        const welcomeMessage = `Welcome ${user.displayName || 'User'}! Your customer ID is ${existingCustomer.id}.`;
        await checkAdminAndNavigate(user, welcomeMessage, true);
      } else {
        // Update existing customer login
        console.log("Existing Google customer found:", existingCustomer.id);
        await updateCustomerLogin(existingCustomer.id);
        
        const welcomeBackMessage = `Welcome back ${user.displayName || 'User'}!`;
        await checkAdminAndNavigate(user, welcomeBackMessage, false);
      }

    } catch (error) {
      console.error("Google Sign-In error:", error);
      
      let errorMessage = "Google Sign-In failed. Please try again.";
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          showInfo("Sign-in was cancelled.", 3000);
          return;
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

  // Account lockout handling
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

  // Handle existing email confirmation
  const handleExistingEmailConfirmation = () => {
    setShowConfirmModal(false);
    if (pendingEmailData) {
      showInfo("Please use the login form to access your existing account.", 5000);
      setPendingEmailData(null);
    }
  };

  // Main form submission - COMPLETELY REWRITTEN to prevent duplicates
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }
    
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
        // *** SIGN UP PROCESS ***
        const emailCheck = await checkEmailExists(formData.email.toLowerCase().trim());
        
        if (emailCheck.exists) {
          if (emailCheck.isGoogleUser && !emailCheck.isEmailUser) {
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

        console.log("Creating new email/password user...");

        // Create Firebase auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email.toLowerCase().trim(),
          formData.password
        );
        const user = userCredential.user;

        // Check one more time if customer exists (race condition protection)
        let existingCustomer = await findCustomerByFirebaseUid(user.uid);
        
        if (existingCustomer) {
          console.log("Customer already exists! Using existing customer:", existingCustomer.id);
          await updateCustomerLogin(existingCustomer.id);
          
          const welcomeBackMessage = `Welcome back ${existingCustomer.fullName || 'User'}! (Customer ID: ${existingCustomer.id})`;
          await checkAdminAndNavigate(user, welcomeBackMessage, false);
        } else {
          // Safe to create new customer
          const newCustomer = await createCustomerDocument(user, {
            fullName: formData.fullName?.trim() || "",
            phoneNumber: formData.phoneNumber?.trim() || "",
            agreeToTerms: formData.agreeToTerms || false,
            provider: "email"
          });

          try {
            await sendEmailVerification(user);
            setEmailVerificationSent(true);
            
            console.log("New email customer created:", newCustomer.id);
            
            const welcomeMessage = `Welcome ${formData.fullName || 'User'}! Your customer ID is ${newCustomer.id}. Please check your email for verification.`;
            await checkAdminAndNavigate(user, welcomeMessage, true);
            
          } catch (verificationError) {
            console.warn("Email verification failed:", verificationError.message);
            
            const welcomeMessage = `Welcome ${formData.fullName || 'User'}! Your customer ID is ${newCustomer.id}. Email verification failed but you can request it later.`;
            await checkAdminAndNavigate(user, welcomeMessage, true);
          }
        }

      } else {
        // *** SIGN IN PROCESS ***
        const emailCheck = await checkEmailExists(formData.email.toLowerCase().trim());
        
        if (emailCheck.exists && emailCheck.isGoogleUser && !emailCheck.isEmailUser) {
          showWarning(
            "This email was registered with Google. Please use 'Continue with Google' to sign in.",
            7000
          );
          setErrors({ 
            submit: "This account uses Google Sign-In. Please use the 'Continue with Google' button above." 
          });
          setIsLoading(false);
          return;
        }

        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email.toLowerCase().trim(), 
          formData.password
        );
        const user = userCredential.user;

        // Find existing customer
        const existingCustomer = await findCustomerByFirebaseUid(user.uid);
        
        if (existingCustomer) {
          await updateCustomerLogin(existingCustomer.id);
          setLoginAttempts(0);
          console.log("Customer signed in:", existingCustomer.id);
          
          const welcomeBackMessage = `Welcome back ${existingCustomer.fullName || 'User'}! (Customer ID: ${existingCustomer.id})`;
          await checkAdminAndNavigate(user, welcomeBackMessage, false);
        } else {
          showError("Customer profile not found. Please contact support.", 6000);
          setIsLoading(false);
          return;
        }
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

      if (error.message && error.message.includes("Failed to")) {
        errorMessage = error.message;
        showError(errorMessage, 6000);
        setErrors({ submit: errorMessage });
        setIsLoading(false);
        return;
      }

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
          errorMessage = "No account found with this email. Please sign up first or use Google Sign-In if you registered with Google.";
          showError(errorMessage, 6000);
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Incorrect email or password. Please try again or use Google Sign-In if you registered with Google.";
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

  // Cleanup
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