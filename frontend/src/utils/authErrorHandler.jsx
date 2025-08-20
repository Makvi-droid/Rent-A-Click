// utils/authErrorHandler.js
export const getAuthErrorMessage = (errorCode, isSignUp = false) => {
  const errorMessages = {
    // Sign up errors
    'auth/email-already-in-use': "This email is already registered. Try logging in instead.",
    'auth/weak-password': "Password is too weak. Please choose a stronger password.",
    'auth/invalid-email': "Please enter a valid email address.",
    
    // Login errors
    'auth/user-not-found': "No account found with this email. Please sign up first.",
    'auth/wrong-password': "Incorrect email or password. Please try again.",
    'auth/invalid-credential': "Incorrect email or password. Please try again.",
    'auth/user-disabled': "This account has been disabled. Please contact support.",
    'auth/too-many-requests': "Too many failed attempts. Please wait before trying again.",
    
    // Google SSO errors
    'auth/popup-closed-by-user': "Sign-in was cancelled. Please try again.",
    'auth/popup-blocked': "Pop-up was blocked. Please allow pop-ups and try again.",
    
    // Network/general errors
    'auth/network-request-failed': "Network error. Please check your connection and try again.",
    'permission-denied': "Database access denied. Please check your Firestore security rules.",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again.";
};

export const getGoogleAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return "Sign-in was cancelled. Please try again.";
    case 'auth/popup-blocked':
      return "Pop-up was blocked. Please allow pop-ups and try again.";
    case 'auth/network-request-failed':
      return "Network error. Please check your connection and try again.";
    case 'auth/too-many-requests':
      return "Too many requests. Please wait a moment and try again.";
    default:
      return "Google Sign-In failed. Please try again.";
  }
};