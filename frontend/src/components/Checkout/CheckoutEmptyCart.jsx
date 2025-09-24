// CheckoutEmptyCart.jsx
import React from 'react';
import Navbar from "../Navbar";

const CheckoutEmptyCart = ({ onGoToCart }) => (
  <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden flex items-center justify-center">
    <Navbar />
    <div className="text-center py-16">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">
          No Items Selected
        </h2>
        <p className="text-gray-300 mb-6">
          Please select items from your cart to proceed with checkout.
        </p>
        <button
          onClick={onGoToCart}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
        >
          Back to Cart
        </button>
      </div>
    </div>
  </div>
);

export default CheckoutEmptyCart;