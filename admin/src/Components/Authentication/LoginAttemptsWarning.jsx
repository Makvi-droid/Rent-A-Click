import React from 'react';
import { Shield } from 'lucide-react';

export default function LoginAttemptsWarning({ attempts }) {
  const remaining = 5 - attempts;
  
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-yellow-400" />
        <p className="text-yellow-400 text-sm">
          {attempts} failed attempt{attempts > 1 ? 's' : ''}. 
          {remaining} attempt{remaining !== 1 ? 's' : ''} remaining.
        </p>
      </div>
    </div>
  );
}