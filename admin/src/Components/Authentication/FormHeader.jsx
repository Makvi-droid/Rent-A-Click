import React from 'react';

export default function FormHeader({ isSignUp }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p className="text-gray-400">
        {isSignUp 
          ? 'Join us today and start your journey' 
          : 'Sign in to access your account'
        }
      </p>
    </div>
  );
}