// ReviewsStats.jsx - Statistics overview for Reviews page
import React from "react";
import { Star, MessageSquare, PenTool, TrendingUp } from "lucide-react";

const ReviewsStats = ({ stats, isVisible }) => {
  // Calculate rating distribution percentages
  const totalRatings = stats.totalReviews;
  const ratingDistribution = [
    { stars: 5, count: stats.fiveStars, color: "bg-green-500" },
    { stars: 4, count: stats.fourStars, color: "bg-blue-500" },
    { stars: 3, count: stats.threeStars, color: "bg-yellow-500" },
    { stars: 2, count: stats.twoStars, color: "bg-orange-500" },
    { stars: 1, count: stats.oneStar, color: "bg-red-500" },
  ];

  return (
    <div
      className={`mb-12 transition-all duration-1000 delay-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Reviews */}
        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <MessageSquare className="text-blue-400" size={24} />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {stats.totalReviews}
              </p>
              <p className="text-gray-400 text-sm">Total Reviews</p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full w-full"></div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Star className="text-yellow-400 fill-yellow-400" size={24} />
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold text-white">
                  {stats.averageRating}
                </p>
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
              </div>
              <p className="text-gray-400 text-sm">Average Rating</p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${(parseFloat(stats.averageRating) / 5) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <PenTool className="text-green-400" size={24} />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {stats.pendingReviews}
              </p>
              <p className="text-gray-400 text-sm">Pending Reviews</p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width:
                  stats.pendingReviews > 0
                    ? `${Math.min((stats.pendingReviews / 10) * 100, 100)}%`
                    : "0%",
              }}
            ></div>
          </div>
        </div>

        {/* Review Activity */}
        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="text-purple-400" size={24} />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {stats.totalReviews > 0 ? "Active" : "New"}
              </p>
              <p className="text-gray-400 text-sm">Review Status</p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {stats.totalReviews > 0 && (
        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center space-x-2">
            <Star className="text-yellow-400 fill-yellow-400" size={20} />
            <span>Rating Distribution</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rating Bars */}
            <div className="space-y-3">
              {ratingDistribution.map((rating) => {
                const percentage =
                  totalRatings > 0 ? (rating.count / totalRatings) * 100 : 0;

                return (
                  <div
                    key={rating.stars}
                    className="flex items-center space-x-3"
                  >
                    <div className="flex items-center space-x-1 w-12">
                      <span className="text-white text-sm">{rating.stars}</span>
                      <Star
                        className="text-yellow-400 fill-yellow-400"
                        size={12}
                      />
                    </div>

                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className={`${rating.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <div className="w-16 text-right">
                      <span className="text-gray-400 text-sm">
                        {rating.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rating Summary */}
            <div className="flex flex-col justify-center">
              <div className="text-center bg-gray-900/50 rounded-lg p-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="text-yellow-400 fill-yellow-400" size={32} />
                  <span className="text-4xl font-bold text-white">
                    {stats.averageRating}
                  </span>
                </div>
                <p className="text-gray-400 mb-1">Average Rating</p>
                <p className="text-gray-500 text-sm">
                  Based on {stats.totalReviews} review
                  {stats.totalReviews !== 1 ? "s" : ""}
                </p>

                {/* Star Rating Display */}
                <div className="flex items-center justify-center space-x-1 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`${
                        star <= Math.round(parseFloat(stats.averageRating))
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }`}
                      size={20}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsStats;
