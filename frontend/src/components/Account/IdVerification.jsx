import React, { useState, useEffect } from "react";
import {
  Shield,
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const IDVerification = ({ data, onChange }) => {
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState("");

  // Update preview when idDocumentUrl changes (existing document from Cloudinary)
  useEffect(() => {
    if (data.idDocumentUrl && !data.idDocument) {
      setPreview(data.idDocumentUrl);
    }
  }, [data.idDocumentUrl, data.idDocument]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileError("");

    // Validate file size (10MB max for Cloudinary free tier)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setFileError("File size must be less than 10MB");
      return;
    }

    // Validate file type - Cloudinary supports various formats
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      setFileError("Please upload a valid image (JPG, PNG, WEBP) or PDF file");
      return;
    }

    // Create preview for the selected file
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onChange("idDocument", file);
    };
    reader.onerror = () => {
      setFileError("Error reading file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const isPDF = (url) => {
    if (!url) return false;
    if (typeof url === "string") {
      return url.toLowerCase().endsWith(".pdf") || url.includes(".pdf");
    }
    if (url instanceof File) {
      return url.type === "application/pdf";
    }
    return false;
  };

  const hasDocument = () => {
    return (preview && data.idDocument instanceof File) || data.idDocumentUrl;
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
          <Shield className="w-5 h-5 text-green-400" />
        </div>
        ID Verification
      </h3>

      <div className="space-y-6">
        {/* ID Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ID Type *
          </label>
          <select
            value={data.idType || ""}
            onChange={(e) => onChange("idType", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50
                     text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
          >
            <option value="">Select ID type</option>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver's License</option>
            <option value="national_id">National ID Card (PhilSys)</option>
            <option value="philhealth">PhilHealth ID</option>
            <option value="umid">UMID Card (Unified Multi-Purpose ID)</option>
            <option value="postal_id">Postal ID</option>
            <option value="voters_id">Voter's ID (COMELEC)</option>
            <option value="prc_id">
              PRC ID (Professional Regulation Commission)
            </option>
            <option value="sss_id">SSS ID (Social Security System)</option>
          </select>
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ID Number *
          </label>
          <input
            type="text"
            value={data.idNumber || ""}
            onChange={(e) => onChange("idNumber", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50
                     text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
            placeholder="Enter your ID number"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter the identification number shown on your document
          </p>
        </div>

        {/* ID Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload ID Document *
          </label>

          {/* File error message */}
          {fileError && (
            <div className="mb-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{fileError}</p>
            </div>
          )}

          {/* Upload Area */}
          <div className="mt-2">
            {hasDocument() ? (
              // Show preview/existing document
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
                  {isPDF(preview || data.idDocumentUrl || data.idDocument) ? (
                    // PDF Preview
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-2xl mb-4">
                        <CreditCard className="w-10 h-10 text-red-400" />
                      </div>
                      <p className="text-white font-medium mb-2">
                        PDF Document{" "}
                        {data.idDocument instanceof File
                          ? "Selected"
                          : "Uploaded"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {data.idDocument instanceof File
                          ? data.idDocument.name
                          : "ID Document.pdf"}
                      </p>
                      {data.idDocumentUrl &&
                        !(data.idDocument instanceof File) && (
                          <a
                            href={data.idDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            View Document
                          </a>
                        )}
                      {data.idDocument instanceof File && (
                        <p className="text-xs text-yellow-400 mt-2">
                          Click "Save Changes" to upload to Cloudinary
                        </p>
                      )}
                    </div>
                  ) : (
                    // Image Preview
                    <div className="relative">
                      <img
                        src={preview || data.idDocumentUrl}
                        alt="ID Document Preview"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                      {data.idDocument instanceof File && (
                        <div className="absolute bottom-3 left-3 right-3 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-lg px-3 py-2">
                          <p className="text-xs text-yellow-300 text-center">
                            New image selected - Click "Save Changes" to upload
                            to Cloudinary
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Success indicator for existing documents from Cloudinary */}
                  {data.idDocumentUrl && !(data.idDocument instanceof File) && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg px-3 py-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-300 font-medium">
                        Uploaded to Cloudinary
                      </span>
                    </div>
                  )}
                </div>

                {/* Change document button */}
                <label className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-green-500/50 rounded-xl cursor-pointer transition-all duration-300 group">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {data.idDocumentUrl
                      ? "Change Document"
                      : "Select Different File"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            ) : (
              // Upload prompt
              <label className="flex flex-col items-center justify-center px-6 py-8 border-2 border-gray-700/50 border-dashed rounded-xl hover:border-green-500/50 transition-all duration-300 cursor-pointer bg-gray-800/30 backdrop-blur-sm group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-4 group-hover:bg-green-500/20 transition-colors">
                  <CreditCard className="w-8 h-8 text-green-400" />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    <span className="text-green-400">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP, or PDF (max 10MB)
                  </p>
                  <p className="text-xs text-gray-400">
                    Files will be securely stored in Cloudinary
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          {/* Helper text */}
          <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-xs text-blue-200/80 leading-relaxed">
              <strong className="text-blue-300">Requirements:</strong> Ensure
              your ID is clearly visible with readable text. We accept
              government-issued IDs such as passport, driver's license, PhilSys
              (National ID), UMID, SSS, PhilHealth, PRC, Postal ID, or Voter's
              ID. Your document will be securely uploaded to Cloudinary and
              stored in the customers collection.
            </p>
          </div>

          {/* Upload info */}
          <div className="mt-2 p-3 bg-green-900/10 border border-green-700/20 rounded-lg">
            <p className="text-xs text-green-200/70 leading-relaxed">
              <strong className="text-green-300">Privacy:</strong> Your ID
              document is encrypted and securely stored. Only authorized
              administrators can access this information for verification
              purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDVerification;
