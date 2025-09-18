import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import Navbar from '../components/Navbar';
import CartHeader from '../components/Cart/CartHeader';
import CartItem from '../components/Cart/CartItem';
import EmptyCart from '../components/Cart/EmptyCart';

const AddToCart = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [customerDocId, setCustomerDocId] = useState(null);

  // Find customer document by firebaseUid
  const findCustomerDoc = async (firebaseUid) => {
    try {
      const customersRef = collection(firestore, 'customers');
      const q = query(customersRef, where('firebaseUid', '==', firebaseUid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const customerDoc = querySnapshot.docs[0];
        return {
          id: customerDoc.id,
          data: customerDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding customer document:', error);
      return null;
    }
  };

  // Fetch cart items from Firebase
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) {
        setCartItems([]);
        setCustomerDocId(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const customerDoc = await findCustomerDoc(user.uid);
        
        if (customerDoc) {
          setCustomerDocId(customerDoc.id);
          const cart = customerDoc.data.cart || [];
          setCartItems(cart);
        } else {
          console.warn('Customer document not found for user:', user.uid);
          setCartItems([]);
          setCustomerDocId(null);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setCartItems([]);
        setCustomerDocId(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchCartItems();
    }
  }, [user, loading]);

  // Update cart items in Firebase and local state
  const updateCartItems = async (updatedItems) => {
    if (!user || !customerDocId) return;

    try {
      const customerRef = doc(firestore, 'customers', customerDocId);
      await updateDoc(customerRef, {
        cart: updatedItems,
        lastUpdated: new Date().toISOString()
      });
      setCartItems(updatedItems);
      
      // Clean up selected items that no longer exist
      const itemIds = new Set(updatedItems.map(item => item.id));
      setSelectedItems(prev => new Set([...prev].filter(id => itemIds.has(id))));
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  // Handle quantity update
  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, updatedAt: new Date().toISOString() }
        : item
    );
    updateCartItems(updatedItems);
  };

  // Handle item removal
  const handleRemoveItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    updateCartItems(updatedItems);
  };

  // Handle removing selected items
  const handleRemoveSelected = () => {
    if (selectedItems.size === 0) return;
    
    const selectedCount = selectedItems.size;
    const confirmMessage = selectedCount === 1 
      ? 'Are you sure you want to remove this item from your cart?'
      : `Are you sure you want to remove ${selectedCount} items from your cart?`;
    
    if (window.confirm(confirmMessage)) {
      const updatedItems = cartItems.filter(item => !selectedItems.has(item.id));
      updateCartItems(updatedItems);
      setSelectedItems(new Set());
    }
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      updateCartItems([]);
      setSelectedItems(new Set());
    }
  };

  // Handle checkbox selection
  const handleItemSelect = (itemId, isSelected) => {
    const newSelectedItems = new Set(selectedItems);
    if (isSelected) {
      newSelectedItems.add(itemId);
    } else {
      newSelectedItems.delete(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  // Handle select all
  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (selectedItems.size === 0) return;

    // Get the selected cart items
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    
    // Calculate total quantity and total amount (if you have price in your items)
    const totalQuantity = selectedCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalAmount = selectedCartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

    // Navigate to checkout page with selected items data
    navigate('/checkout', {
      state: {
        selectedItems: selectedCartItems,
        totalQuantity: totalQuantity,
        totalAmount: totalAmount,
        userId: user.uid, // Keep this as userId for compatibility with checkout
        customerId: customerDocId, // Add customer document ID
        timestamp: new Date().toISOString()
      }
    });
  };

  // Check if all items are selected
  const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;
  const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < cartItems.length;

  // Calculate selected items total (if you have price in your items)
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  const selectedTotalQuantity = selectedCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const selectedTotalAmount = selectedCartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="pt-8 pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-slate-700/50 h-32 rounded-2xl mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-slate-700/30 h-32 rounded-2xl"></div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-700/30 h-80 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="pt-12 pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Please log in to view your cart
                </h2>
                <p className="text-gray-300">
                  You need to be logged in to access your cart items.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if customer document not found
  if (!customerDocId && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="pt-12 pb-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Customer Profile Not Found
                </h2>
                <p className="text-gray-300">
                  Unable to load your cart. Please contact support if this issue persists.
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
          {/* Header */}
          <div className="mb-8">
            <CartHeader 
              itemCount={cartItems.length}
              totalItems={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
              selectedCount={selectedItems.size}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onClearCart={handleClearCart}
              onRemoveSelected={handleRemoveSelected}
              onSelectAll={handleSelectAll}
              isAllSelected={isAllSelected}
              isPartiallySelected={isPartiallySelected}
            />
          </div>

          {/* Content */}
          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                  : "space-y-4"
                }>
                  {cartItems.map((item) => (
                    <CartItem
                      key={`${item.id}-${item.addedAt}`}
                      item={item}
                      onQuantityUpdate={handleQuantityUpdate}
                      onRemove={handleRemoveItem}
                      onSelect={handleItemSelect}
                      isSelected={selectedItems.has(item.id)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>

              {/* Checkout Section */}
              <div className="lg:col-span-1">
                {selectedItems.size > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 sticky top-8">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Checkout Summary
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-300">
                        <span>Selected Items:</span>
                        <span className="text-white font-medium">{selectedItems.size}</span>
                      </div>
                      
                      <div className="flex justify-between text-gray-300">
                        <span>Total Quantity:</span>
                        <span className="text-white font-medium">{selectedTotalQuantity}</span>
                      </div>
                      
                      {selectedTotalAmount > 0 && (
                        <div className="flex justify-between text-gray-300 pt-2 border-t border-white/20">
                          <span>Total Amount:</span>
                          <span className="text-white font-semibold text-lg">
                            ₱{selectedTotalAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleProceedToCheckout}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToCart;