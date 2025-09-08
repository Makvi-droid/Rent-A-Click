import React from 'react';

export default function RecaptchaField({ onChange, error }) {
  return (
    <div>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <input
            type="checkbox"
            onChange={(e) => onChange(e.target.checked ? 'mock-token' : null)}
            className="w-4 h-4"
          />
          <span className="text-white text-sm">I'm not a robot</span>
        </div>
        <p className="text-xs text-slate-400">reCAPTCHA</p>
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}