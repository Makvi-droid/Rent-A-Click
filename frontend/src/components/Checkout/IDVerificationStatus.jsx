// IDVerificationStatus.jsx - FIXED: Only shows success confirmation, no pending or error states
import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

const IDVerificationStatus = ({ isSubmitted, hasError, errorMessage }) => {
  // Only show status if submitted successfully
  if (isSubmitted) {
    return (
      <div className="space-y-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
            <div>
              <span className="text-green-400 font-medium text-sm block">
                ✅ ID verification submitted successfully!
              </span>
              <span className="text-green-300/80 text-xs">
                Your submission has been received. You can now proceed with your
                rental.
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium text-sm mb-2 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>Important Reminder:</span>
          </h4>
          <p className="text-blue-200/80 text-sm">
            Please bring your <strong>physical ID</strong> (the same one you
            submitted) when you pick up or receive your equipment. This is
            required for verification and equipment handover.
          </p>
        </div>
      </div>
    );
  }

  // FIXED: Don't show error or pending states
  // The submission card with button is enough - validation errors will show when user tries to proceed
  return null;
};

export default IDVerificationStatus;
