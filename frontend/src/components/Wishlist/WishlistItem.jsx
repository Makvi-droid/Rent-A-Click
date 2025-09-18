import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Star, Filter, Search, Grid, List, Package, SortAsc } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { useToast } from '../Authentication/Toast'; // Import the useToast hook

// WishlistItem Component
const WishlistItem = ({ item, onRemove, onAddToCart, viewMode }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [user, loading, error] = useAuthState(auth);
  const { showSuccess, showError, showWarning } = useToast(); // Use the toast hook

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.id);
      showSuccess(`${item.name || 'Item'} removed from wishlist`);
    } catch (error) {
      console.error('Error removing item:', error);
      showError('Failed to remove item from wishlist');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = async (item) => {
    console.log('Add to cart clicked for item:', item);
    console.log('Current user:', user);

    if (loading) {
      showWarning('Please wait, checking authentication...');
      return;
    }

    if (!user) {
      showError('Please log in to add items to cart');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      if (onAddToCart && typeof onAddToCart === 'function') {
        await onAddToCart(item);
        console.log('Successfully added item to cart via parent component');
        
        // Show success toast notification
        showSuccess(`${item.name || 'Item'} added to cart successfully!`);
        
      } else {
        throw new Error('No add to cart function provided by parent component');
      }

    } catch (error) {
      console.error('Error adding item to cart:', error);
      showError(`Failed to add ${item.name || 'item'} to cart: ${error.message}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Enhanced image URL helper function with better debugging
  const getImageUrl = (item) => {
    if (!item) {
      console.log('❌ No item provided to getImageUrl');
      return '';
    }
    
    console.log('🔍 Checking item for images:', {
      itemId: item.id,
      itemKeys: Object.keys(item),
      itemData: item
    });
    
    // Try different possible field names for the image
    const possibleImageFields = [
      'imageUrl', 'image', 'images', 'imageUrls', 'photoURL', 'photos', 'picture', 'thumbnail', 'img'
    ];
    
    for (const field of possibleImageFields) {
      if (item[field]) {
        console.log(`✅ Found image in field '${field}':`, item[field]);
        
        // Handle arrays (take first image)
        if (Array.isArray(item[field]) && item[field].length > 0) {
          console.log(`📷 Using first image from array:`, item[field][0]);
          return item[field][0];
        }
        
        // Handle strings
        if (typeof item[field] === 'string' && item[field].trim()) {
          console.log(`📷 Using image URL:`, item[field]);
          return item[field];
        }
      }
    }
    
    console.log('❌ No valid image found in item');
    return '';
  };

  const imageUrl = getImageUrl(item);
  const discount = item.originalPrice && item.price ? 
    Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;

  // Enhanced debug logging
  useEffect(() => {
    console.log('=== WishlistItem Debug Info ===');
    console.log('Item ID:', item?.id);
    console.log('Item name:', item?.name);
    console.log('Full item object:', item);
    console.log('Image URL determined:', imageUrl);
    console.log('Image URL length:', imageUrl?.length);
    console.log('Image URL type:', typeof imageUrl);
    console.log('User authenticated:', !!user);
    console.log('Auth loading:', loading);
    if (user) {
      console.log('User ID:', user.uid);
      console.log('User email:', user.email);
    }
    console.log('================================');
  }, [item, user, loading, error, imageUrl]);

  // Enhanced image load handlers
  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', imageUrl);
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    console.error('❌ Image failed to load:', {
      src: e.target.src,
      error: e,
      originalUrl: imageUrl
    });
    setImageLoaded(true); // Set to true to hide loading state
  };

  // Show loading state if auth is still loading
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 p-6 ${isRemoving ? 'opacity-50 scale-95' : ''}`}>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
            )}
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={item.name || 'Product image'}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Package className="w-8 h-8 text-gray-400" />
                <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 text-center">
                  No Image
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">{item.name || 'Unnamed Item'}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description || 'No description available'}</p>
            
            {/* Debug info display */}
            <div className="text-xs text-gray-400 mb-2">
              ID: {item.id} | Image: {imageUrl ? '✅' : '❌'} | Fields: {Object.keys(item).join(', ')}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-600">
                  ₱{typeof item.price === 'number' ? item.price.toFixed(2) : item.price || '0.00'}
                </span>
                {item.originalPrice && (
                  <>
                    <span className="text-gray-400 line-through">
                      ₱{typeof item.originalPrice === 'number' ? item.originalPrice.toFixed(2) : item.originalPrice}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">-{discount}%</span>
                  </>
                )}
              </div>
              
              {item.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">{item.rating}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => handleAddToCart(item)}
              disabled={isAddingToCart || !user || loading}
              className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg ${
                isAddingToCart || !user || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isAddingToCart ? 'Adding...' : !user ? 'Login Required' : 'Add to Cart'}
            </button>
            
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-110"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group ${isRemoving ? 'opacity-50 scale-95' : ''}`}>
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
        )}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.name || 'Product image'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 flex-col">
            <Package className="w-12 h-12 text-gray-400 mb-2" />
            <div className="text-xs text-gray-500 text-center px-2">
              No Image Available
            </div>
            <div className="text-xs text-red-500 text-center px-2 mt-1">
              ID: {item.id}
            </div>
          </div>
        )}
        
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            -{discount}%
          </div>
        )}
        
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">{item.name || 'Unnamed Item'}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description || 'No description available'}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-600">
              ₱{typeof item.price === 'number' ? item.price.toFixed(2) : item.price || '0.00'}
            </span>
            {item.originalPrice && (
              <span className="text-gray-400 line-through text-sm">
                ₱{typeof item.originalPrice === 'number' ? item.originalPrice.toFixed(2) : item.originalPrice}
              </span>
            )}
          </div>
          
          {item.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">{item.rating}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end">
          <button
            onClick={() => handleAddToCart(item)}
            disabled={isAddingToCart || !user || loading}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg ${
              isAddingToCart || !user || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isAddingToCart ? 'Adding...' : !user ? 'Login Required' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;