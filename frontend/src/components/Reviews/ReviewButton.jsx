// ReviewButton.jsx - Button component for completed rentals
import React from "react";
import { Star } from "lucide-react";

const ReviewButton = ({ rental, onOpenReviewModal }) => {
  const isCompleted =
    rental.status === "completed" ||
    (rental.status === "confirmed" && rental.itemReturned === true) ||
    (rental.status === "confirmed" &&
      rental.endDate &&
      new Date() > new Date(rental.endDate));

  const hasReview = rental.hasReview;

  if (!isCompleted) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      {hasReview ? (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <Star className="w-4 h-4 fill-current" />
          <span>Review submitted</span>
        </div>
      ) : (
        <button
          onClick={() => onOpenReviewModal(rental)}
          className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg transition-colors text-sm w-full justify-center"
        >
          <Star className="w-4 h-4" />
          Rate & Review
        </button>
      )}
    </div>
  );
};

export default ReviewButton;
