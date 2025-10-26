// components/Authentication/NotificationBar.jsx
import React from "react";
import { AlertCircle, CheckCircle, Clock, KeyRound } from "lucide-react";

export default function NotificationBar({
  isAccountLocked,
  lockoutTimeRemaining,
  emailVerificationSent,
  isSignUp,
  onResetPassword, // NEW: Callback for reset password
}) {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Account locked notification
  if (isAccountLocked && lockoutTimeRemaining > 0) {
    return (
      <div className="mb-6 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 animate-pulse">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 font-semibold text-sm mb-1">
              Account Temporarily Locked
            </p>
            <p className="text-red-300 text-xs mb-3">
              Too many failed login attempts. Your account has been locked for
              security.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-red-300" />
                <span className="text-red-300 text-xs font-mono">
                  Time remaining: {formatTime(lockoutTimeRemaining)}
                </span>
              </div>
              {/* NEW: Reset Password Button */}
              {onResetPassword && (
                <button
                  onClick={onResetPassword}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-all duration-200"
                >
                  <KeyRound className="w-4 h-4" />
                  Reset Password
                </button>
              )}
            </div>
            <p className="text-red-300/70 text-xs mt-2">
              Or reset your password to unlock your account immediately.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
