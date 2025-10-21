import React from "react";
import { ExternalLink, FileText, ArrowLeft } from "lucide-react";
import { handleManualIDConfirmation } from "./handleMandatoryIDSubmission";

const IDSubmissionCard = ({
  onSubmit,
  userEmail,
  formData,
  setFormData,
  setErrors,
  hasSavedId = false,
}) => {
  const handleConfirmation = (e) => {
    if (e.target.checked) {
      handleManualIDConfirmation(setFormData, setErrors);
    } else {
      setFormData((prev) => ({
        ...prev,
        idSubmitted: false,
      }));
    }
  };

  const handleBackToSaved = () => {
    setFormData((prev) => ({
      ...prev,
      uploadNewId: false,
      usingSavedId: false,
    }));
  };

  return (
    <div className="bg-gray-800/40 border border-gray-600/50 rounded-xl p-6">
      {/* Back button if user has saved ID */}
      {hasSavedId && (
        <button
          onClick={handleBackToSaved}
          className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors duration-300"
        >
          <ArrowLeft size={16} />
          <span>Back to saved ID option</span>
        </button>
      )}

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <FileText className="text-purple-400 flex-shrink-0 mt-1" size={20} />
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-2">
              Submit Your Valid ID
            </h4>
            <ul className="text-gray-300 text-sm space-y-2 mb-4">
              <li>• Government-issued ID (Driver's License, Passport, etc.)</li>
              <li>• Clear photo showing your full name and photo</li>
              <li>• Must be valid and not expired</li>
              <li>
                • Same ID must be presented physically during equipment pickup
              </li>
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25 flex items-center justify-center space-x-3"
        >
          <ExternalLink size={20} />
          <span>Open ID Verification Form</span>
        </button>

        {/* Manual Confirmation Checkbox */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.idSubmitted || false}
              onChange={handleConfirmation}
              className="mt-1 w-5 h-5 text-blue-600 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
            />
            <div className="flex-1">
              <span className="text-blue-300 font-medium text-sm block mb-1">
                ✓ I have completed the ID verification form
              </span>
              <p className="text-blue-400/80 text-xs">
                Check this box after successfully submitting your ID through the
                form above
              </p>
            </div>
          </label>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
          <p className="text-yellow-300/90 text-xs">
            <strong>Important:</strong> The form will open in a new tab. After
            submitting, return here and check the confirmation box to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IDSubmissionCard;
