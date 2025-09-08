import React from 'react';

function TermsCheckbox({ checked, onChange, error }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={checked}
          onChange={onChange}
          className="mt-1 w-4 h-4 text-purple-600 bg-white/10 border border-white/20 rounded focus:ring-purple-500 focus:ring-2"
        />
        <label className="text-sm text-gray-300">
          I agree to the{' '}
          <a href="/terms" className="text-purple-400 hover:text-purple-300 underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
            Privacy Policy
          </a>
        </label>
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

export default TermsCheckbox