// components/Authentication/TwoFactorModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Shield, RefreshCw } from "lucide-react";

const TwoFactorModal = ({
  isOpen,
  onClose,
  onSubmit,
  onResend,
  twoFactorCode,
  setTwoFactorCode,
  error,
  isLoading,
  resendCooldown,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  // Convert code string to array for individual inputs
  const codeArray = twoFactorCode.padEnd(6, "").split("").slice(0, 6);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCodeArray = [...codeArray];
    newCodeArray[index] = value;

    // Update the full code string
    const newCode = newCodeArray.join("").replace(/\s/g, "");
    setTwoFactorCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeArray[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (twoFactorCode.length === 6) {
        onSubmit();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      setTwoFactorCode(digits);
      // Focus the next empty input or the last one
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (twoFactorCode.length === 6 && !isLoading) {
      onSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-300 text-sm">
            Enter the 6-digit verification code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Input Fields */}
          <div className="flex justify-center gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={codeArray[index] || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={() => setFocusedIndex(index)}
                className={`w-12 h-12 text-center text-xl font-bold bg-white/10 border rounded-lg transition-all duration-200 ${
                  focusedIndex === index
                    ? "border-blue-400 ring-2 ring-blue-400/20"
                    : "border-white/20"
                } ${
                  codeArray[index] ? "text-white" : "text-gray-400"
                } focus:outline-none disabled:opacity-50`}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={twoFactorCode.length !== 6 || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </button>

          {/* Resend Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={onResend}
              disabled={resendCooldown > 0 || isLoading}
              className="text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  resendCooldown > 0 ? "animate-spin" : ""
                }`}
              />
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Code"}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-gray-400 text-xs text-center">
            Didn't receive the code? Check your spam folder or click resend
            above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorModal;
