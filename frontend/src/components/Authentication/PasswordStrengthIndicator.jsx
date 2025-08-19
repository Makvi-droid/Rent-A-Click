import React from 'react';

export default function PasswordStrengthIndicator({ password, checkPasswordStrength }) {
  if (!password) return null;

  const strength = checkPasswordStrength(password);
  const requirements = [
    { key: 'minLength', label: 'At least 8 characters', met: strength.minLength },
    { key: 'hasUpper', label: 'Uppercase letter', met: strength.hasUpper },
    { key: 'hasLower', label: 'Lowercase letter', met: strength.hasLower },
    { key: 'hasNumber', label: 'Number', met: strength.hasNumber },
    { key: 'hasSpecial', label: 'Special character', met: strength.hasSpecial }
  ];

  const metCount = requirements.filter(req => req.met).length;
  const strengthPercentage = (metCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage < 40) return 'bg-red-500';
    if (strengthPercentage < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strengthPercentage < 40) return 'Weak';
    if (strengthPercentage < 80) return 'Fair';
    return 'Strong';
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 min-w-[40px]">
          {getStrengthLabel()}
        </span>
      </div>
      
      <ul className="space-y-1">
        {requirements.map(req => (
          <li key={req.key} className="flex items-center gap-2 text-xs">
            <div className={`w-1.5 h-1.5 rounded-full ${
              req.met ? 'bg-green-400' : 'bg-slate-600'
            }`} />
            <span className={req.met ? 'text-green-400' : 'text-gray-500'}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}