import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import HeartIcon from "./HeartIcon";
import { useWishlist } from "../../hooks/useWishlist";
import { useToast } from "../Authentication/Toast";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { toggleWishlist, isInWishlist, isLoggedIn } = useWishlist();
  const { showSuccess, showError, showInfo } = useToast();
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Find customer document by firebaseUid
  const findCustomerDoc = async (firebaseUid) => {
    try {
      const customersRef = collection(firestore, "customers");
      const q = query(customersRef, where("firebaseUid", "==", firebaseUid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const customerDoc = querySnapshot.docs[0];
        return {
          id: customerDoc.id,
          data: customerDoc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error finding customer document:", error);
      return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "out of stock":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatPrice = (price) => {
    return `₱${price?.toLocaleString() || "0"}`;
  };

  const handleRentNow = () => {
    if (!user) {
      showInfo("Please log in to rent products", 4000);
      return;
    }

    if (product.status === "out of stock") {
      showError("This product is currently out of stock", 4000);
      return;
    }

    // Create a cart item format for single product rental
    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      subCategory: product.subCategory,
      description: product.description,
      quantity: 1,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Navigate directly to checkout with the single product
    navigate("/checkout", {
      state: {
        selectedItems: [cartItem],
        totalQuantity: 1,
        totalAmount: product.price || 0,
        userId: user.uid,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const handleAddToCart = async () => {
    if (!user) {
      showInfo("Please log in to add items to cart", 4000);
      return;
    }

    if (product.status === "out of stock") {
      showError("This product is currently out of stock", 4000);
      return;
    }

    setIsAddingToCart(true);

    try {
      // Find customer document
      const customerDoc = await findCustomerDoc(user.uid);

      if (!customerDoc) {
        showError("Customer profile not found. Please contact support.", 4000);
        return;
      }

      // Get current cart
      const currentCart = customerDoc.data.cart || [];

      // Check if item already exists in cart
      const existingItemIndex = currentCart.findIndex(
        (item) => item.id === product.id
      );

      let updatedCart;
      if (existingItemIndex !== -1) {
        // Item exists, increase quantity
        updatedCart = currentCart.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: (item.quantity || 1) + 1,
                updatedAt: new Date().toISOString(),
              }
            : item
        );
        showSuccess(`${product.name} quantity increased in cart`, 3000);
      } else {
        // Item doesn't exist, add new item
        const newCartItem = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          subCategory: product.subCategory,
          description: product.description,
          quantity: 1,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updatedCart = [...currentCart, newCartItem];
        showSuccess(`${product.name} added to cart`, 3000);
      }

      // Update cart in Firestore
      const customerRef = doc(firestore, "customers", customerDoc.id);
      await updateDoc(customerRef, {
        cart: updatedCart,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError("Failed to add item to cart. Please try again.", 4000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      showInfo("Please log in to add items to your wishlist", 4000);
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
        showError("Failed to update wishlist. Please try again.", 4000);
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      showError("Something went wrong. Please try again.", 4000);
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
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback placeholder */}
        <div
          className={`w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm ${
            product.imageUrl ? "hidden" : "flex"
          }`}
        >
          <svg
            className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z"
            />
          </svg>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
            {product.brand || "Unknown Brand"}
          </span>
          {/* Status Indicator */}
          <span
            className={`${getStatusColor(
              product.status
            )} text-white text-xs font-bold px-2 py-1 rounded`}
          >
            {product.status ? product.status.toUpperCase() : "UNKNOWN"}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 leading-tight">
          {product.name || "Unnamed Product"}
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

        {/* Button Container */}
        <div className="space-y-3">
          {/* Rent Now Button - Primary action */}
          <button
            disabled={product.status === "out of stock"}
            onClick={handleRentNow}
            className={`w-full ${
              product.status === "out of stock"
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
          >
            {product.status === "out of stock" ? "Out of Stock" : "Rent Now"}
          </button>

          {/* Add to Cart Button - Secondary action */}
          <button
            disabled={product.status === "out of stock" || isAddingToCart}
            onClick={handleAddToCart}
            className={`w-full ${
              product.status === "out of stock" || isAddingToCart
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            } text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6m-8 0V9a1 1 0 011-1h4a1 1 0 011 1v4M9 17h.01M15 17h.01"
                  />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
