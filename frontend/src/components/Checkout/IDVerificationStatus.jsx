// IDVerificationStatus.jsx - Component to show verification status and errors
import React from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

const IDVerificationStatus = ({ isSubmitted, hasError, errorMessage }) => {
  if (isSubmitted) {
    return (
      <div className="space-y-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
            <div>
              <span className="text-green-400 font-medium text-sm block">
                ID verification submitted successfully!
              </span>
              <span className="text-green-300/80 text-xs">
                Your submission has been received and will be processed shortly.
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
            Please bring your <strong>physical ID</strong> (the same one you submitted) when you pick up or receive your equipment. 
            This is required for verification and equipment handover.
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <XCircle className="text-red-400 flex-shrink-0" size={20} />
          <div>
            <span className="text-red-400 font-medium text-sm block">
              ID Verification Required
            </span>
            <span className="text-red-300/80 text-xs">
              {errorMessage || 'Please complete ID verification to proceed with your rental.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default state - not submitted, no error yet
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <AlertCircle className="text-amber-400 flex-shrink-0" size={20} />
        <div>
          <span className="text-amber-400 font-medium text-sm block">
            ID verification pending
          </span>
          <span className="text-amber-300/80 text-xs">
            Please submit your ID verification to continue with your rental.
          </span>
        </div>
      </div>
    </div>
  );
};

export default IDVerificationStatus;