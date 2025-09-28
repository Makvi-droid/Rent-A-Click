// ReviewModal.jsx - Modal for writing reviews
import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { X, Star, Send, AlertCircle } from "lucide-react";

const ReviewModal = ({ rental, customer, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError("Please select a rating");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write your review");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Create review document
      await addDoc(collection(db, "reviews"), {
        customerId: customer.id,
        customerName:
          customer.firstName && customer.lastName
            ? `${customer.firstName} ${customer.lastName}`
            : customer.fullName || "Anonymous",
        customerEmail: customer.email,
        firebaseUid: customer.firebaseUid,
        rentalId: rental.id,
        rating: rating,
        reviewText: reviewText.trim(),
        items: rental.items || [],
        rentalDetails: {
          startDate: rental.rentalDetails?.startDate || null,
          endDate: rental.rentalDetails?.endDate || null,
          totalAmount: rental.pricing?.total || 0,
          deliveryMethod: rental.rentalDetails?.deliveryMethod || "pickup",
        },
        status: "published", // Can be "published", "pending", "hidden"
        isVerifiedPurchase: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Helpful for analytics
        metadata: {
          rentalCompletedAt: rental.endDate || rental.createdAt,
          reviewSubmissionSource: "customer_portal",
        },
      });

      onSuccess();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Write a Review
            </h2>
            <p className="text-gray-400 text-sm">Order #{rental.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Rental Items */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Items Rented</h3>
            <div className="space-y-2">
              {rental.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-gray-800/50 rounded-lg p-3"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-gray-400 text-sm">
                      Qty: {item.quantity} • Size: {item.size || "N/A"}
                    </p>
                  </div>
                </div>
              )) || <p className="text-gray-400">No items found</p>}
            </div>
          </div>

          {/* Rating Section */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Your Rating</h3>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-colors p-1"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    } transition-colors`}
                  />
                </button>
              ))}
              <span className="ml-3 text-gray-400">
                {rating
                  ? `${rating} star${rating !== 1 ? "s" : ""}`
                  : "Select rating"}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">
              Your Review
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this rental..."
              rows="6"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              maxLength="1000"
            />
            <div className="flex justify-between mt-2">
              <p className="text-gray-400 text-sm">
                Tell others about the quality, fit, and your overall experience
              </p>
              <p className="text-gray-400 text-sm">{reviewText.length}/1000</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="text-red-400" size={16} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !rating || !reviewText.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
