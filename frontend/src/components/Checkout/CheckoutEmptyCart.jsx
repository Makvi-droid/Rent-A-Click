// CheckoutEmptyCart.jsx
import React from "react";
import { ShoppingCart } from "lucide-react";

const CheckoutEmptyCart = ({ onGoToCart }) => (
  <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-6">
      <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-4">No Items Selected</h2>
      <p className="text-gray-400 mb-6">Please go back to your cart and select items to checkout.</p>
      <button
        onClick={onGoToCart}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
      >
        Go to Cart
      </button>
    </div>
  </div>
);

export default CheckoutEmptyCart