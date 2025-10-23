// ========================================
// components/HelpSupport/HeroSection.jsx
// ========================================
import { SearchBar } from "./SearchBar";
import { MessageCircle } from "lucide-react";

export const HeroSection = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
      <div className="relative px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <MessageCircle className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Help &
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent block">
                Support
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Get expert assistance for all your camera rental needs. We're here
              to help you capture the perfect shot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
