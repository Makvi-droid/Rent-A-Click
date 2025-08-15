import React from 'react';

const PasswordStrengthIndicator = ({ password, checkPasswordStrength }) => {
  if (!password) return null;

  const passwordStrength = checkPasswordStrength(password);
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  return (
    <div className="mt-3">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strengthScore <= 2 ? 'bg-red-500' : 
              strengthScore <= 4 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${(strengthScore / 5) * 100}%` }}
          ></div>
        </div>
        <span className={`text-xs ${
          strengthScore <= 2 ? 'text-red-400' : 
          strengthScore <= 4 ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Good' : 'Strong'}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator