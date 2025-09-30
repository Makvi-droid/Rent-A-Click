// ReviewsEmptyState.jsx - Empty state for Reviews page
import React from "react";
import { Star, MessageSquare, ShoppingBag, PenTool } from "lucide-react";

const ReviewsEmptyState = ({ type = "no-reviews" }) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case "no-rentals":
        return {
          icon: (
            <ShoppingBag className="text-gray-600 mx-auto mb-6" size={64} />
          ),
          title: "No Rental History",
          description:
            "You haven't completed any rentals yet. Once you complete a rental, you'll be able to write reviews here.",
          actionText: "Browse Products",
          actionLink: "/productsPage",
        };

      case "no-reviews":
        return {
          icon: (
            <MessageSquare className="text-gray-600 mx-auto mb-6" size={64} />
          ),
          title: "No Reviews Yet",
          description:
            "You haven't written any reviews yet, but you have completed rentals. Share your experience to help other customers!",
          actionText: "Check Pending Reviews",
          actionLink: null, // Will scroll to pending reviews section
        };

      default:
        return {
          icon: <Star className="text-gray-600 mx-auto mb-6" size={64} />,
          title: "Start Your Review Journey",
          description:
            "Complete rentals and share your experiences with our community of customers.",
          actionText: "Explore Products",
          actionLink: "/productsPage",
        };
    }
  };

  const content = getEmptyStateContent();

  const handleAction = () => {
    if (content.actionLink) {
      window.location.href = content.actionLink;
    } else {
      // Scroll to top to see pending reviews
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="text-center py-16">
      <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-12 max-w-2xl mx-auto">
        {/* Icon with Animation */}
        <div className="relative mb-8">
          {content.icon}

          {/* Floating Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + ((i * 20) % 40)}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.3}s`,
                }}
              >
                <Star
                  className="text-yellow-400/20 fill-yellow-400/20"
                  size={8 + (i % 3) * 4}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4">{content.title}</h3>
        <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md mx-auto">
          {content.description}
        </p>

        {/* Action Button */}
        <button
          onClick={handleAction}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
        >
          {content.actionText}
        </button>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="p-3 bg-blue-500/20 rounded-lg w-fit mx-auto">
                <ShoppingBag className="text-blue-400" size={20} />
              </div>
              <h4 className="text-white font-medium">Rent Items</h4>
              <p className="text-gray-500 text-sm">
                Browse and rent from our catalog
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-green-500/20 rounded-lg w-fit mx-auto">
                <PenTool className="text-green-400" size={20} />
              </div>
              <h4 className="text-white font-medium">Write Reviews</h4>
              <p className="text-gray-500 text-sm">
                Share your rental experience
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-yellow-500/20 rounded-lg w-fit mx-auto">
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
              </div>
              <h4 className="text-white font-medium">Help Others</h4>
              <p className="text-gray-500 text-sm">
                Your reviews help other customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsEmptyState;
