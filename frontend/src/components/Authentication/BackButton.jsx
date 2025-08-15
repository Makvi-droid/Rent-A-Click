import React from 'react';
import { ArrowRight } from 'lucide-react';

const BackButton = ({ navigate }) => {
  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="flex items-center space-x-2 mb-4 text-white hover:text-purple-200 transition-colors"
    >
      <ArrowRight className="w-5 h-5 transform rotate-180" />
      <span>Back</span>
    </button>
  );
};

export default BackButton