// MyRentals.jsx - Fixed version with working review functionality
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
} from "firebase/firestore";

// Component imports
import MyRentalsHeader from "../components/MyRentals/MyRentalsHeader";
import MyRentalsBackground from "../components/MyRentals/MyRentalsBackground";
import MyRentalsLoadingState from "../components/MyRentals/MyRentalsLoadingState";
import MyRentalsEmptyState from "../components/MyRentals/MyRentalsEmptyState";
import MyRentalsFilters from "../components/MyRentals/MyRentalsFilters";
import MyRentalsStats from "../components/MyRentals/MyRentalsStats";
import MyRentalsList from "../components/MyRentals/MyRentalsList";
import MyRentalsAuthRequired from "../components/MyRentals/MyRentalsAuthRequired";
import WriteReviewButton from "../components/Reviews/WriteReviewButton";
import ReviewModal from "../components/Reviews/ReviewModal"; // Added this import
import Navbar from "../components/Navbar";

const MyRentals = () => {
  const [user, authLoading] = useAuthState(auth);
  const [customer, setCustomer] = useState(null); // Added customer state
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Added review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch customer data first (Added this useEffect)
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
          console.warn("Customer profile not found");
          // Don't set error here as it might prevent the rest of the functionality
        }
      } catch (err) {
        console.error("Error fetching customer:", err);
        // Don't set error here as it might prevent the rest of the functionality
      }
    };

    fetchCustomer();
  }, [user, authLoading]);

  // Date conversion function (matching OrderManagement)
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

  // Fetch user's rentals from Firestore
  useEffect(() => {
    if (!user || authLoading) return;

    const fetchRentals = async () => {
      try {
        setLoading(true);

        // Query rentals for the current user
        const rentalsQuery = query(
          collection(db, "checkouts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(
          rentalsQuery,
          (querySnapshot) => {
            const userRentals = [];

            querySnapshot.forEach((doc) => {
              const rentalData = doc.data();
              userRentals.push({
                id: doc.id,
                ...rentalData,
                // Convert Firestore timestamps to JavaScript dates
                createdAt:
                  convertFirebaseTimestamp(rentalData.createdAt) || new Date(),
                updatedAt:
                  convertFirebaseTimestamp(rentalData.updatedAt) || new Date(),
                // FIXED: Properly access startDate and endDate from rentalDetails
                startDate: rentalData.rentalDetails?.startDate
                  ? convertFirebaseTimestamp(
                      rentalData.rentalDetails.startDate
                    ) ||
                    (typeof rentalData.rentalDetails.startDate === "string"
                      ? new Date(rentalData.rentalDetails.startDate)
                      : null)
                  : null,
                endDate: rentalData.rentalDetails?.endDate
                  ? convertFirebaseTimestamp(
                      rentalData.rentalDetails.endDate
                    ) ||
                    (typeof rentalData.rentalDetails.endDate === "string"
                      ? new Date(rentalData.rentalDetails.endDate)
                      : null)
                  : null,
                // Add pickup/delivery and return time information
                deliveryMethod:
                  rentalData.rentalDetails?.deliveryMethod || "pickup",
                pickupTime: rentalData.rentalDetails?.pickupTime || null,
                deliveryTime: rentalData.rentalDetails?.deliveryTime || null,
                returnTime: rentalData.rentalDetails?.returnTime || null,
                agreedPickupTime:
                  rentalData.rentalDetails?.agreedPickupTime || null,
                agreedDeliveryTime:
                  rentalData.rentalDetails?.agreedDeliveryTime || null,
                agreedReturnTime:
                  rentalData.rentalDetails?.agreedReturnTime || null,
              });
            });

            setRentals(userRentals);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error("Error fetching rentals:", err);
            setError("Failed to load your rentals. Please try again.");
            setLoading(false);
          }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up rentals listener:", err);
        setError("Failed to load your rentals. Please try again.");
        setLoading(false);
      }
    };

    fetchRentals();
  }, [user, authLoading]);

  // FIXED: Filter and sort rentals with proper status handling
  const getFilteredAndSortedRentals = () => {
    let filteredRentals = [...rentals];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredRentals = filteredRentals.filter(
        (rental) =>
          rental.id.toLowerCase().includes(query) ||
          rental.customerInfo?.fullName?.toLowerCase().includes(query) ||
          rental.items?.some((item) => item.name?.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (activeFilter !== "all") {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      filteredRentals = filteredRentals.filter((rental) => {
        const startDate = rental.startDate;
        const endDate = rental.endDate;

        switch (activeFilter) {
          case "active":
            // FIXED: Check if status is confirmed AND within rental period
            if (rental.status !== "confirmed") return false;
            if (!startDate || !endDate) return false;
            const startDateOnly = new Date(startDate);
            const endDateOnly = new Date(endDate);
            startDateOnly.setHours(0, 0, 0, 0);
            endDateOnly.setHours(23, 59, 59, 999);
            return currentDate >= startDateOnly && currentDate <= endDateOnly;

          case "upcoming":
            // FIXED: Check if status is confirmed AND start date is in future
            if (rental.status !== "confirmed") return false;
            if (!startDate) return false;
            const upcomingStart = new Date(startDate);
            upcomingStart.setHours(0, 0, 0, 0);
            return currentDate < upcomingStart;

          case "completed":
            // ONLY show rentals marked as "completed" by admin
            return rental.status === "completed";

          case "pending":
            return rental.status === "pending";

          case "confirmed":
            return rental.status === "confirmed";

          case "cancelled":
            return rental.status === "cancelled";

          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredRentals.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "start-date":
          const aStart = a.startDate ? new Date(a.startDate) : new Date(0);
          const bStart = b.startDate ? new Date(b.startDate) : new Date(0);
          return bStart - aStart;
        case "amount-high":
          return (b.pricing?.total || 0) - (a.pricing?.total || 0);
        case "amount-low":
          return (a.pricing?.total || 0) - (b.pricing?.total || 0);
        default:
          return 0;
      }
    });

    return filteredRentals;
  };

  const filteredRentals = getFilteredAndSortedRentals();

  // UPDATED: Calculate stats - completed only counts admin-marked completed
  const stats = {
    total: rentals.length,
    pending: rentals.filter((rental) => rental.status === "pending").length,
    confirmed: rentals.filter((rental) => rental.status === "confirmed").length,
    cancelled: rentals.filter((rental) => rental.status === "cancelled").length,
    completed: rentals.filter((rental) => rental.status === "completed").length,
    active: rentals.filter((rental) => {
      if (rental.status !== "confirmed") return false;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const startDate = rental.startDate;
      const endDate = rental.endDate;
      if (!startDate || !endDate) return false;
      const startDateOnly = new Date(startDate);
      const endDateOnly = new Date(endDate);
      startDateOnly.setHours(0, 0, 0, 0);
      endDateOnly.setHours(23, 59, 59, 999);
      return currentDate >= startDateOnly && currentDate <= endDateOnly;
    }).length,
    upcoming: rentals.filter((rental) => {
      if (rental.status !== "confirmed") return false;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const startDate = rental.startDate;
      if (!startDate) return false;
      const upcomingStart = new Date(startDate);
      upcomingStart.setHours(0, 0, 0, 0);
      return currentDate < upcomingStart;
    }).length,
    totalSpent: rentals
      .filter((rental) => rental.status !== "cancelled")
      .reduce((sum, rental) => sum + (rental.pricing?.total || 0), 0),
  };

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format pickup/delivery and return time information
  const formatPickupDeliveryInfo = (rental) => {
    const info = {
      method: rental.deliveryMethod || "pickup",
      pickupDeliveryTime: null,
      returnTime: null,
      agreedPickupDelivery: null,
      agreedReturn: null,
    };

    // Get pickup/delivery time
    if (rental.deliveryMethod === "delivery") {
      info.pickupDeliveryTime = rental.deliveryTime;
      info.agreedPickupDelivery = rental.agreedDeliveryTime;
    } else {
      info.pickupDeliveryTime = rental.pickupTime;
      info.agreedPickupDelivery = rental.agreedPickupTime;
    }

    // Get return time
    info.returnTime = rental.returnTime;
    info.agreedReturn = rental.agreedReturnTime;

    return info;
  };

  // FIXED: Handle write review action - now opens modal instead of alert
  const handleWriteReview = (rental) => {
    if (!customer) {
      console.warn("Customer data not available");
      alert(
        "Customer profile not found. Please refresh the page and try again."
      );
      return;
    }

    setSelectedRental(rental);
    setShowReviewModal(true);
  };

  // Handle closing review modal
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedRental(null);
  };

  // Create customer object for WriteReviewButton
  const createCustomerFromRental = (rental) => {
    return (
      customer || {
        id: rental.userId,
        ...rental.customerInfo,
      }
    );
  };

  // Show loading state while fetching user data
  if (authLoading) {
    return <MyRentalsLoadingState />;
  }

  // Show auth required if user is not authenticated
  if (!user) {
    return <MyRentalsAuthRequired />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      <Navbar />
      <MyRentalsBackground />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <MyRentalsHeader
          isVisible={isVisible}
          user={user}
          stats={stats}
          formatCurrency={formatCurrency}
        />

        {/* Stats Overview */}
        <MyRentalsStats
          stats={stats}
          formatCurrency={formatCurrency}
          isVisible={isVisible}
        />

        {/* Show loading state */}
        {loading && <MyRentalsLoadingState />}

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

        {/* Show empty state if no rentals */}
        {!loading && !error && rentals.length === 0 && <MyRentalsEmptyState />}

        {/* Show rentals if available */}
        {!loading && !error && rentals.length > 0 && (
          <>
            {/* Filters and Search */}
            <MyRentalsFilters
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalResults={filteredRentals.length}
              isVisible={isVisible}
              stats={stats}
            />

            {/* Rentals List with Review Buttons */}
            <MyRentalsList
              rentals={filteredRentals}
              formatCurrency={formatCurrency}
              formatPickupDeliveryInfo={formatPickupDeliveryInfo}
              isVisible={isVisible}
              // Pass the WriteReviewButton component and handler
              WriteReviewButton={WriteReviewButton}
              onWriteReview={handleWriteReview}
              createCustomerFromRental={createCustomerFromRental}
            />
          </>
        )}
      </div>

      {/* Review Modal - Added this section */}
      {showReviewModal && selectedRental && customer && (
        <ReviewModal
          rental={selectedRental}
          customer={customer}
          onClose={handleCloseReviewModal}
          onSuccess={() => {
            handleCloseReviewModal();
            // The reviews will be updated automatically if you have real-time listeners
            // or you can add a success message here
            alert("Review submitted successfully!");
          }}
        />
      )}
    </div>
  );
};

export default MyRentals;
