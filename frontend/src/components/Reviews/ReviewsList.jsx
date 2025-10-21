// ReviewsList.jsx - List component for displaying reviews with full transparency
import React from "react";
import { Star, Calendar, Package, MapPin, Clock, User } from "lucide-react";

const ReviewsList = ({ reviews, isVisible, viewMode = "all", currentUser }) => {
  // Enhanced helper function to format date with better error handling
  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      let dateObj;

      // Handle different date formats
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === "string") {
        if (date.trim() === "") return "N/A";
        dateObj = new Date(date);
      } else if (typeof date === "number") {
        dateObj = new Date(date);
      } else if (date && typeof date === "object") {
        if (date.toDate && typeof date.toDate === "function") {
          dateObj = date.toDate();
        } else if (date.seconds) {
          dateObj = new Date(date.seconds * 1000);
        } else {
          return "N/A";
        }
      } else {
        return "N/A";
      }

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date encountered:", date);
        return "N/A";
      }

      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", date);
      return "N/A";
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    try {
      const numAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return "N/A";

      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(numAmount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return "N/A";
    }
  };

  // Helper function to render star rating
  const renderStars = (rating) => {
    const validRating =
      typeof rating === "number" && !isNaN(rating)
        ? Math.max(0, Math.min(5, rating))
        : 0;

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${
              star <= validRating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-600"
            }`}
            size={16}
          />
        ))}
        <span className="text-gray-400 text-sm ml-2">({validRating}/5)</span>
      </div>
    );
  };

  // Helper function to get reviewer info display with FULL TRANSPARENCY
  const getReviewerDisplay = (review) => {
    const isOwnReview = currentUser && review.firebaseUid === currentUser.uid;

    if (isOwnReview) {
      return {
        name: "You",
        isCurrentUser: true,
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
      };
    } else {
      // Show real customer name with full transparency
      const displayName =
        review.customerName ||
        review.reviewerName ||
        (review.customerEmail ? review.customerEmail.split("@")[0] : null) ||
        "Anonymous Customer";

      return {
        name: displayName,
        isCurrentUser: false,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
      };
    }
  };

  // Safety check for reviews array
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    const emptyMessage =
      viewMode === "my"
        ? "You haven't written any reviews yet"
        : "No reviews found matching your filters";

    const emptyDescription =
      viewMode === "my"
        ? "Complete a rental and write your first review!"
        : "Try adjusting your search criteria or check back later.";

    return (
      <div className="text-center py-12">
        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-8 max-w-md mx-auto">
          <Star className="text-gray-600 mx-auto mb-4" size={48} />
          <h3 className="text-gray-400 text-lg font-semibold mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500 text-sm">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-1000 delay-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="grid gap-6">
        {reviews
          .map((review, index) => {
            // Add safety checks for review object
            if (!review || !review.id) {
              console.warn("Invalid review object at index:", index, review);
              return null;
            }

            const reviewerInfo = getReviewerDisplay(review);

            return (
              <div
                key={review.id}
                className={`bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300 transform hover:scale-[1.02] ${
                  index % 2 === 0 ? "ml-0 mr-4" : "ml-4 mr-0"
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Review Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-2 md:mb-0">
                    <div className={`p-2 ${reviewerInfo.bgColor} rounded-lg`}>
                      {reviewerInfo.isCurrentUser ? (
                        <User className={reviewerInfo.color} size={20} />
                      ) : (
                        <Star className={reviewerInfo.color} size={20} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {reviewerInfo.isCurrentUser && (
                          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                            Your Review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className={`${reviewerInfo.color} font-medium`}>
                          by {reviewerInfo.name}
                        </span>
                        <span className="text-gray-500">•</span>
                        <p className="text-gray-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-gray-300 leading-relaxed">
                    {review.reviewText || "No review text provided"}
                  </p>
                </div>

                {/* Rental Items */}
                {review.items &&
                  Array.isArray(review.items) &&
                  review.items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                        <Package size={16} />
                        <span>Items Reviewed</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {review.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="bg-gray-900/50 rounded-lg p-3 flex items-center space-x-3"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name || "Rental item"}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">
                                {item.name || "Unnamed Item"}
                              </p>
                              <p className="text-gray-400 text-xs">
                                Qty: {item.quantity || 1}
                                {item.size && ` • Size: ${item.size}`}
                                {item.price &&
                                  ` • ${formatCurrency(item.price)}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Rental Details */}
                {review.rentalDetails && (
                  <div className="border-t border-gray-700/50 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Rental Period */}
                      {(review.rentalDetails.startDate ||
                        review.rentalDetails.endDate) && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Calendar size={14} />
                          <div>
                            <p className="text-xs text-gray-500">
                              Rental Period
                            </p>
                            <p className="text-white">
                              {formatDate(review.rentalDetails.startDate)} -{" "}
                              {formatDate(review.rentalDetails.endDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Total Amount */}
                      {review.rentalDetails.totalAmount && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Package size={14} />
                          <div>
                            <p className="text-xs text-gray-500">
                              Total Amount
                            </p>
                            <p className="text-white font-medium">
                              {formatCurrency(review.rentalDetails.totalAmount)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Delivery Method */}
                      {review.rentalDetails.deliveryMethod && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <MapPin size={14} />
                          <div>
                            <p className="text-xs text-gray-500">
                              Service Type
                            </p>
                            <p className="text-white capitalize">
                              {review.rentalDetails.deliveryMethod}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Review Status & Verification */}
                <div className="border-t border-gray-700/50 pt-4 mt-4 flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    {/* Verified Purchase Badge */}
                    {review.isVerifiedPurchase && (
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Verified Purchase</span>
                      </div>
                    )}

                    {/* Review Status */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        review.status === "published"
                          ? "bg-blue-500/20 text-blue-400"
                          : review.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {review.status === "published"
                        ? "Published"
                        : review.status === "pending"
                        ? "Under Review"
                        : "Hidden"}
                    </div>

                    {/* Show in "All Reviews" if this is current user's review */}
                    {viewMode === "all" && reviewerInfo.isCurrentUser && (
                      <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium">
                        Your Review
                      </div>
                    )}
                  </div>

                  {/* Submission Time */}
                  <div className="flex items-center space-x-2 text-gray-500 text-xs">
                    <Clock size={12} />
                    <span>
                      Submitted {formatDate(review.createdAt)}
                      {review.updatedAt &&
                        formatDate(review.updatedAt) !== "N/A" &&
                        formatDate(review.createdAt) !== "N/A" &&
                        new Date(review.updatedAt) >
                          new Date(review.createdAt) && (
                          <span> (Updated {formatDate(review.updatedAt)})</span>
                        )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
          .filter(Boolean)}
      </div>

      {/* Load More Button (if needed for pagination) */}
      {reviews.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Showing all {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            {viewMode === "my" && " (your reviews)"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
