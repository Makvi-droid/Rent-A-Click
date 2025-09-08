import React from 'react';
import { Loader2 } from 'lucide-react';

export default function SubmitButton({ isLoading, isSignUp, onSubmit, disabled }) {
  return (
    <button
      type="submit"
      onClick={onSubmit}
      disabled={isLoading || disabled}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-6 py-4 font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
    </button>
  );
}