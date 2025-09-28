// ReviewsLoadingState.jsx - Loading state for Reviews page
import React from "react";
import { Star, MessageSquare } from "lucide-react";

const ReviewsLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <MessageSquare className="text-blue-400 animate-pulse" size={48} />
            <Star
              className="text-yellow-400 fill-yellow-400 animate-bounce"
              size={48}
            />
          </div>

          {/* Loading Spinner */}
          <div className="relative mx-auto w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Loading Your Reviews
        </h2>
        <p className="text-gray-400 mb-8">Fetching your review history...</p>

        {/* Loading Skeleton Cards */}
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-800/30 rounded-xl p-6 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="w-24 h-3 bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className="w-4 h-4 bg-gray-700 rounded"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-700 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsLoadingState;
