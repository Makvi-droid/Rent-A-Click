// components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-300 border-solid rounded-full animate-spin border-t-transparent"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-pink-300 border-solid rounded-full animate-ping opacity-20"></div>
        </div>
        <p className="text-white/80 mt-4 text-lg">Loading inventory...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;