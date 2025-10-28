import React, { useState, useEffect } from "react";
import {
  Star,
  ArrowRight,
  ShoppingCart,
  Eye,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";
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

      const reviewsRef = collection(firestore, "reviews");
      const reviewsQuery = query(
        reviewsRef,
        where("status", "==", "published")
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);

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
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-all duration-300 ${
          i < Math.floor(rating)
            ? "text-amber-400 fill-amber-400"
            : "text-gray-600"
        }`}
      />
    ));
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

    if (isNew) {
      return {
        text: "NEW",
        icon: Sparkles,
        gradient: "from-emerald-400 via-teal-400 to-cyan-400",
        glow: "shadow-emerald-500/50",
      };
    }

    if (stats && stats.count >= 5 && stats.totalRating / stats.count >= 4.5) {
      return {
        text: "POPULAR",
        icon: TrendingUp,
        gradient: "from-orange-400 via-red-400 to-pink-400",
        glow: "shadow-orange-500/50",
      };
    }

    if (stats && stats.count >= 10) {
      return {
        text: "BEST SELLER",
        icon: Award,
        gradient: "from-blue-400 via-indigo-400 to-purple-400",
        glow: "shadow-blue-500/50",
      };
    }

    return {
      text: "FEATURED",
      icon: Zap,
      gradient: "from-purple-400 via-fuchsia-400 to-pink-400",
      glow: "shadow-purple-500/50",
    };
  };

  const formatPrice = (price) => {
    return `₱${price?.toLocaleString() || "0"}`;
  };

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-purple-500/30">
          <ShoppingCart className="w-16 h-16 text-purple-400" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>
      <h3 className="text-3xl font-bold text-white mt-8 mb-3">
        No Featured Products Yet
      </h3>
      <p className="text-lg text-gray-400 text-center max-w-md">
        Amazing products will appear here once they're featured by our team
      </p>
    </div>
  );

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-transparent to-blue-900/5"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="relative inline-flex">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse"></div>
            </div>
            <p className="text-gray-400 mt-6 text-lg">
              Curating featured products...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-transparent to-blue-900/5"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 relative z-10">
        {/* Enhanced Header */}
        <div
          className={`text-center mb-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 backdrop-blur-xl px-6 py-3 rounded-full mb-6 border border-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Featured Collection
            </span>
          </div>

          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 relative">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Premium
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x bg-300%">
              Rentals
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Handpicked gear trusted by professionals worldwide
          </p>

          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.length > 0 ? (
            products.map((product, index) => {
              const { rating, count } = getProductRating(product.id);
              const badge = getBadgeInfo(product);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={product.id}
                  className={`group relative transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-12"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-slate-900/90 rounded-3xl border border-slate-700/50 group-hover:border-purple-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-xl overflow-hidden h-full">
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none"></div>

                    {/* Product Image */}
                    <div className="relative h-72 overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-800 to-slate-900">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10 pointer-events-none"></div>

                      <img
                        className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                        src={product.imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />

                      {/* Enhanced Badge */}
                      <div
                        className={`absolute top-5 left-5 flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${badge.gradient} rounded-full shadow-lg ${badge.glow} backdrop-blur-sm z-20`}
                      >
                        <BadgeIcon className="w-4 h-4 text-white" />
                        <span className="text-white text-xs font-bold uppercase tracking-wide">
                          {badge.text}
                        </span>
                      </div>

                      {/* Quick View Button */}
                      <div className="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={() => navigate("/products")}
                          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-purple-500 hover:scale-110 transition-all duration-200 border border-white/20"
                        >
                          <Eye className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-7 relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase font-bold tracking-widest text-purple-400">
                          {product.brand}
                        </span>
                        {product.category && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                            {product.category}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className="flex items-center gap-1">
                          {renderStars(parseFloat(rating))}
                        </div>
                        <span className="text-sm text-gray-400 font-medium">
                          {count > 0 ? `${rating} (${count})` : "No reviews"}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-6 pb-6 border-b border-slate-700/50">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-gray-500 text-sm font-medium">
                            / day
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={() => handleRentNow(product)}
                          className="w-full group/btn relative px-6 py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-xl text-white font-bold text-sm overflow-hidden hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Rent Now
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        </button>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isAddingToCart[product.id]}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-purple-500/50 rounded-xl text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
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

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState />
          )}
        </div>

        {/* CTA Section */}
        {products.length > 0 && (
          <div
            className={`text-center mt-20 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <button
              onClick={() => navigate("/productsPage")}
              className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl text-white font-bold text-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-3">
                Explore Full Catalog
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
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
        }

        .bg-300\% {
          background-size: 300% 300%;
        }
      `}</style>
    </section>
  );
}
