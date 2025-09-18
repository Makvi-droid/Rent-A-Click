// hooks/useAuthActions.js
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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { useToast } from "../components/Authentication/Toast";
// Import the sequential ID generator
import { getNextAvailableUserId } from "../utils/generateSequentialUserId";

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

  // *** UPDATED: Function to check if user is admin and navigate accordingly ***
  const checkAdminAndNavigate = async (user, welcomeMessage = null) => {
    try {
      // Check if user document exists in admin collection
      const adminRef = doc(firestore, "admin", user.uid);
      const adminSnap = await getDoc(adminRef);
      
      if (adminSnap.exists()) {
        // User is admin - navigate to admin dashboard
        console.log("Admin user detected:", user.email);
        
        if (welcomeMessage) {
          showSuccess(welcomeMessage + " (Admin Access)", 4000);
        }
        
        setTimeout(() => {
          navigate('/adminDashboard');
        }, 1500);
      } else {
        // Regular customer - navigate to home page
        console.log("Regular customer:", user.email);
        
        if (welcomeMessage) {
          showSuccess(welcomeMessage, 4000);
        }
        
        setTimeout(() => {
          navigate('/homePage');
        }, 1500);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      // Fallback to regular user navigation if admin check fails
      showWarning("Unable to verify admin status. Proceeding as regular customer.", 4000);
      
      setTimeout(() => {
        navigate('/homePage');
      }, 1500);
    }
  };

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

  // *** NEW: Function to find customer by Firebase UID ***
  const findCustomerByFirebaseUid = async (firebaseUid) => {
    try {
      // We'll need to query the customers collection to find the document with matching firebaseUid
      // For now, we'll assume the document ID might be the custom ID
      // This might require a collection query if we need to search by firebaseUid field
      const customerRef = doc(firestore, "customers", firebaseUid);
      const customerSnap = await getDoc(customerRef);
      
      if (customerSnap.exists()) {
        return { id: customerSnap.id, ...customerSnap.data() };
      }
      
      return null;
    } catch (error) {
      console.error("Error finding customer:", error);
      return null;
    }
  };

  // Debounced email validation function
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

  // Input handling with improved debounced validation
  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: inputValue }));

    // Clear errors for this field immediately
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Debounced email validation for both login and signup
    if (name === "email") {
      const trimmedEmail = value.toLowerCase().trim();
      
      // Clear previous timeout
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

  // *** UPDATED: Enhanced Google SSO - saves to customers collection with custom ID ***
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

      // *** UPDATED: Check if customer document exists using Firebase UID ***
      let existingCustomer = await findCustomerByFirebaseUid(user.uid);

      if (!existingCustomer) {
        // *** UPDATED: Generate sequential ID for new Google customer ***
        console.log("Generating sequential ID for new Google customer...");
        const customId = await getNextAvailableUserId();
        console.log("Generated custom ID:", customId);
        
        // *** UPDATED: Create new customer document with custom ID as document ID ***
        const customerData = {
          firebaseUid: user.uid, // Store Firebase UID for reference
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

        // *** KEY CHANGE: Use custom ID as document ID ***
        const customerRef = doc(firestore, "customers", customId);
        await setDoc(customerRef, customerData);
        console.log("New Google customer profile created:", user.email, "with ID:", customId);
        
        // Check admin status and navigate accordingly
        await checkAdminAndNavigate(
          user, 
          `Welcome ${user.displayName || 'User'}! Your customer ID is ${customId}.`
        );
        
      } else {
        // *** UPDATED: Update existing customer document ***
        const customerRef = doc(firestore, "customers", existingCustomer.id);
        await setDoc(customerRef, { 
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log("Existing Google customer logged in:", user.email);
        
        // Display message with custom ID
        const displayMessage = `Welcome back ${user.displayName || 'User'}! (ID: ${existingCustomer.id})`;
        
        // Check admin status and navigate accordingly
        await checkAdminAndNavigate(user, displayMessage);
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

  // Handle existing email confirmation for sign up
  const handleExistingEmailConfirmation = () => {
    setShowConfirmModal(false);
    if (pendingEmailData) {
      showInfo("Please use the login form to access your existing account.", 5000);
      setPendingEmailData(null);
    }
  };

  // *** UPDATED: Enhanced form submission - saves to customers collection with custom ID ***
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

        // *** UPDATED: Generate sequential ID before creating user ***
        console.log("Generating sequential ID for new email customer...");
        const customId = await getNextAvailableUserId();
        console.log("Generated custom ID:", customId);

        // Proceed with email/password registration
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email.toLowerCase().trim(),
          formData.password
        );
        const user = userCredential.user;

        // *** UPDATED: Create customer document with custom ID as document ID ***
        const customerData = {
          firebaseUid: user.uid, // Store Firebase UID for reference
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

        // *** KEY CHANGE: Use custom ID as document ID in customers collection ***
        const customerRef = doc(firestore, "customers", customId);
        await setDoc(customerRef, customerData);

        // Send email verification
        try {
          await sendEmailVerification(user);
          setEmailVerificationSent(true);
          
          console.log("Customer account created:", formData.email, "with ID:", customId);
          
          // Check admin status and navigate accordingly
          await checkAdminAndNavigate(
            user,
            `Account created successfully! Your customer ID is ${customId}. Please check your email (${formData.email}) for verification.`
          );
          
        } catch (verificationError) {
          console.warn("Email verification failed:", verificationError.message);
          
          // Still check admin status even if verification fails
          await checkAdminAndNavigate(
            user,
            `Account created successfully! Your customer ID is ${customId}. Email verification failed but you can request it later.`
          );
        }

      } else {
        // *** UPDATED: Login process with customer lookup ***
        
        // Check if this email is a Google-only account before attempting email/password login
        const emailCheck = await checkEmailExists(formData.email.toLowerCase().trim());
        
        if (emailCheck.exists && emailCheck.isGoogleUser && !emailCheck.isEmailUser) {
          // This is a Google-only account, prevent email/password login
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

        // Proceed with email/password login (for email-registered accounts)
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email.toLowerCase().trim(), 
          formData.password
        );
        const user = userCredential.user;

        // *** UPDATED: Find and update customer document ***
        const existingCustomer = await findCustomerByFirebaseUid(user.uid);
        
        if (existingCustomer) {
          // Update last login in customer document
          const customerRef = doc(firestore, "customers", existingCustomer.id);
          await setDoc(customerRef, { 
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });

          setLoginAttempts(0);
          console.log("Customer logged in:", formData.email);
          
          // Display welcome message with customer ID
          const displayMessage = `Welcome back! (Customer ID: ${existingCustomer.id})`;
          
          // Check admin status and navigate accordingly
          await checkAdminAndNavigate(user, displayMessage);
        } else {
          // Customer document not found - this shouldn't happen for existing users
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

      // *** UPDATED: Handle sequential ID generation errors ***
      if (error.message && error.message.includes("Failed to generate unique user ID")) {
        errorMessage = "Unable to generate customer ID. Please try again in a moment.";
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