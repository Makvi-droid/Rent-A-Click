// CheckoutLoadingState.jsx
import React from "react";

const CheckoutLoadingState = () => (
  <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading checkout...</p>
    </div>
  </div>
);


export default CheckoutLoadingState