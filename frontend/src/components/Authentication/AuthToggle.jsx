import React from 'react';

const AuthToggle = ({ isSignUp, setIsSignUp }) => {
  return (
    <div className="relative mb-8">
      <div className="flex bg-slate-800/50 rounded-xl p-1 backdrop-blur-sm border border-slate-700/50">
        <button
          type="button"
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-3 px-6 text-sm font-medium rounded-lg transition-all duration-300 ${
            !isSignUp
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(true)}
          className={`flex-1 py-3 px-6 text-sm font-medium rounded-lg transition-all duration-300 ${
            isSignUp
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default AuthToggle