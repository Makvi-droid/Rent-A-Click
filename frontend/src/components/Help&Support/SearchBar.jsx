// ========================================
// components/HelpSupport/SearchBar.jsx
// ========================================
import React from "react";
import { Search } from "lucide-react";

export const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative max-w-2xl mx-auto mb-8">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
      <input
        type="text"
        placeholder={
          placeholder || "Search for help articles, FAQs, or topics..."
        }
        className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
