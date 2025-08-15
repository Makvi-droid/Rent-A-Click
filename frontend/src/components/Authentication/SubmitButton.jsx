import React from 'react';
import { ArrowRight } from 'lucide-react';

const SubmitButton = ({ isLoading, isSignUp, onSubmit }) => {
  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      ) : (
        <>
          <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
          <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  );
};

export default SubmitButton