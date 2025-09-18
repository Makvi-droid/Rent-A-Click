import React, { useState } from 'react';
import { Trash2, Plus, Minus, Package, Star, Check } from 'lucide-react';

const CartItem = ({ item, onQuantityUpdate, onRemove, onSelect, isSelected = false, viewMode }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }
    onQuantityUpdate(item.id, newQuantity);
  };

  const handleCheckboxChange = () => {
    onSelect(item.id, !isSelected);
  };

  // ENHANCED: More comprehensive image URL detection with debugging
  const getImageUrl = (item) => {
    if (!item) {
      console.log('CartItem: No item provided to getImageUrl');
      return '';
    }
    
    console.log('CartItem: Analyzing item for images:', {
      itemId: item.id,
      itemName: item.name,
      availableFields: Object.keys(item)
    });
    
    // Comprehensive list of image field possibilities
    const imageFields = [
      'image',           // Primary field
      'imageUrl',        // Common alternative
      'images',          // Array field
      'imageUrls',       // Array of URLs
      'photos',          // Alternative naming
      'photoURL',        // Firebase style
      'picture',         // Generic
      'thumbnail',       // Thumbnail
      'img',             // Short form
      'mainImage',       // Main product image
      'primaryImage',    // Primary image
      'featuredImage',   // Featured image
      'productImage',    // Product specific
      'productImages',   // Multiple product images
      'galleryImages',   // Gallery images
      'media'            // Media field
    ];
    
    // Check each field systematically
    for (const field of imageFields) {
      if (item[field]) {
        console.log(`CartItem: Found potential image in field '${field}':`, item[field]);
        
        if (Array.isArray(item[field])) {
          // Handle arrays - find first valid image URL
          const validImages = item[field].filter(img => 
            img && 
            typeof img === 'string' && 
            img.trim().length > 0 &&
            (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/'))
          );
          
          if (validImages.length > 0) {
            console.log(`CartItem: Using first valid image from ${field} array:`, validImages[0]);
            return validImages[0];
          }
        } else if (typeof item[field] === 'string') {
          // Handle string URLs
          const cleanUrl = item[field].trim();
          if (cleanUrl.length > 0 && (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('/'))) {
            console.log(`CartItem: Using image from ${field}:`, cleanUrl);
            return cleanUrl;
          }
        } else if (typeof item[field] === 'object' && item[field] !== null) {
          // Handle nested objects
          const nestedFields = ['url', 'src', 'href', 'link', 'path'];
          for (const nestedField of nestedFields) {
            if (item[field][nestedField] && typeof item[field][nestedField] === 'string') {
              const nestedUrl = item[field][nestedField].trim();
              if (nestedUrl.length > 0 && (nestedUrl.startsWith('http') || nestedUrl.startsWith('data:') || nestedUrl.startsWith('/'))) {
                console.log(`CartItem: Using nested image from ${field}.${nestedField}:`, nestedUrl);
                return nestedUrl;
              }
            }
          }
        }
      }
    }

    // Check if originalData exists (backup data from wishlist)
    if (item.originalData) {
      console.log('CartItem: Checking originalData for images...');
      for (const field of imageFields) {
        if (item.originalData[field]) {
          const originalImage = item.originalData[field];
          if (typeof originalImage === 'string' && originalImage.trim().length > 0) {
            console.log(`CartItem: Using image from originalData.${field}:`, originalImage);
            return originalImage;
          }
          if (Array.isArray(originalImage) && originalImage.length > 0) {
            console.log(`CartItem: Using first image from originalData.${field}:`, originalImage[0]);
            return originalImage[0];
          }
        }
      }
    }

    // Check sourceData as final fallback
    if (item.sourceData) {
      console.log('CartItem: Checking sourceData for images...');
      for (const field of imageFields) {
        if (item.sourceData[field]) {
          const sourceImage = item.sourceData[field];
          if (typeof sourceImage === 'string' && sourceImage.trim().length > 0) {
            console.log(`CartItem: Using image from sourceData.${field}:`, sourceImage);
            return sourceImage;
          }
        }
      }
    }
    
    console.log('CartItem: No valid image found for item:', item.id);
    return '';
  };

  const imageUrl = getImageUrl(item);
  const quantity = item.quantity || 1;
  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
  const originalPrice = item.originalPrice ? (typeof item.originalPrice === 'number' ? item.originalPrice : parseFloat(item.originalPrice)) : null;
  const discount = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const subtotal = price * quantity;

  const handleImageLoad = () => {
    console.log('CartItem: Image loaded successfully for', item.name);
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    console.error('CartItem: Image failed to load:', {
      src: e.target.src,
      itemId: item.id,
      itemName: item.name
    });
    setImageLoaded(true); // Set to true to hide loading state
  };

  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 ${isRemoving ? 'opacity-50 scale-95' : ''} ${isSelected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}>
        <div className="flex items-center gap-6">
          {/* Checkbox */}
          <div className="flex-shrink-0">
            <button
              onClick={handleCheckboxChange}
              className={`relative w-6 h-6 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                isSelected
                  ? 'bg-purple-600 border-purple-600'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </button>
          </div>

          {/* Image */}
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
              <div className="w-full h-full flex items-center justify-center bg-gray-200 flex-col">
                <Package className="w-8 h-8 text-gray-400 mb-1" />
                <div className="text-xs text-gray-500 text-center px-1">No Image</div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-red-500 text-center px-1 mt-1">
                    ID: {item.id}
                  </div>
                )}
              </div>
            )}
            {discount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -{discount}%
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate">
              {item.name || 'Unnamed Item'}
            </h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {item.description || 'No description available'}
            </p>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-purple-600">
                  ₱{price.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    ₱{originalPrice.toFixed(2)}
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
            
            <div className="text-sm text-gray-500">
              {item.category && (
                <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                  {item.category}
                </span>
              )}
              {item.brand && (
                <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                  {item.brand}
                </span>
              )}
            </div>
          </div>
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center bg-gray-100 rounded-xl">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-2 hover:bg-gray-200 rounded-l-xl transition-colors"
                title="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-medium min-w-[50px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-2 hover:bg-gray-200 rounded-r-xl transition-colors"
                title="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Subtotal */}
            <div className="text-right min-w-[80px]">
              <div className="text-lg font-bold text-gray-900">
                ₱{subtotal.toFixed(2)}
              </div>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-110"
              title="Remove item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group relative ${isRemoving ? 'opacity-50 scale-95' : ''} ${isSelected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}>
      {/* Checkbox - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleCheckboxChange}
          className={`relative w-6 h-6 rounded-md border-2 transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${
            isSelected
              ? 'bg-purple-600 border-purple-600'
              : 'bg-white/90 border-gray-300 hover:border-purple-400'
          }`}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </button>
      </div>

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
            <div className="text-sm text-gray-500 text-center px-2">No Image Available</div>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-red-500 text-center px-2 mt-1">
                Debug: {item.id}
              </div>
            )}
          </div>
        )}
        
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            -{discount}%
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {item.name || 'Unnamed Item'}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-purple-600">
              ₱{price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-gray-400 line-through text-sm">
                ₱{originalPrice.toFixed(2)}
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
        
        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
              title="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-3 py-2 font-medium text-sm min-w-[40px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
              title="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              ₱{subtotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;