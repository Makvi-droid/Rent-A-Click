import React from 'react';

export default function FormFooter({ isSignUp }) {
  return (
    <div className="mt-6 text-center">
      <p className="text-gray-400 text-sm">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          className="text-purple-400 hover:text-purple-300 font-medium underline"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}