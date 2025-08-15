import React from 'react';

const FormHeader = ({ isSignUp }) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-white mb-2">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>
      <p className="text-slate-400">
        {isSignUp 
          ? 'Join our community of creators' 
          : 'Sign in to your account'
        }
      </p>
    </div>
  );
};

export default FormHeader