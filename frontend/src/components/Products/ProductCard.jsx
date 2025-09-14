import React, { useState } from 'react';
import HeartIcon from './HeartIcon';
import { useWishlist } from '../../hooks/useWishlist';
import { useToast } from '../Authentication/Toast'; // Assuming you have this

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist, isLoggedIn } = useWishlist();
  const { showSuccess, showError, showInfo } = useToast();
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'out of stock': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (price) => {
    return `₱${price?.toLocaleString() || '0'}`;
  };

  const handleRentNow = () => {
    // Add your rent now logic here
    console.log('Rent product:', product.id);
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      showInfo('Please log in to add items to your wishlist', 4000);
      return;
    }

    setIsWishlistLoading(true);
    
    try {
      const success = await toggleWishlist(product.id);
      
      if (success) {
        if (isInWishlist(product.id)) {
          showSuccess(`${product.name} removed from wishlist`, 3000);
        } else {
          showSuccess(`${product.name} added to wishlist`, 3000);
        }
      } else {
        showError('Failed to update wishlist. Please try again.', 4000);
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      showError('Something went wrong. Please try again.', 4000);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 hover:border-white/40 overflow-hidden relative">
      
      {/* Wishlist Heart Icon - Positioned at top right */}
      <div className="absolute top-3 right-3 z-10">
        <HeartIcon
          isInWishlist={isInWishlist(product.id)}
          onToggle={handleWishlistToggle}
          isLoading={isWishlistLoading}
          size="w-5 h-5"
        />
      </div>

      {/* Product Image */}
      <div className="h-48 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div className={`w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm ${product.imageUrl ? 'hidden' : 'flex'}`}>
          <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
            {product.brand || 'Unknown Brand'}
          </span>
          {/* Status Indicator */}
          <span className={`${getStatusColor(product.status)} text-white text-xs font-bold px-2 py-1 rounded`}>
            {product.status ? product.status.toUpperCase() : 'UNKNOWN'}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 leading-tight">
          {product.name || 'Unnamed Product'}
        </h3>

        {/* Category and Subcategory */}
        {(product.category || product.subCategory) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.category && (
              <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">
                {product.category}
              </span>
            )}
            {product.subCategory && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                {product.subCategory}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-5">
          <span className="text-2xl font-bold text-white">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-white/60">/day</span>
        </div>

        {/* Description if available */}
        {product.description && (
          <p className="text-sm text-white/70 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <button 
          disabled={product.status === 'out of stock'}
          onClick={handleRentNow}
          className={`w-full ${
            product.status === 'out of stock' 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
        >
          {product.status === 'out of stock' ? 'Out of Stock' : 'Rent Now'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;