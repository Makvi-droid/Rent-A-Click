// CheckoutHeader.jsx
import React from "react";
import { ShoppingCart } from "lucide-react";

const CheckoutHeader = ({ isVisible, userData, user, rentalItems }) => (
  <div
    className={`text-center mb-12 transition-all duration-1000 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}
  >
    <h1 className="text-5xl md:text-6xl font-bold mb-4 relative">
      <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
        Complete Your Rental
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 blur-2xl -z-10"></div>
    </h1>
    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
      {userData?.firstName || user?.displayName ? 
        `Welcome back, ${userData?.firstName || user?.displayName}!` : 
        "Just a few more steps to get your professional camera equipment"
      }
    </p>
    <div className="flex items-center justify-center space-x-2 mt-4">
      <ShoppingCart className="w-5 h-5 text-purple-400" />
      <span className="text-purple-400 font-medium">
        {rentalItems.length} {rentalItems.length === 1 ? 'item' : 'items'} selected for checkout
      </span>
    </div>
  </div>
);

export default CheckoutHeader