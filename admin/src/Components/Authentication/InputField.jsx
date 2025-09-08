import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function InputField({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  isPassword = false,
  showPassword,
  onTogglePassword
}) {
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-4 bg-slate-800/50 border ${
            error ? 'border-red-500/50' : 'border-slate-700/50'
          } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-200`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400 hover:text-white" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400 hover:text-white" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}
    </div>
  );
}