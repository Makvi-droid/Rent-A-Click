// RatingStars.jsx - Reusable star rating component
import React from "react";
import { Star } from "lucide-react";

const RatingStars = ({
  rating,
  setRating,
  readOnly = false,
  size = "w-6 h-6",
}) => {
  const handleStarClick = (starRating) => {
    if (!readOnly && setRating) {
      setRating(starRating);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readOnly}
          className={`${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } transition-all duration-200`}
        >
          <Star
            className={`${size} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400 hover:text-yellow-400"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
