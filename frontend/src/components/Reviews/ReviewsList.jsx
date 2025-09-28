// ReviewsList.jsx - List component for displaying reviews
import React from "react";
import { Star, Calendar, Package, MapPin, Clock } from "lucide-react";

const ReviewsList = ({ reviews, isVisible }) => {
  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-600"
            }`}
            size={16}
          />
        ))}
        <span className="text-gray-400 text-sm ml-2">({rating}/5)</span>
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-8 max-w-md mx-auto">
          <Star className="text-gray-600 mx-auto mb-4" size={48} />
          <h3 className="text-gray-400 text-lg font-semibold mb-2">
            No Reviews Found
          </h3>
          <p className="text-gray-500 text-sm">
            No reviews match your current filters. Try adjusting your search
            criteria.
          </p>
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
        {reviews.map((review, index) => (
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
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Star className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    Order #{review.rentalId}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Reviewed on {formatDate(review.createdAt)}
                  </p>
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
                {review.reviewText}
              </p>
            </div>

            {/* Rental Items */}
            {review.items && review.items.length > 0 && (
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
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">
                          {item.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Qty: {item.quantity}
                          {item.size && ` • Size: ${item.size}`}
                          {item.price && ` • ${formatCurrency(item.price)}`}
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
                        <p className="text-xs text-gray-500">Rental Period</p>
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
                        <p className="text-xs text-gray-500">Total Amount</p>
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
                        <p className="text-xs text-gray-500">Service Type</p>
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
              </div>

              {/* Submission Time */}
              <div className="flex items-center space-x-2 text-gray-500 text-xs">
                <Clock size={12} />
                <span>
                  Submitted {formatDate(review.createdAt)}
                  {review.updatedAt &&
                    new Date(review.updatedAt) > new Date(review.createdAt) && (
                      <span> (Updated {formatDate(review.updatedAt)})</span>
                    )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button (if needed for pagination) */}
      {reviews.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Showing all {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
