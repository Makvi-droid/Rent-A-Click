// ReviewsHeader.jsx - Header component for Reviews page
import React from "react";
import { Star, MessageSquare, PenTool } from "lucide-react";

const ReviewsHeader = ({ isVisible, customer, stats }) => {
  return (
    <div
      className={`text-center mb-12 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Main Title */}
      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            My Reviews
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Share your experiences and help others make informed rental decisions
        </p>
      </div>

      {/* Welcome Message */}
      {customer && (
        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <MessageSquare className="text-blue-400" size={24} />
            <h2 className="text-2xl font-bold text-white">
              Welcome back,{" "}
              {customer.firstName || customer.fullName || "Valued Customer"}!
            </h2>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Total Reviews */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <MessageSquare className="text-blue-400" size={20} />
                <span className="text-2xl font-bold text-white">
                  {stats.totalReviews}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Total Reviews</p>
            </div>

            {/* Average Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                <span className="text-2xl font-bold text-white">
                  {stats.averageRating}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Average Rating</p>
            </div>

            {/* Pending Reviews */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <PenTool className="text-green-400" size={20} />
                <span className="text-2xl font-bold text-white">
                  {stats.pendingReviews}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Pending Reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Stars */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-pulse ${
              i % 2 === 0 ? "animate-bounce" : "animate-pulse"
            }`}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + ((i * 10) % 30)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            <Star
              className="text-yellow-400/20 fill-yellow-400/20"
              size={16 + (i % 3) * 8}
            />
          </div>
        ))}

        {/* Floating Message Icons */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`msg-${i}`}
            className="absolute animate-float"
            style={{
              right: `${5 + i * 20}%`,
              top: `${30 + ((i * 15) % 25)}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + i * 0.3}s`,
            }}
          >
            <MessageSquare
              className="text-blue-400/20"
              size={12 + (i % 2) * 6}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsHeader;
