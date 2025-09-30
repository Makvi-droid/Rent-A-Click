// hooks/UseAuthActions.js - Updated for Google 2FA integration
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

import { auth, firestore } from "../firebase";
import { useToast } from "../components/Authentication/Toast";
import { getNextAvailableCustomerId } from "../utils/generateSequentialCustomerId";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";

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
  setIsLoading,
}) {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState(null);

  // Keep 2FA related state only for email/password users
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pending2FAUser, setPending2FAUser] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Refs for debouncing
  const emailCheckTimeoutRef = useRef(null);
  const lastCheckedEmailRef = useRef("");

  // Generate and send 2FA code (only for email/password users)
  const generateAndSend2FACode = async (user, customerData) => {
    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store in Firestore temporarily
      const verificationRef = doc(firestore, "temp_2fa_codes", user.uid);
      await setDoc(verificationRef, {
        code: code,
        expiresAt: expiresAt,
        email: user.email,
        attempts: 0,
        maxAttempts: 3,
        createdAt: serverTimestamp(),
      });

      // In a real app, you'd send this via email service (SendGrid, etc.)
      console.log(`2FA Code for ${user.email}: ${code}`);

      // Show in development (remove in production)
      if (process.env.NODE_ENV === "development") {
        showInfo(`Development Mode - 2FA Code: ${code}`, 15000);
      }

      return true;
    } catch (error) {
      console.error("Error generating 2FA code:", error);
      showError("Failed to send 2FA code. Please try again.", 5000);
      return false;
    }
  };

  // Verify 2FA code (only for email/password users)
  const verify2FACode = async (user, inputCode) => {
    try {
      const verificationRef = doc(firestore, "temp_2fa_codes", user.uid);
      const verificationDoc = await getDoc(verificationRef);

      if (!verificationDoc.exists()) {
        setTwoFactorError(
          "Verification code expired. Please request a new one."
        );
        return false;
      }

      const verificationData = verificationDoc.data();
      const now = new Date();
      const expiresAt = verificationData.expiresAt.toDate();

      // Check if code expired
      if (now > expiresAt) {
        setTwoFactorError(
          "Verification code expired. Please request a new one."
        );
        await verificationRef.delete();
        return false;
      }

      // Check attempts
      if (verificationData.attempts >= verificationData.maxAttempts) {
        setTwoFactorError(
          "Too many failed attempts. Please request a new code."
        );
        await verificationRef.delete();
        return false;
      }

      // Verify code
      if (inputCode !== verificationData.code) {
        await setDoc(verificationRef, {
          ...verificationData,
          attempts: verificationData.attempts + 1,
        });

        const remainingAttempts =
          verificationData.maxAttempts - (verificationData.attempts + 1);
        setTwoFactorError(
          `Invalid code. ${remainingAttempts} attempts remaining.`
        );
        return false;
      }

      // Code is valid - clean up
      await verificationRef.delete();
      return true;
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      setTwoFactorError("Failed to verify code. Please try again.");
      return false;
    }
  };

  // Handle 2FA code submission (only for email/password users)
  const handle2FASubmit = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError("Please enter a 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setTwoFactorError("");

    try {
      const isValid = await verify2FACode(pending2FAUser.user, twoFactorCode);

      if (isValid) {
        setShow2FAModal(false);
        setTwoFactorCode("");
        setPending2FAUser(null);

        showSuccess("2FA verification successful!", 3000);
        await completeLoginProcess(
          pending2FAUser.user,
          pending2FAUser.customerData,
          pending2FAUser.isNewUser
        );
      }
    } catch (error) {
      console.error("2FA verification error:", error);
      setTwoFactorError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend 2FA code (only for email/password users)
  const resend2FACode = async () => {
    if (resendCooldown > 0) return;

    try {
      const success = await generateAndSend2FACode(
        pending2FAUser.user,
        pending2FAUser.customerData
      );
      if (success) {
        showInfo("New verification code sent!", 3000);
        setResendCooldown(60);

        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error resending 2FA code:", error);
      showError("Failed to resend code. Please try again.", 3000);
    }
  };

  // Complete login process
  const completeLoginProcess = async (user, customerData, isNewUser) => {
    try {
      await updateCustomerLogin(customerData.id);
      setLoginAttempts(0);

      const welcomeMessage = isNewUser
        ? `Welcome ${
            customerData.fullName || user.displayName || "User"
          }! Your customer ID is ${customerData.id}.`
        : `Welcome back ${
            customerData.fullName || user.displayName || "User"
          }!`;

      await checkAdminAndNavigate(user, welcomeMessage, isNewUser);
    } catch (error) {
      console.error("Error completing login:", error);
      showError("Login completion failed. Please try again.", 5000);
    }
  };

  // UPDATED: Handle post authentication - only use custom 2FA for email/password users
  const handlePostAuthentication = async (
    user,
    customerData,
    isNewUser = false,
    provider = "email"
  ) => {
    try {
      console.log("=== POST AUTHENTICATION DEBUG ===");
      console.log("User email:", user.email);
      console.log("Customer ID:", customerData.id);
      console.log("Provider:", provider);
      console.log("Customer 2FA setting:", customerData.twoFA);
      console.log("Is new user:", isNewUser);
      console.log("================================");

      // For Google users, skip custom 2FA - Google handles their own 2FA
      if (provider === "google") {
        console.log(
          "✅ Google user - using Google's native 2FA, skipping custom 2FA"
        );
        showInfo(
          "Google authentication successful! Google's security features are active.",
          4000
        );
        await completeLoginProcess(user, customerData, isNewUser);
        return;
      }

      // Only check custom 2FA for email/password users
      if (customerData.twoFA && provider === "email") {
        console.log(
          "🔐 Custom 2FA required for email/password user:",
          user.email
        );

        const codeGenerated = await generateAndSend2FACode(user, customerData);

        if (codeGenerated) {
          setPending2FAUser({ user, customerData, isNewUser });
          setShow2FAModal(true);
          setTwoFactorCode("");
          setTwoFactorError("");

          console.log("🔐 2FA modal should now be showing");
          showInfo("Please check your email for the verification code.", 5000);
        } else {
          throw new Error("Failed to generate 2FA code");
        }
      } else {
        // No custom 2FA required - proceed directly
        console.log("✅ No custom 2FA required for user:", user.email);
        await completeLoginProcess(user, customerData, isNewUser);
      }
    } catch (error) {
      console.error("Post-authentication error:", error);
      showError("Authentication process failed. Please try again.", 5000);
    }
  };

  // Check if user is admin and navigate accordingly
  const checkAdminAndNavigate = async (
    user,
    welcomeMessage = null,
    isNewUser = false
  ) => {
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
        setTimeout(() => navigate("/adminDashboard"), 1500);
      } else {
        console.log("Regular customer:", user.email);
        if (welcomeMessage) {
          showSuccess(welcomeMessage, 4000);
        }
        setTimeout(() => navigate("/homePage"), 1500);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      showWarning(
        "Unable to verify admin status. Proceeding as regular customer.",
        4000
      );
      setTimeout(() => navigate("/homePage"), 1500);
    }
  };

  // Check if email is already registered in Firebase Auth
  const checkEmailExists = async (email) => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return {
        exists: signInMethods.length > 0,
        methods: signInMethods,
        isGoogleUser: signInMethods.includes("google.com"),
        isEmailUser: signInMethods.includes("password"),
      };
    } catch (error) {
      console.error("Error checking email:", error);
      return {
        exists: false,
        methods: [],
        isGoogleUser: false,
        isEmailUser: false,
      };
    }
  };

  // Find existing customer by Firebase UID
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
        // Only enable custom 2FA for email/password users by default
        twoFA:
          additionalData.provider === "email"
            ? additionalData.twoFA || false
            : false,
        isEmailVerified: user.emailVerified || false,
        profileComplete: Boolean(additionalData.fullName),
        agreeToTerms: additionalData.agreeToTerms || false,
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
      await setDoc(
        customerRef,
        {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
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
  const debouncedEmailCheck = useCallback(
    async (email) => {
      if (email === lastCheckedEmailRef.current) return;

      lastCheckedEmailRef.current = email;
      const emailCheck = await checkEmailExists(email);

      if (email === formData.email.toLowerCase().trim()) {
        if (emailCheck.exists) {
          if (emailCheck.isGoogleUser && !emailCheck.isEmailUser) {
            setErrors((prev) => ({
              ...prev,
              email: "Email registered with Google. Use Google Sign-In.",
            }));
          } else if (isSignUp) {
            setErrors((prev) => ({
              ...prev,
              email: "Email already exists. Try logging in.",
            }));
          }
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (
              newErrors.email &&
              (newErrors.email.includes("already exists") ||
                newErrors.email.includes("registered with Google"))
            ) {
              delete newErrors.email;
            }
            return newErrors;
          });
        }
      }
    },
    [formData.email, setErrors, isSignUp]
  );

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
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (
            newErrors.email &&
            (newErrors.email.includes("already exists") ||
              newErrors.email.includes("registered with Google"))
          ) {
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

  // UPDATED: Google SSO - relies on Google's native 2FA
  const handleGoogleSSO = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to ensure user can choose account with 2FA if needed
      provider.setCustomParameters({
        prompt: "select_account",
        // You can also add hd parameter for G Suite domains if needed
        // hd: "yourdomain.com"
      });

      console.log("Starting Google SSO flow...");

      // Google handles their own 2FA during this step
      // If user has 2FA enabled on Google, they'll be prompted before this resolves
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google SSO - User authenticated:", user.email);
      console.log(
        "Google 2FA (if enabled) was handled by Google during sign-in"
      );

      // Check for existing customer
      let existingCustomer = await findCustomerByFirebaseUid(user.uid);

      if (!existingCustomer) {
        console.log("Creating new Google customer...");
        existingCustomer = await createCustomerDocument(user, {
          provider: "google",
          twoFA: false, // Google users don't use our custom 2FA
        });

        console.log("New Google customer created:", existingCustomer.id);
        await handlePostAuthentication(user, existingCustomer, true, "google");
      } else {
        console.log("Existing Google customer found:", existingCustomer.id);
        // Pass "google" as provider to skip custom 2FA
        await handlePostAuthentication(user, existingCustomer, false, "google");
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);

      let errorMessage = "Google Sign-In failed. Please try again.";

      switch (error.code) {
        case "auth/popup-closed-by-user":
          showInfo("Sign-in was cancelled.", 3000);
          return;
        case "auth/popup-blocked":
          errorMessage =
            "Pop-up was blocked. Please allow pop-ups and try again.";
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your connection and try again.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many requests. Please wait a moment and try again.";
          break;
        case "auth/account-exists-with-different-credential":
          errorMessage =
            "An account already exists with this email using a different sign-in method.";
          break;
        default:
          errorMessage =
            error.message || "Google Sign-In failed. Please try again.";
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
          showInfo(
            "Account lockout has been lifted. You can now try logging in again.",
            5000
          );
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
      showInfo(
        "Please use the login form to access your existing account.",
        5000
      );
      setPendingEmailData(null);
    }
  };

  // UPDATED: Main form submission - specify provider
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
        const emailCheck = await checkEmailExists(
          formData.email.toLowerCase().trim()
        );

        if (emailCheck.exists) {
          if (emailCheck.isGoogleUser && !emailCheck.isEmailUser) {
            showWarning(
              "This email is registered with Google. Please use 'Continue with Google' to sign in.",
              7000
            );
            setErrors({
              submit:
                "Email registered with Google. Please use Google Sign-In above.",
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

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email.toLowerCase().trim(),
          formData.password
        );
        const user = userCredential.user;

        let existingCustomer = await findCustomerByFirebaseUid(user.uid);

        if (existingCustomer) {
          console.log(
            "Customer already exists! Using existing customer:",
            existingCustomer.id
          );
          await handlePostAuthentication(
            user,
            existingCustomer,
            false,
            "email"
          );
        } else {
          const newCustomer = await createCustomerDocument(user, {
            fullName: formData.fullName?.trim() || "",
            phoneNumber: formData.phoneNumber?.trim() || "",
            agreeToTerms: formData.agreeToTerms || false,
            provider: "email",
            twoFA: false, // New email accounts start with 2FA disabled
          });

          try {
            await sendEmailVerification(user);
            setEmailVerificationSent(true);

            console.log("New email customer created:", newCustomer.id);
            await handlePostAuthentication(user, newCustomer, true, "email");
          } catch (verificationError) {
            console.warn(
              "Email verification failed:",
              verificationError.message
            );
            await handlePostAuthentication(user, newCustomer, true, "email");
          }
        }
      } else {
        // *** SIGN IN PROCESS ***
        const emailCheck = await checkEmailExists(
          formData.email.toLowerCase().trim()
        );

        if (
          emailCheck.exists &&
          emailCheck.isGoogleUser &&
          !emailCheck.isEmailUser
        ) {
          showWarning(
            "This email was registered with Google. Please use 'Continue with Google' to sign in.",
            7000
          );
          setErrors({
            submit:
              "This account uses Google Sign-In. Please use the 'Continue with Google' button above.",
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

        const existingCustomer = await findCustomerByFirebaseUid(user.uid);

        if (existingCustomer) {
          setLoginAttempts(0);
          console.log("Customer signed in:", existingCustomer.id);

          // Handle custom 2FA for email/password users
          await handlePostAuthentication(
            user,
            existingCustomer,
            false,
            "email"
          );
        } else {
          showError(
            "Customer profile not found. Please contact support.",
            6000
          );
          setIsLoading(false);
          return;
        }
      }

      // Reset form on success (only if not waiting for 2FA)
      if (!show2FAModal) {
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
      }
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
        case "auth/email-already-in-use":
          errorMessage =
            "This email is already registered. Please try logging in instead.";
          showWarning(errorMessage, 6000);
          break;
        case "auth/weak-password":
          errorMessage =
            "Password is too weak. Please choose a stronger password with at least 6 characters.";
          showError(errorMessage, toastDuration);
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          showError(errorMessage, toastDuration);
          break;
        case "auth/user-not-found":
          errorMessage =
            "No account found with this email. Please sign up first or use Google Sign-In if you registered with Google.";
          showError(errorMessage, 6000);
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage =
            "Incorrect email or password. Please try again or use Google Sign-In if you registered with Google.";
          showError(errorMessage, toastDuration);
          break;
        case "auth/user-disabled":
          errorMessage =
            "This account has been disabled. Please contact support.";
          showError(errorMessage, 8000);
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many failed attempts. Please wait before trying again or reset your password.";
          showWarning(errorMessage, 8000);
          break;
        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your connection and try again.";
          showError(errorMessage, toastDuration);
          break;
        case "permission-denied":
          errorMessage = "Database access denied. Please contact support.";
          showError(errorMessage, 8000);
          break;
        default:
          errorMessage =
            error.message || "Authentication failed. Please try again.";
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
            submit: `${errorMessage} ${remainingAttempts} attempt${
              remainingAttempts !== 1 ? "s" : ""
            } remaining.`,
          });

          if (remainingAttempts <= 2) {
            showWarning(
              `Only ${remainingAttempts} login attempt${
                remainingAttempts !== 1 ? "s" : ""
              } remaining before account lockout.`,
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
    checkEmailExists,
    // 2FA related returns (only for email/password users)
    show2FAModal,
    setShow2FAModal,
    twoFactorCode,
    setTwoFactorCode,
    twoFactorError,
    setTwoFactorError,
    handle2FASubmit,
    resend2FACode,
    resendCooldown,
  };
}

export default UseAuthActions;
