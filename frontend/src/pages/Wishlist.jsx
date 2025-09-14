import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useWishlist } from '../hooks/useWishlist';
import EmptyWishlist from '../components/Wishlist/EmptyWishlist';
import WishlistHeader from '../components/Wishlist/WishlistHeader';
import WishlistItem from '../components/Wishlist/WishlistItem';
import Navbar from '../components/Navbar';

// Main Wishlist Component
const Wishlist = () => {
  const { wishlist, loading: wishlistLoading, removeFromWishlist, isLoggedIn } = useWishlist();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch product details for each wishlist item
  useEffect(() => {
    const fetchWishlistItemDetails = async () => {
      if (!isLoggedIn) {
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
        
        // Fetch product details for each product ID in wishlist
        const productPromises = wishlist.map(async (productId) => {
          try {
            const productRef = doc(firestore, 'products', productId);
            const productDoc = await getDoc(productRef);
            
            if (productDoc.exists()) {
              return {
                id: productDoc.id,
                ...productDoc.data(),
                dateAdded: new Date() // You might want to store this in the wishlist hook
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
        // Filter out null values (products that couldn't be fetched)
        const validProducts = products.filter(product => product !== null);
        
        setWishlistItems(validProducts);
      } catch (error) {
        console.error('Error fetching wishlist items:', error);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (!wishlistLoading) {
      fetchWishlistItemDetails();
    }
  }, [wishlist, wishlistLoading, isLoggedIn]);

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
      const success = await removeFromWishlist(itemId);
      if (success) {
        // The useWishlist hook will automatically update the wishlist state
        // which will trigger the useEffect to refetch product details
        console.log('Item removed from wishlist successfully');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      // You'll need to implement this based on your cart system
      // This could be another hook like useCart or direct Firebase calls
      console.log('Added to cart:', item);
      
      // Example implementation:
      // const { addToCart } = useCart();
      // await addToCart(item.id, 1); // productId, quantity
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Show loading if wishlist is loading or we're fetching product details
  if (wishlistLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        
        {/* Added proper spacing from navbar */}
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
        
        {/* Added proper spacing from navbar */}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      {/* Added proper spacing from navbar and improved layout */}
      <div className="pt-8 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header section with better spacing */}
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

          {/* Content section */}
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