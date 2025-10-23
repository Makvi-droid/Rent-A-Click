// ========================================
// components/HelpSupport/PageHeader.jsx
// ========================================
import { ArrowLeft, Camera } from "lucide-react";

export const PageHeader = ({ onBackClick }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
      <div className="relative px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={onBackClick}
              className="mr-4 p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <Camera className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">RENT-A-CLICK</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
