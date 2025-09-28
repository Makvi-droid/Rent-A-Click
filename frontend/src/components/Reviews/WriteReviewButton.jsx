// WriteReviewButton.jsx - Fixed version
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Star, MessageSquare } from "lucide-react";

const WriteReviewButton = ({ rental, customer, onWriteReview }) => {
  const [hasReview, setHasReview] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if this rental already has a review
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!customer || !rental || !auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Query by firebaseUid and rentalId instead of customerId and rentalId
        const reviewQuery = query(
          collection(db, "reviews"),
          where("firebaseUid", "==", auth.currentUser.uid),
          where("rentalId", "==", rental.id)
        );

        const reviewSnapshot = await getDocs(reviewQuery);
        setHasReview(!reviewSnapshot.empty);
      } catch (error) {
        console.error("Error checking existing review:", error);
        // Set hasReview to false if there's an error (fail gracefully)
        setHasReview(false);
      } finally {
        setLoading(false);
      }
    };

    checkExistingReview();
  }, [rental, customer]);

  // UPDATED: Only show button for rentals marked as "completed" by admin
  const isAdminCompleted = rental.status === "completed";

  // Don't show button if not completed by admin or still loading
  if (!isAdminCompleted || loading) {
    return null;
  }

  // Show "Review Submitted" status if review already exists
  if (hasReview) {
    return (
      <div className="flex items-center space-x-2 text-green-400 text-sm">
        <MessageSquare size={16} />
        <span>Review Submitted</span>
      </div>
    );
  }

  // Show "Write Review" button for completed rentals without reviews
  return (
    <button
      onClick={() => onWriteReview(rental)}
      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
    >
      <Star size={16} />
      <span>Write Review</span>
    </button>
  );
};

export default WriteReviewButton;
