// components/UI/HeartIcon.js
import React, { useState } from 'react';

const HeartIcon = ({ 
  isInWishlist, 
  onToggle, 
  isLoading = false,
  size = "w-6 h-6",
  className = ""
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    
    // Call the toggle function
    await onToggle();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        group relative p-2 rounded-full 
        bg-black/20 backdrop-blur-sm hover:bg-black/40 
        border border-white/20 hover:border-white/40
        transition-all duration-300 transform hover:scale-110
        ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {/* Heart Icon */}
      <svg
        className={`
          ${size} transition-all duration-300 transform
          ${isInWishlist 
            ? 'text-red-500 fill-red-500 drop-shadow-lg' 
            : 'text-white/80 hover:text-red-400 fill-none hover:fill-red-400/20'
          }
          ${isAnimating ? 'animate-pulse scale-125' : ''}
        `}
        fill={isInWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={isInWishlist ? 0 : 2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>

      {/* Animated hearts for added effect */}
      {isAnimating && isInWishlist && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-3 h-3 text-red-400 fill-red-400 opacity-70" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default HeartIcon;