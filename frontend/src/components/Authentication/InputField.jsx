import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  showPassword,
  onTogglePassword,
  isPassword = false,
  className = ""
}) => {
  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-12 ${isPassword ? 'pr-12' : 'pr-4'} py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm`}
        />
        {isPassword && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default InputField