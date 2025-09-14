import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Star, Filter, Search, Grid, List, Package, SortAsc } from 'lucide-react';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { firestore as db } from '../../firebase'; // Fixed: Using firestore as db
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

// WishlistItem Component
const WishlistItem = ({ item, onRemove, onAddToCart, viewMode }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [user, loading, error] = useAuthState(auth);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item from wishlist');
    } finally {
      setIsRemoving(false);
    }
  };

  // Enhanced add to cart function with Firebase integration
  const handleAddToCart = async (item) => {
    console.log('Add to cart clicked for item:', item);
    console.log('Current user:', user);

    // Check if auth is still loading
    if (loading) {
      alert('Please wait, checking authentication...');
      return;
    }

    if (!user) {
      alert('Please log in to add items to cart');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // Validate required item data
      if (!item.id && !item.name) {
        throw new Error('Item is missing required data (id or name)');
      }

      // Create cart item object with better validation
      const cartItem = {
        id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || 'Unknown Item',
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
        originalPrice: item.originalPrice ? (typeof item.originalPrice === 'number' ? item.originalPrice : parseFloat(item.originalPrice)) : null,
        description: item.description || '',
        imageUrl: getImageUrl(item),
        rating: item.rating || null,
        quantity: 1,
        addedAt: new Date().toISOString(),
        category: item.category || null,
        brand: item.brand || null,
      };

      console.log('Cart item to be added:', cartItem);

      // Reference to the user's document
      const userDocRef = doc(db, 'users', user.uid);
      console.log('User document reference:', userDocRef.path);
      
      try {
        // Check if user document exists and get current cart
        const userDoc = await getDoc(userDocRef);
        console.log('User document exists:', userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Current user data keys:', Object.keys(userData));
          const currentCart = Array.isArray(userData.cart) ? userData.cart : [];
          console.log('Current cart length:', currentCart.length);
          
          // Check if item already exists in cart (more robust comparison)
          const existingItemIndex = currentCart.findIndex(cartItem => 
            cartItem.id === item.id || 
            (cartItem.name === item.name && cartItem.price === item.price)
          );
          console.log('Existing item index:', existingItemIndex);
          
          if (existingItemIndex > -1) {
            // Item exists, update quantity
            const updatedCart = [...currentCart];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: (updatedCart[existingItemIndex].quantity || 1) + 1,
              addedAt: new Date().toISOString()
            };
            
            console.log('Updating existing item in cart:', updatedCart[existingItemIndex]);
            
            await updateDoc(userDocRef, {
              cart: updatedCart
            });
            
            alert(`Updated quantity! You now have ${updatedCart[existingItemIndex].quantity} of this item in your cart.`);
          } else {
            // Item doesn't exist, add to cart
            console.log('Adding new item to cart');
            const updatedCart = [...currentCart, cartItem];
            
            await updateDoc(userDocRef, {
              cart: updatedCart
            });
            
            alert('Item added to cart successfully!');
          }
        } else {
          // User document doesn't exist, create it with the cart item
          console.log('Creating new user document with cart item');
          
          const newUserData = {
            cart: [cartItem],
            createdAt: new Date().toISOString(),
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || null,
            lastUpdated: new Date().toISOString(),
          };
          
          await setDoc(userDocRef, newUserData);
          alert('Item added to cart successfully!');
        }

        // Call the parent component's onAddToCart if provided
        if (onAddToCart && typeof onAddToCart === 'function') {
          onAddToCart(item);
        }

        console.log('Successfully added item to cart');

      } catch (firestoreError) {
        console.error('Firestore operation error:', firestoreError);
        
        // More specific error handling
        if (firestoreError.code === 'permission-denied') {
          alert('Permission denied. Please check your Firebase Security Rules or try logging out and back in.');
        } else if (firestoreError.code === 'not-found') {
          alert('Database not found. Please check your Firebase configuration.');
        } else if (firestoreError.code === 'unavailable') {
          alert('Firebase service is temporarily unavailable. Please try again.');
        } else if (firestoreError.code === 'unauthenticated') {
          alert('Authentication expired. Please log out and log back in.');
        } else {
          alert(`Failed to add item to cart: ${firestoreError.message}`);
        }
      }

    } catch (error) {
      console.error('General error adding item to cart:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Helper function to get the correct image URL
  const getImageUrl = (item) => {
    if (!item) return '';
    
    // Try different possible field names for the image
    const possibleImageFields = [
      'imageUrl', 'image', 'images', 'photoURL', 'picture', 'thumbnail', 'img'
    ];
    
    for (const field of possibleImageFields) {
      if (item[field]) {
        // Handle arrays (take first image)
        if (Array.isArray(item[field]) && item[field].length > 0) {
          return item[field][0];
        }
        // Handle strings
        if (typeof item[field] === 'string' && item[field].trim()) {
          return item[field];
        }
      }
    }
    
    return '';
  };

  const imageUrl = getImageUrl(item);
  const discount = item.originalPrice && item.price ? 
    Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;

  // Debug: Log item data
  useEffect(() => {
    console.log('WishlistItem rendered with item:', item);
    console.log('User authenticated:', !!user);
    console.log('Auth loading:', loading);
    console.log('Auth error:', error);
    if (user) {
      console.log('User ID:', user.uid);
      console.log('User email:', user.email);
    }
  }, [item, user, loading, error]);

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
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  console.log('Image failed to load:', imageUrl);
                  console.log('Error details:', e);
                  setImageLoaded(true);
                }}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">{item.name || 'Unnamed Item'}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description || 'No description available'}</p>
            
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
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.log('Image failed to load:', imageUrl);
              console.log('Error details:', e);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Package className="w-12 h-12 text-gray-400" />
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