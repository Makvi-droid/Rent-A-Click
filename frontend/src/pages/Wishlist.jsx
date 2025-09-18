import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/Authentication/Toast';
import EmptyWishlist from '../components/Wishlist/EmptyWishlist';
import WishlistHeader from '../components/Wishlist/WishlistHeader';
import WishlistItem from '../components/Wishlist/WishlistItem';
import Navbar from '../components/Navbar';

// Main Wishlist Component
const Wishlist = () => {
  const { 
    wishlist, 
    loading: wishlistLoading, 
    removeFromWishlist, 
    isLoggedIn, 
    hasCustomerProfile 
  } = useWishlist();
  
  const { addToCart } = useCart();
  const { showSuccess, showError, showWarning } = useToast();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch product details for each wishlist item
  useEffect(() => {
    const fetchWishlistItemDetails = async () => {
      if (!isLoggedIn || !hasCustomerProfile) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      if (wishlist.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const productPromises = wishlist.map(async (productId) => {
          try {
            const productRef = doc(firestore, 'products', productId);
            const productDoc = await getDoc(productRef);
            
            if (productDoc.exists()) {
              const productData = productDoc.data();
              return {
                id: productDoc.id,
                ...productData,
                dateAdded: new Date()
              };
            } else {
              console.warn(`Product with ID ${productId} not found`);
              return null;
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            return null;
          }
        });

        const products = await Promise.all(productPromises);
        const validProducts = products.filter(product => product !== null);
        
        setWishlistItems(validProducts);
      } catch (error) {
        console.error('Error fetching wishlist items:', error);
        showError('Failed to load wishlist items');
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (!wishlistLoading) {
      fetchWishlistItemDetails();
    }
  }, [wishlist, wishlistLoading, isLoggedIn, hasCustomerProfile, showError]);

  // Filter and sort items
  const filteredAndSortedItems = wishlistItems
    .filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'dateAdded':
        default:
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
      }
    });

  const handleRemoveItem = async (itemId) => {
    try {
      const item = wishlistItems.find(item => item.id === itemId);
      const success = await removeFromWishlist(itemId);
      if (success) {
        console.log('Item removed from wishlist successfully');
      } else {
        showError('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      showError('An error occurred while removing the item');
    }
  };

  // FIXED: Enhanced handleAddToCart function with comprehensive image handling
  const handleAddToCart = async (item) => {
    try {
      console.log('🛒 Adding item to cart:', item);
      console.log('🔍 Item data structure:', JSON.stringify(item, null, 2));

      // COMPREHENSIVE image detection - check all possible image fields
      let itemImage = null;
      
      // List of all possible image field names we might encounter
      const imageFields = [
        'image',           // Most common
        'imageUrl',        // Common variant
        'images',          // Array of images
        'imageUrls',       // Array of image URLs
        'photos',          // Alternative naming
        'photoURL',        // Firebase style
        'picture',         // Generic naming
        'thumbnail',       // Thumbnail image
        'img',             // Short form
        'mainImage',       // Main product image
        'primaryImage',    // Primary image
        'featuredImage',   // Featured image
        'productImage',    // Product specific
        'productImages',   // Multiple product images
        'galleryImages',   // Gallery images
        'media'            // Media field
      ];

      // Try each field systematically
      for (const field of imageFields) {
        if (item[field]) {
          console.log(`✅ Found potential image in field '${field}':`, item[field]);
          
          if (Array.isArray(item[field])) {
            // Handle array of images - take the first valid one
            const validImages = item[field].filter(img => 
              img && 
              typeof img === 'string' && 
              img.trim().length > 0 &&
              (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/'))
            );
            
            if (validImages.length > 0) {
              itemImage = validImages[0];
              console.log(`📷 Using first image from ${field} array:`, itemImage);
              break;
            }
          } else if (typeof item[field] === 'string') {
            // Handle string URLs
            const cleanUrl = item[field].trim();
            if (cleanUrl.length > 0 && (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('/'))) {
              itemImage = cleanUrl;
              console.log(`📷 Using image from ${field}:`, itemImage);
              break;
            }
          } else if (typeof item[field] === 'object' && item[field] !== null) {
            // Handle object with nested image properties
            const nestedImageFields = ['url', 'src', 'href', 'link'];
            for (const nestedField of nestedImageFields) {
              if (item[field][nestedField] && typeof item[field][nestedField] === 'string') {
                const nestedUrl = item[field][nestedField].trim();
                if (nestedUrl.length > 0 && (nestedUrl.startsWith('http') || nestedUrl.startsWith('data:') || nestedUrl.startsWith('/'))) {
                  itemImage = nestedUrl;
                  console.log(`📷 Using nested image from ${field}.${nestedField}:`, itemImage);
                  break;
                }
              }
            }
            if (itemImage) break;
          }
        }
      }

      // Final validation and logging
      if (itemImage) {
        console.log('✅ Final image URL determined:', itemImage);
      } else {
        console.warn('⚠️ No valid image found for item. Available fields:', Object.keys(item));
        console.warn('⚠️ Item data for debugging:', item);
      }

      // Create cart item with GUARANTEED image preservation
      const cartItem = {
        productId: item.id,
        name: item.name || 'Unnamed Product',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        // CRITICAL: Ensure image is always included, even if null
        image: itemImage || null, 
        quantity: 1,
        variant: null,
        // Preserve additional fields that might contain images
        originalData: {
          ...item, // Keep all original data as backup
        },
        // Add multiple image fields for compatibility
        imageUrl: itemImage,
        images: itemImage ? [itemImage] : [],
        addedFrom: 'wishlist', // Track source
        addedAt: new Date().toISOString()
      };

      console.log('🛒 Final cart item being sent:', JSON.stringify(cartItem, null, 2));

      const success = await addToCart(cartItem);
      
      if (success) {
        console.log('✅ Item added to cart successfully');
        return true;
      } else {
        console.error('❌ Failed to add item to cart');
        showError(`Failed to add ${item.name || 'item'} to cart`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      showError(`Error adding ${item.name || 'item'} to cart: ${error.message}`);
      return false;
    }
  };

  // Show loading if wishlist is loading or we're fetching product details
  if (wishlistLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        
        <div className="pt-8 pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-slate-700/50 h-48 rounded-2xl mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-slate-700/30 h-96 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        
        <div className="pt-12 pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Please log in to view your wishlist
                </h2>
                <p className="text-gray-300">
                  You need to be logged in to access your wishlist items.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if user doesn't have a customer profile
  if (!hasCustomerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        
        <div className="pt-12 pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Customer Profile Required
                </h2>
                <p className="text-gray-300 mb-4">
                  You need to create a customer profile to use the wishlist feature.
                </p>
                <p className="text-gray-400 text-sm">
                  Please complete your profile setup to continue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <WishlistHeader 
              itemCount={filteredAndSortedItems.length}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              setSortBy={setSortBy}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          <div className="mt-8">
            {filteredAndSortedItems.length === 0 ? (
              <EmptyWishlist />
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {filteredAndSortedItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveItem}
                    onAddToCart={handleAddToCart}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;