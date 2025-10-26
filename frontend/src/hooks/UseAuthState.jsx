import { useState, useEffect, useRef } from "react";

export default function UseAuthState() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    agreeToTerms: false,
    recaptchaToken: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const lockoutTimerRef = useRef(null);

  // In UseAuthState.jsx, replace the useEffect lockout check with this:

  useEffect(() => {
    const checkExistingLockout = () => {
      try {
        const lockoutData = localStorage.getItem("account_lockout");

        if (lockoutData) {
          const { email, expiresAt, attempts } = JSON.parse(lockoutData);
          const now = Date.now();

          if (now < expiresAt) {
            // Lockout is still active
            const remainingSeconds = Math.ceil((expiresAt - now) / 1000);
            console.log(
              `🔒 Active lockout found for ${email}. ${remainingSeconds}s remaining`
            );

            setIsAccountLocked(true);
            setLockoutTimeRemaining(remainingSeconds);
            setLoginAttempts(attempts);

            // Start countdown timer
            startLockoutTimer(remainingSeconds);
          } else {
            // Lockout expired, clean up
            console.log("✅ Previous lockout expired, clearing");
            localStorage.removeItem("account_lockout");
            setIsAccountLocked(false);
            setLockoutTimeRemaining(0);
            setLoginAttempts(0);
          }
        } else {
          // No lockout data - ensure state is clear
          setIsAccountLocked(false);
          setLockoutTimeRemaining(0);
        }
      } catch (error) {
        console.error("Error checking lockout status:", error);
        localStorage.removeItem("account_lockout");
        setIsAccountLocked(false);
        setLockoutTimeRemaining(0);
        setLoginAttempts(0);
      }
    };

    checkExistingLockout();

    // Cleanup timer on unmount
    return () => {
      if (lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
      }
    };
  }, []); // Run only once on mount

  // 🔒 Start lockout countdown timer
  const startLockoutTimer = (seconds) => {
    // Clear any existing timer
    if (lockoutTimerRef.current) {
      clearInterval(lockoutTimerRef.current);
    }

    lockoutTimerRef.current = setInterval(() => {
      setLockoutTimeRemaining((prev) => {
        if (prev <= 1) {
          // Lockout ended
          clearInterval(lockoutTimerRef.current);
          lockoutTimerRef.current = null;
          setIsAccountLocked(false);
          setLoginAttempts(0);
          localStorage.removeItem("account_lockout");
          console.log("✅ Account lockout lifted");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🔒 Enhanced setLoginAttempts to persist lockout
  const enhancedSetLoginAttempts = (attemptsOrUpdater) => {
    setLoginAttempts((prev) => {
      const newAttempts =
        typeof attemptsOrUpdater === "function"
          ? attemptsOrUpdater(prev)
          : attemptsOrUpdater;

      // If we've hit 5 attempts, trigger lockout
      if (newAttempts >= 5 && !isAccountLocked) {
        const lockoutDuration = 15 * 60 * 1000; // 15 minutes in ms
        const expiresAt = Date.now() + lockoutDuration;

        const lockoutData = {
          email: formData.email || "unknown",
          attempts: newAttempts,
          expiresAt: expiresAt,
          lockedAt: Date.now(),
        };

        // Persist to localStorage
        localStorage.setItem("account_lockout", JSON.stringify(lockoutData));
        console.log(
          "🔒 Account locked, data saved to localStorage:",
          lockoutData
        );

        setIsAccountLocked(true);
        setLockoutTimeRemaining(15 * 60);
        startLockoutTimer(15 * 60);
      }

      return newAttempts;
    });
  };

  // 🔒 Enhanced setIsAccountLocked to handle manual lockout triggers
  const enhancedSetIsAccountLocked = (value) => {
    setIsAccountLocked(value);

    if (value === true && !isAccountLocked) {
      // Manual lockout trigger
      const lockoutDuration = 15 * 60 * 1000;
      const expiresAt = Date.now() + lockoutDuration;

      const lockoutData = {
        email: formData.email || "unknown",
        attempts: loginAttempts,
        expiresAt: expiresAt,
        lockedAt: Date.now(),
      };

      localStorage.setItem("account_lockout", JSON.stringify(lockoutData));
      console.log("🔒 Manual lockout triggered:", lockoutData);

      startLockoutTimer(15 * 60);
    } else if (value === false) {
      // Unlock
      if (lockoutTimerRef.current) {
        clearInterval(lockoutTimerRef.current);
        lockoutTimerRef.current = null;
      }
      localStorage.removeItem("account_lockout");
      console.log("✅ Account manually unlocked");
    }
  };

  const toggleMode = (mode) => {
    console.log("toggleMode called with:", mode, "current isSignUp:", isSignUp);

    if (typeof mode === "boolean") {
      setIsSignUp(mode);
    } else {
      setIsSignUp(!isSignUp);
    }

    // Reset form data and errors (but keep lockout state)
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
    // Don't reset loginAttempts or lockout state when switching modes
    setEmailVerificationSent(false);
  };

  return {
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
    setLoginAttempts: enhancedSetLoginAttempts, // 🔒 Use enhanced version
    setIsAccountLocked: enhancedSetIsAccountLocked, // 🔒 Use enhanced version
    setLockoutTimeRemaining,
    setEmailVerificationSent,
    setFormData,
    setErrors,
    setIsLoading,
    toggleMode,
  };
}
