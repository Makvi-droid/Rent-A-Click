// ReviewsFilters.jsx - Filters and search for Reviews page
import React from "react";
import { Search, Filter, SortAsc, Star } from "lucide-react";

const ReviewsFilters = ({
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  totalResults,
  isVisible,
  stats,
  viewMode = "all", // "all" or "my"
}) => {
  const filterOptions = [
    {
      key: "all",
      label: "All Reviews",
      count: stats.totalReviews,
      icon: null,
    },
    {
      key: "5",
      label: "5 Stars",
      count: stats.fiveStars,
      icon: <Star className="text-yellow-400 fill-yellow-400" size={14} />,
    },
    {
      key: "4",
      label: "4 Stars",
      count: stats.fourStars,
      icon: <Star className="text-yellow-400 fill-yellow-400" size={14} />,
    },
    {
      key: "3",
      label: "3 Stars",
      count: stats.threeStars,
      icon: <Star className="text-yellow-400 fill-yellow-400" size={14} />,
    },
    {
      key: "2",
      label: "2 Stars",
      count: stats.twoStars,
      icon: <Star className="text-yellow-400 fill-yellow-400" size={14} />,
    },
    {
      key: "1",
      label: "1 Star",
      count: stats.oneStar,
      icon: <Star className="text-yellow-400 fill-yellow-400" size={14} />,
    },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "rating-high", label: "Highest Rating" },
    { value: "rating-low", label: "Lowest Rating" },
  ];

  const getSearchPlaceholder = () => {
    return viewMode === "my"
      ? "Search your reviews by order ID, item name..."
      : "Search reviews by order ID, item name...";
  };

  const getFilterTitle = () => {
    return viewMode === "my"
      ? "Filter & Search My Reviews"
      : "Filter & Search All Reviews";
  };

  return (
    <div
      className={`mb-8 transition-all duration-1000 delay-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Filter className="text-blue-400" size={20} />
            <h3 className="text-white font-semibold">{getFilterTitle()}</h3>
            {viewMode === "my" && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                Personal
              </span>
            )}
          </div>

          <div className="text-gray-400 text-sm">
            Showing {totalResults} review{totalResults !== 1 ? "s" : ""}
            {viewMode === "my" && " (yours)"}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filter Options */}
          <div>
            <label className="block text-white font-medium mb-3">
              Filter by Rating
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFilter === option.key
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeFilter === option.key
                        ? "bg-blue-500/30 text-blue-300"
                        : "bg-gray-600 text-gray-400"
                    }`}
                  >
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="text-white font-medium mb-3 flex items-center space-x-2">
              <SortAsc size={16} />
              <span>Sort Reviews</span>
            </label>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sortBy === option.value
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white border border-transparent"
                  }`}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(activeFilter !== "all" || searchQuery) && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-400 text-sm">Active filters:</span>

              {activeFilter !== "all" && (
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <Star className="fill-current" size={12} />
                  <span>
                    {activeFilter} Star{activeFilter !== "1" ? "s" : ""}
                  </span>
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="hover:text-blue-300 ml-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {searchQuery && (
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <Search size={12} />
                  <span>"{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-green-300 ml-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-white text-sm underline ml-2"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsFilters;
