import React from "react";
import { Shield, CheckCircle } from "lucide-react";
import IDSubmissionCard from "./IDSubmissionCard";
import IDVerificationStatus from "./IDVerificationStatus";
import SavedIDOption from "./SavedIDOption";

const MandatoryIDVerification = ({
  formData,
  errors,
  onGoogleFormSubmission,
  setFormData,
  setErrors,
  savedIdUrl, // NEW: Pass saved ID URL from customer data
}) => {
  const hasSavedId = !!savedIdUrl;

  return (
    <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {formData.idSubmitted ? (
            <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="text-green-400" size={24} />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center animate-pulse">
              <Shield className="text-red-400" size={24} />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-white">
                ID Verification Required
              </h3>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 animate-pulse">
                MANDATORY
              </span>
              {formData.idSubmitted && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                  ✓ Verified
                </span>
              )}
            </div>

            <p className="text-gray-300 text-sm mb-4">
              <strong>All equipment rentals require ID verification.</strong>{" "}
              This security measure protects both our equipment and ensures a
              smooth rental experience.
            </p>
          </div>

          {/* ID Verification Status */}
          <IDVerificationStatus
            isSubmitted={formData.idSubmitted}
            hasError={!!errors.idSubmitted}
            errorMessage={errors.idSubmitted}
          />

          {/* Show saved ID option if available */}
          {!formData.idSubmitted && hasSavedId && (
            <SavedIDOption
              savedIdUrl={savedIdUrl}
              formData={formData}
              setFormData={setFormData}
              setErrors={setErrors}
            />
          )}

          {/* ID Submission Card - Only show if no saved ID or user chose to upload new */}
          {!formData.idSubmitted && (!hasSavedId || formData.uploadNewId) && (
            <IDSubmissionCard
              onSubmit={onGoogleFormSubmission}
              userEmail={formData.email}
              formData={formData}
              setFormData={setFormData}
              setErrors={setErrors}
              hasSavedId={hasSavedId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MandatoryIDVerification;
