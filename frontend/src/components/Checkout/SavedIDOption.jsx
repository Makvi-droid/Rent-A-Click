import React, { useState } from "react";
import {
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

const SavedIDOption = ({ savedIdUrl, formData, setFormData, setErrors }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleUseSavedId = () => {
    const confirmed = window.confirm(
      `Use Saved ID Verification?\n\n` +
        `You have a valid ID already on file in your account.\n\n` +
        `✓ Quick and convenient\n` +
        `✓ No need to upload again\n\n` +
        `⚠️ Important: You must bring this SAME physical ID when picking up/receiving your rental.\n\n` +
        `Click OK to use your saved ID, or Cancel to upload a different ID.`
    );

    if (confirmed) {
      setFormData((prev) => ({
        ...prev,
        idSubmitted: true,
        usingSavedId: true,
        savedIdUrl: savedIdUrl,
        uploadNewId: false,
      }));

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.idSubmitted;
        return newErrors;
      });

      alert(
        `✅ Saved ID Verified!\n\n` +
          `Your ID verification is complete.\n\n` +
          `📋 Important Reminders:\n` +
          `• Bring your PHYSICAL ID when picking up equipment\n` +
          `• ID must match the one in your account\n` +
          `• Keep your ID with you during the entire rental period`
      );
    }
  };

  const handleUploadNewId = () => {
    const confirmed = window.confirm(
      `Upload New ID?\n\n` +
        `You can upload a different ID if:\n` +
        `• Your previous ID is expired\n` +
        `• You want to use a different valid ID\n` +
        `• Your ID information has changed\n\n` +
        `This will replace your current saved ID.\n\n` +
        `Click OK to proceed with uploading a new ID.`
    );

    if (confirmed) {
      setFormData((prev) => ({
        ...prev,
        uploadNewId: true,
        usingSavedId: false,
      }));
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    console.error("Failed to load saved ID image:", savedIdUrl);
  };

  return (
    <div className="space-y-4">
      {/* Saved ID Card */}
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="text-green-400" size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold">Saved ID Available</h4>
              <p className="text-gray-400 text-sm">
                We found a valid ID in your account
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium rounded-lg border border-green-500/30 transition-all duration-300 flex items-center space-x-2"
          >
            <ImageIcon size={16} />
            <span>{showPreview ? "Hide" : "Preview"}</span>
          </button>
        </div>

        {/* Image Preview */}
        {showPreview && (
          <div className="mb-4 rounded-lg overflow-hidden border border-green-500/20">
            {!imageError ? (
              <img
                src={savedIdUrl}
                alt="Saved ID"
                onLoad={handleImageLoad}
                onError={handleImageError}
                className="w-full h-auto max-h-96 object-contain bg-gray-900/50"
              />
            ) : (
              <div className="flex items-center justify-center p-8 bg-gray-900/50">
                <div className="text-center">
                  <AlertCircle
                    className="text-red-400 mx-auto mb-2"
                    size={32}
                  />
                  <p className="text-gray-400 text-sm">Failed to load image</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleUseSavedId}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-2"
          >
            <CheckCircle2 size={20} />
            <span>Use This ID</span>
          </button>

          <button
            onClick={handleUploadNewId}
            className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-300 border border-gray-600 hover:border-gray-500 flex items-center justify-center space-x-2"
          >
            <Upload size={20} />
            <span>Upload New ID</span>
          </button>
        </div>

        <p className="text-gray-400 text-xs mt-4 text-center">
          ⚠️ You must bring the physical ID that matches the one shown above
          when picking up your rental
        </p>
      </div>
    </div>
  );
};

export default SavedIDOption;
