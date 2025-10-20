import React, { useState, useEffect } from "react";
import { Star, ArrowRight, ShoppingCart, Eye, Sparkles } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "../Authentication/Toast";

export default function Featured() {
  const [products, setProducts] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    fetchFeaturedProducts();
    return () => clearTimeout(timer);
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);

      // Fetch featured products that are approved and active
      const productsRef = collection(firestore, "products");
      const q = query(
        productsRef,
        where("featured", "==", true),
        where("approved", "==", true),
        where("status", "==", "active")
      );

      const productsSnapshot = await getDocs(q);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        firestoreId: doc.id,
        ...doc.data(),
      }));

      // Fetch all reviews to calculate ratings
      const reviewsRef = collection(firestore, "reviews");
      const reviewsQuery = query(
        reviewsRef,
        where("status", "==", "published")
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);

      // Calculate review stats for each product
      const stats = {};
      reviewsSnapshot.docs.forEach((doc) => {
        const review = doc.data();
        const items = review.items || [];

        items.forEach((item) => {
          const productId = item.productId || item.id;
          if (!stats[productId]) {
            stats[productId] = {
              totalRating: 0,
              count: 0,
            };
          }
          stats[productId].totalRating += review.rating || 0;
          stats[productId].count += 1;
        });
      });

      setProducts(productsList);
      setReviewStats(stats);
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
      showError("Failed to load featured products");
    } finally {
      setLoading(false);
    }
  };

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

  const handleRentNow = (product) => {
    if (!user) {
      showInfo("Please log in to rent products", 4000);
      return;
    }

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

  const handleAddToCart = async (product) => {
    if (!user) {
      showInfo("Please log in to add items to cart", 4000);
      return;
    }

    setIsAddingToCart((prev) => ({ ...prev, [product.id]: true }));

    try {
      const customerDoc = await findCustomerDoc(user.uid);

      if (!customerDoc) {
        showError("Customer profile not found. Please contact support.", 4000);
        return;
      }

      const currentCart = customerDoc.data.cart || [];
      const existingItemIndex = currentCart.findIndex(
        (item) => item.id === product.id
      );

      let updatedCart;
      if (existingItemIndex !== -1) {
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

      const customerRef = doc(firestore, "customers", customerDoc.id);
      await updateDoc(customerRef, {
        cart: updatedCart,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError("Failed to add item to cart. Please try again.", 4000);
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars ? "text-yellow-400 fill-current" : "text-gray-500"
          }`}
        />
      );
    }

    return stars;
  };

  const getProductRating = (productId) => {
    const stats = reviewStats[productId];
    if (!stats || stats.count === 0) return { rating: 0, count: 0 };

    return {
      rating: (stats.totalRating / stats.count).toFixed(1),
      count: stats.count,
    };
  };

  const isNewProduct = (createdAt) => {
    if (!createdAt) return false;

    const productDate = createdAt.toDate
      ? createdAt.toDate()
      : new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return productDate > thirtyDaysAgo;
  };

  const getBadgeInfo = (product) => {
    const stats = reviewStats[product.id];
    const isNew = isNewProduct(product.createdAt);

    // Priority: New > High Rating > Default
    if (isNew) {
      return { text: "NEW", color: "from-emerald-500 to-teal-500" };
    }

    if (stats && stats.count >= 5 && stats.totalRating / stats.count >= 4.5) {
      return { text: "POPULAR", color: "from-orange-500 to-red-500" };
    }

    if (stats && stats.count >= 10) {
      return { text: "BEST SELLER", color: "from-blue-500 to-cyan-500" };
    }

    return { text: "FEATURED", color: "from-purple-500 to-pink-500" };
  };

  const formatPrice = (price) => {
    return `₱${price?.toLocaleString() || "0"}`;
  };

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="w-24 h-24 mb-6 bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-full flex items-center justify-center border border-gray-700/50">
        <ShoppingCart className="w-12 h-12 text-gray-500" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">
        No Featured Products
      </h3>
      <p className="text-lg text-center max-w-sm">
        Products will appear here once they are marked as featured in the admin
        panel.
      </p>
    </div>
  );

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-white/60 mt-4">Loading featured products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements - pointer-events-none */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating particles effect - pointer-events-none */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <p className="text-sm font-bold uppercase tracking-widest text-purple-400">
              Featured Products
            </p>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse bg-300% animate-gradient-x">
              Featured Rentals
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 blur-2xl -z-10 pointer-events-none"></div>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Our most popular cameras and gear — ready for your next capture
          </p>

          {/* Decorative line */}
          <div className="flex justify-center mt-8">
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
          {products.length > 0 ? (
            products.map((product, index) => {
              const { rating, count } = getProductRating(product.id);
              const badge = getBadgeInfo(product);

              return (
                <div
                  key={product.id}
                  className={`group relative overflow-hidden transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Card background */}
                  <div className="relative bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 rounded-3xl border border-gray-700/50 group-hover:border-purple-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm h-full overflow-hidden">
                    {/* Animated border glow - pointer-events-none */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-sm -z-10 pointer-events-none"></div>

                    {/* Hover overlay effect - pointer-events-none */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>

                    {/* Product Image */}
                    <div className="relative h-64 overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-700 to-gray-800">
                      <img
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                        src={product.imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />

                      {/* Badge */}
                      <div
                        className={`absolute top-4 left-4 px-3 py-1 bg-gradient-to-r ${badge.color} rounded-full text-white text-xs font-bold uppercase tracking-wide shadow-lg pointer-events-none`}
                      >
                        {badge.text}
                      </div>

                      {/* Hover actions */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-20">
                        <button
                          onClick={() => navigate("/products")}
                          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors duration-200"
                        >
                          <Eye className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 relative z-10">
                      <div className="flex items-baseline mb-2">
                        <div className="text-gray-400 text-xs uppercase font-semibold tracking-wide">
                          {product.brand}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-white">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-gray-400 text-sm ml-1">
                            / day
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {renderStars(parseFloat(rating))}
                          </div>
                          <span className="text-gray-400 text-sm">
                            {count > 0 ? `(${count})` : "(No reviews)"}
                          </span>
                        </div>
                      </div>

                      {/* Category badge */}
                      {product.category && (
                        <div className="mb-4">
                          <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">
                            {product.category}
                          </span>
                          {product.subCategory && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded ml-1">
                              {product.subCategory}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2 relative z-20">
                        <button
                          onClick={() => handleRentNow(product)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold text-sm hover:scale-105 transition-all duration-300"
                        >
                          Rent Now
                        </button>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isAddingToCart[product.id]}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-lg text-white font-medium text-sm hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingToCart[product.id] ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Floating elements - pointer-events-none */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300 pointer-events-none"></div>
                    <div
                      className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-500/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 pointer-events-none"
                      style={{ animationDelay: "0.5s" }}
                    ></div>

                    {/* Interactive arrow - pointer-events-none */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:transform group-hover:translate-x-1 pointer-events-none">
                      <ArrowRight className="w-5 h-5 text-purple-400" />
                    </div>

                    {/* Shimmer effect - pointer-events-none */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Call to action section */}
        {products.length > 0 && (
          <div
            className={`text-center mt-16 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <button
              onClick={() => navigate("/productsPage")}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden z-10"
            >
              <span className="relative z-10 flex items-center gap-2">
                Browse All Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-700 pointer-events-none"></div>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }

        .bg-300\% {
          background-size: 300% 300%;
        }
      `}</style>
    </section>
  );
}
