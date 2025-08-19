import React from 'react';
import { AlertTriangle, Mail } from 'lucide-react';

export default function NotificationBar({ 
  isAccountLocked, 
  lockoutTimeRemaining, 
  emailVerificationSent 
}) {
  if (!isAccountLocked && !emailVerificationSent) return null;

  return (
    <div className="space-y-4 mb-6">
      {/* Account Lockout Warning */}
      {isAccountLocked && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Account Temporarily Locked</p>
              <p className="text-red-300 text-sm mt-1">
                Too many failed attempts. Try again in {Math.ceil(lockoutTimeRemaining / 60)} minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Notice */}
      {emailVerificationSent && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-blue-400 font-medium">Verify Your Email</p>
              <p className="text-blue-300 text-sm mt-1">
                We've sent a verification link to your email address.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}