import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../firebase";

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
  // Input handling
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: inputValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRecaptchaChange = (token) => {
    setFormData((prev) => ({ ...prev, recaptchaToken: token }));
    if (errors.recaptcha) {
      setErrors((prev) => ({ ...prev, recaptcha: "" }));
    }
  };

  // Google SSO with better error handling
  const handleGoogleSSO = async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        // Create new user document
        const userData = {
          fullName: user.displayName || "",
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          createdAt: serverTimestamp(), // Use server timestamp
          updatedAt: serverTimestamp(),
          provider: "google",
          role: "customer",
          twoFA: false,
          isEmailVerified: user.emailVerified || false,
          profileComplete: false
        };

        await setDoc(userRef, userData);
        console.log("New Google user profile created:", user.email);
      } else {
        // Update last login time for existing user
        await setDoc(userRef, { 
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log("Existing Google user logged in:", user.email);
      }

    } catch (error) {
      console.error("Google Sign-In error:", error);
      
      // Handle specific Firebase auth errors
      let errorMessage = "Google Sign-In failed. Please try again.";
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in was cancelled. Please try again.";
          break;
        case 'auth/popup-blocked':
          errorMessage = "Pop-up was blocked. Please allow pop-ups and try again.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection and try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many requests. Please wait a moment and try again.";
          break;
        default:
          errorMessage = error.message || "Google Sign-In failed. Please try again.";
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Account lockout logic
  const handleAccountLockout = () => {
    setIsAccountLocked(true);
    setLockoutTimeRemaining(15 * 60); // 15 minutes

    const timer = setInterval(() => {
      setLockoutTimeRemaining((prev) => {
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

  // Manual SignUp / Login with improved error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent multiple submissions
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      if (isSignUp) {
        // 1️⃣ Create user account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        // 2️⃣ Create user document in Firestore
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

        // 3️⃣ Send email verification
        try {
          await sendEmailVerification(user);
          setEmailVerificationSent(true);
          console.log("Email verification sent to:", formData.email);
        } catch (verificationError) {
          console.warn("Email verification failed:", verificationError.message);
          // Don't fail the entire registration for this
        }

        console.log("Account created and saved to Firestore:", formData.email);

      } else {
        // Login
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        const user = userCredential.user;

        // Update last login time
        const userRef = doc(firestore, "users", user.uid);
        await setDoc(userRef, { 
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        setLoginAttempts(0);
        console.log("User logged in:", formData.email);
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

      // Handle Firebase Auth errors
      let errorMessage = "An error occurred. Please try again.";

      switch (error.code) {
        // Sign up errors
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered. Try logging in instead.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Please choose a stronger password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        
        // Login errors
        case 'auth/user-not-found':
          errorMessage = "No account found with this email. Please sign up first.";
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Incorrect email or password. Please try again.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled. Please contact support.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please wait before trying again.";
          break;
        
        // Network/general errors
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection and try again.";
          break;
        case 'permission-denied':
          errorMessage = "Database access denied. Please check your Firestore security rules.";
          break;
        
        default:
          errorMessage = error.message || "Authentication failed. Please try again.";
      }

      // Handle login attempt tracking for login mode
      if (!isSignUp) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          handleAccountLockout();
          setErrors({ submit: "Too many failed attempts. Account temporarily locked for 15 minutes." });
        } else {
          setErrors({ 
            submit: `${errorMessage} ${5 - newAttempts} attempts remaining.` 
          });
        }
      } else {
        setErrors({ submit: errorMessage });
      }

    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleInputChange,
    handleRecaptchaChange,
    handleGoogleSSO,
    handleSubmit,
  };
}

export default UseAuthActions;