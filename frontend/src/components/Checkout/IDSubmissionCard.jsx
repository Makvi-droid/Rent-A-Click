// IDSubmissionCard.jsx - Clean card component for ID submission
import React from "react";
import { FileText, Upload, ExternalLink } from "lucide-react";

const IDSubmissionCard = ({ onSubmit, userEmail }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-6 space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <Upload className="text-blue-400" size={16} />
        </div>
        <h4 className="text-white font-semibold">Submit Your ID</h4>
      </div>

      <div className="space-y-3">
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold text-xs mt-0.5">1.</span>
            <span>Click "Submit ID Verification" below</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold text-xs mt-0.5">2.</span>
            <span>Upload a clear photo of your government-issued ID</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold text-xs mt-0.5">3.</span>
            <span>
              Bring the SAME physical ID when you pick up/receive your rental
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg"
        >
          <FileText size={18} />
          <span>Submit ID Verification</span>
          <ExternalLink size={14} className="opacity-70" />
        </button>

        <div className="text-center">
          <p className="text-gray-400 text-xs">
            Secure form opens in new tab • Processing takes 2-3 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default IDSubmissionCard;
