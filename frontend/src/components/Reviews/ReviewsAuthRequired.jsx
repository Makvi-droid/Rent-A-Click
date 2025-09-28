// ReviewsAuthRequired.jsx - Authentication required state for Reviews page
import React from "react";
import { Lock, LogIn, Star, MessageSquare } from "lucide-react";

const ReviewsAuthRequired = () => {
  const handleLogin = () => {
    // Redirect to login page - adjust path as needed
    window.location.href = "/login";
  };

  const handleSignup = () => {
    // Redirect to signup page - adjust path as needed
    window.location.href = "/signup";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Lock Icon with Animation */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Lock className="text-red-400 animate-pulse" size={48} />
            <MessageSquare className="text-blue-400 animate-bounce" size={48} />
            <Star
              className="text-yellow-400 fill-yellow-400 animate-pulse"
              size={48}
            />
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + ((i * 15) % 30)}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${3 + i * 0.2}s`,
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

        {/* Main Content */}
        <div className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Authentication Required
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Please sign in to access your reviews and share your rental
            experiences with our community.
          </p>

          {/* Benefits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gray-900/50 rounded-lg p-4 text-left">
              <div className="flex items-center space-x-3 mb-3">
                <MessageSquare className="text-blue-400" size={20} />
                <h3 className="text-white font-semibold">Write Reviews</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Share your experiences and help other customers make informed
                decisions.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 text-left">
              <div className="flex items-center space-x-3 mb-3">
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                <h3 className="text-white font-semibold">Rate Products</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Give star ratings to products you've rented and help improve our
                service.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>

            <button
              onClick={handleSignup}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300 border border-gray-600 hover:border-gray-500 flex items-center justify-center space-x-2"
            >
              <span>Create Account</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <p className="text-gray-500 text-sm">
              New to our platform? Create an account to start renting amazing
              products and sharing your experiences with our community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsAuthRequired;
