import React from 'react';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-white/20">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">0</span>
          </div>
        </div>
        
        {/* Title and Description */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Your Cart is Empty
        </h2>
        <p className="text-gray-300 mb-8 leading-relaxed">
          Looks like you haven't added anything to your cart yet. 
          Start shopping to fill it up with amazing products!
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/productsPage')}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
          
          <button
            onClick={() => navigate('/wishlistPage')}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 border border-white/20 transition-all duration-300"
          >
            <Heart className="w-5 h-5" />
            View Wishlist
          </button>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-gray-400 text-sm">
            💡 Tip: Save items to your wishlist for later!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;