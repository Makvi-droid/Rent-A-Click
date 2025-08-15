import React from 'react';

const FormFooter = ({ isSignUp }) => {
  if (isSignUp) {
    return (
      <div className="text-center mt-6">
        <p className="text-xs text-slate-400">
          By creating an account, you agree to our{' '}
          <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
            Terms of Service
          </button>{' '}
          and{' '}
          <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
            Privacy Policy
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="text-center mt-6">
      <button type="button" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
        Forgot your password?
      </button>
    </div>
  );
};

export default FormFooter