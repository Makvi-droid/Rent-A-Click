// Reviews.jsx - Main Reviews Page Component
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

// Component imports
import ReviewsHeader from "../components/Reviews/ReviewsHeader";
import ReviewsBackground from "../components/Reviews/ReviewsBackground";
import ReviewsLoadingState from "../components/Reviews/ReviewsLoadingState";
import ReviewsEmptyState from "../components/Reviews/ReviewsEmptyState";
import ReviewsFilters from "../components/Reviews/ReviewsFilters";
import ReviewsList from "../components/Reviews/ReviewsList";
import ReviewsStats from "../components/Reviews/ReviewsStats";
import ReviewModal from "../components/Reviews/ReviewModal";
import ReviewsAuthRequired from "../components/Reviews/ReviewsAuthRequired";
import Navbar from "../components/Navbar";

const Reviews = () => {
  const [user, authLoading] = useAuthState(auth);
  const [customer, setCustomer] = useState(null);
  const [completedRentals, setCompletedRentals] = useState([]);
  const [allReviews, setAllReviews] = useState([]); // All published reviews
  const [myReviews, setMyReviews] = useState([]); // Current user's reviews
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // "all" or "my"

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch customer data first
  useEffect(() => {
    if (!user || authLoading) return;

    const fetchCustomer = async () => {
      try {
        // Query customers collection by firebaseUid
        const customersQuery = query(
          collection(db, "customers"),
          where("firebaseUid", "==", user.uid)
        );

        const customersSnapshot = await getDocs(customersQuery);

        if (!customersSnapshot.empty) {
          const customerDoc = customersSnapshot.docs[0];
          setCustomer({
            id: customerDoc.id,
            ...customerDoc.data(),
          });
        } else {
          setError(
            "Customer profile not found. Please complete your profile first."
          );
        }
      } catch (err) {
        console.error("Error fetching customer:", err);
        setError("Failed to load customer profile.");
      }
    };

    fetchCustomer();
  }, [user, authLoading]);

  // Date conversion function
  const convertFirebaseTimestamp = (timestamp) => {
    try {
      if (!timestamp) return null;
      if (timestamp instanceof Date)
        return isNaN(timestamp.getTime()) ? null : timestamp;
      if (timestamp && typeof timestamp.toDate === "function") {
        const date = timestamp.toDate();
        return isNaN(date.getTime()) ? null : date;
      }
      if (typeof timestamp === "number") {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
      }
      if (typeof timestamp === "string") {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
      }
      if (timestamp && timestamp.seconds) {
        const date = new Date(
          timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
        );
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    } catch (error) {
      console.error("Error converting timestamp:", error);
      return null;
    }
  };

  // Fetch all reviews and user's specific data
  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Query for ALL published reviews (public)
        const allReviewsQuery = query(
          collection(db, "reviews"),
          where("status", "==", "published"),
          orderBy("createdAt", "desc")
        );

        // Set up real-time listener for all reviews
        const unsubscribeAllReviews = onSnapshot(
          allReviewsQuery,
          (querySnapshot) => {
            const reviews = [];

            querySnapshot.forEach((doc) => {
              const reviewData = doc.data();
              reviews.push({
                id: doc.id,
                ...reviewData,
                createdAt:
                  convertFirebaseTimestamp(reviewData.createdAt) || new Date(),
                updatedAt:
                  convertFirebaseTimestamp(reviewData.updatedAt) || new Date(),
              });
            });

            setAllReviews(reviews);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error("Error fetching all reviews:", err);
            setError("Failed to load reviews.");
            setLoading(false);
          }
        );

        // If user is authenticated, also fetch their personal data
        let unsubscribeUserReviews = () => {};
        let unsubscribeRentals = () => {};

        if (user && customer) {
          // Fetch user's personal reviews (including unpublished ones)
          const userReviewsQuery = query(
            collection(db, "reviews"),
            where("firebaseUid", "==", user.uid),
            orderBy("createdAt", "desc")
          );

          unsubscribeUserReviews = onSnapshot(
            userReviewsQuery,
            (querySnapshot) => {
              const userReviews = [];

              querySnapshot.forEach((doc) => {
                const reviewData = doc.data();
                userReviews.push({
                  id: doc.id,
                  ...reviewData,
                  createdAt:
                    convertFirebaseTimestamp(reviewData.createdAt) ||
                    new Date(),
                  updatedAt:
                    convertFirebaseTimestamp(reviewData.updatedAt) ||
                    new Date(),
                });
              });

              setMyReviews(userReviews);
            }
          );

          // Fetch user's completed rentals
          const rentalsQuery = query(
            collection(db, "checkouts"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );

          unsubscribeRentals = onSnapshot(rentalsQuery, (querySnapshot) => {
            const rentals = [];
            const currentDate = new Date();

            querySnapshot.forEach((doc) => {
              const rentalData = doc.data();
              const rental = {
                id: doc.id,
                ...rentalData,
                createdAt:
                  convertFirebaseTimestamp(rentalData.createdAt) || new Date(),
                endDate: rentalData.rentalDetails?.endDate
                  ? convertFirebaseTimestamp(
                      rentalData.rentalDetails.endDate
                    ) ||
                    (typeof rentalData.rentalDetails.endDate === "string"
                      ? new Date(rentalData.rentalDetails.endDate)
                      : null)
                  : null,
              };

              // Check if rental is completed
              const isCompleted =
                rental.status === "completed" ||
                (rental.status === "confirmed" &&
                  rental.itemReturned === true) ||
                (rental.status === "confirmed" &&
                  rental.endDate &&
                  currentDate > new Date(rental.endDate));

              if (isCompleted) {
                rentals.push(rental);
              }
            });

            setCompletedRentals(rentals);
          });
        }

        // Return cleanup functions
        return () => {
          unsubscribeAllReviews();
          unsubscribeUserReviews();
          unsubscribeRentals();
        };
      } catch (err) {
        console.error("Error setting up listeners:", err);
        setError("Failed to load data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [user, customer, authLoading]);

  // Get rentals that don't have reviews yet
  const getRentalsWithoutReviews = () => {
    const reviewedRentalIds = myReviews.map((review) => review.rentalId);
    return completedRentals.filter(
      (rental) => !reviewedRentalIds.includes(rental.id)
    );
  };

  // Get the current reviews to display based on view mode
  const getCurrentReviews = () => {
    return viewMode === "my" ? myReviews : allReviews;
  };

  // Filter and sort reviews
  const getFilteredAndSortedReviews = () => {
    let filteredReviews = [...getCurrentReviews()];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredReviews = filteredReviews.filter(
        (review) =>
          review.rentalId?.toLowerCase().includes(query) ||
          review.reviewText?.toLowerCase().includes(query) ||
          review.items?.some((item) => item.name?.toLowerCase().includes(query))
      );
    }

    // Apply rating filter
    if (activeFilter !== "all") {
      const rating = parseInt(activeFilter);
      filteredReviews = filteredReviews.filter(
        (review) => review.rating === rating
      );
    }

    // Apply sorting
    filteredReviews.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filteredReviews;
  };

  const filteredReviews = getFilteredAndSortedReviews();
  const rentalsWithoutReviews = getRentalsWithoutReviews();
  const currentReviews = getCurrentReviews();

  // Calculate stats based on current view mode
  const stats = {
    totalReviews: currentReviews.length,
    averageRating:
      currentReviews.length > 0
        ? (
            currentReviews.reduce((sum, review) => sum + review.rating, 0) /
            currentReviews.length
          ).toFixed(1)
        : 0,
    pendingReviews: viewMode === "my" ? rentalsWithoutReviews.length : 0,
    fiveStars: currentReviews.filter((review) => review.rating === 5).length,
    fourStars: currentReviews.filter((review) => review.rating === 4).length,
    threeStars: currentReviews.filter((review) => review.rating === 3).length,
    twoStars: currentReviews.filter((review) => review.rating === 2).length,
    oneStar: currentReviews.filter((review) => review.rating === 1).length,
  };

  // Handle opening review modal
  const handleWriteReview = (rental) => {
    setSelectedRental(rental);
    setShowReviewModal(true);
  };

  // Handle closing review modal
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedRental(null);
  };

  // Show loading state while fetching user data
  if (authLoading) {
    return <ReviewsLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      <Navbar />
      <ReviewsBackground />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <ReviewsHeader
          isVisible={isVisible}
          customer={customer}
          stats={stats}
        />

        {/* View Mode Toggle */}
        <div
          className={`mb-8 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-medium">View Reviews:</h3>
              </div>

              <div className="flex bg-gray-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === "all"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  All Reviews ({allReviews.length})
                </button>
                {user && (
                  <button
                    onClick={() => setViewMode("my")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      viewMode === "my"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    My Reviews ({myReviews.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <ReviewsStats stats={stats} isVisible={isVisible} />

        {/* Show loading state */}
        {loading && <ReviewsLoadingState />}

        {/* Show error state */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-red-400 text-lg font-semibold mb-2">Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Show auth required message for "My Reviews" when not logged in */}
        {!user && viewMode === "my" && <ReviewsAuthRequired />}

        {/* Show empty state if no reviews */}
        {!loading &&
          !error &&
          currentReviews.length === 0 &&
          (viewMode === "all" || (viewMode === "my" && user)) && (
            <ReviewsEmptyState
              type={
                viewMode === "my" && completedRentals.length === 0
                  ? "no-rentals"
                  : "no-reviews"
              }
            />
          )}

        {/* Show pending reviews if there are completed rentals without reviews (only in "my" view) */}
        {!loading &&
          !error &&
          user &&
          viewMode === "my" &&
          rentalsWithoutReviews.length > 0 && (
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
                <h3 className="text-blue-400 text-lg font-semibold mb-4">
                  📝 Write Reviews for Completed Rentals
                </h3>
                <div className="grid gap-4">
                  {rentalsWithoutReviews.slice(0, 3).map((rental) => (
                    <div
                      key={rental.id}
                      className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-gray-300 font-medium">
                          Order #{rental.id}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {rental.items?.length || 0} item(s) • Completed{" "}
                          {new Date(
                            rental.endDate || rental.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleWriteReview(rental)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
                      >
                        Write Review
                      </button>
                    </div>
                  ))}
                  {rentalsWithoutReviews.length > 3 && (
                    <p className="text-gray-400 text-sm text-center">
                      +{rentalsWithoutReviews.length - 3} more completed rentals
                      waiting for reviews
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Show reviews section if there are any reviews */}
        {!loading &&
          !error &&
          currentReviews.length > 0 &&
          (viewMode === "all" || user) && (
            <>
              {/* Filters and Search */}
              <ReviewsFilters
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                totalResults={filteredReviews.length}
                isVisible={isVisible}
                stats={stats}
                viewMode={viewMode}
              />

              {/* Reviews List */}
              <ReviewsList
                reviews={filteredReviews}
                isVisible={isVisible}
                viewMode={viewMode}
                currentUser={user}
              />
            </>
          )}
      </div>

      {/* Review Modal - only show if user is authenticated */}
      {showReviewModal && selectedRental && customer && user && (
        <ReviewModal
          rental={selectedRental}
          customer={customer}
          onClose={handleCloseReviewModal}
          onSuccess={() => {
            handleCloseReviewModal();
            // The reviews will be updated automatically via the real-time listener
          }}
        />
      )}
    </div>
  );
};

export default Reviews;
