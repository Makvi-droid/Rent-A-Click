// hooks/useAccountLockout.js
import { useState, useCallback } from 'react';

export const useAccountLockout = (lockoutDurationMinutes = 15) => {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const handleAccountLockout = useCallback(() => {
    setIsAccountLocked(true);
    const lockoutTime = lockoutDurationMinutes * 60;
    setLockoutTimeRemaining(lockoutTime);

    const timer = setInterval(() => {
      setLockoutTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsAccountLocked(false);
          setLoginAttempts(0);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [lockoutDurationMinutes]);

  const incrementAttempts = () => {
    setLoginAttempts((prev) => prev + 1);
  };

  const resetAttempts = () => {
    setLoginAttempts(0);
  };

  return {
    loginAttempts,
    isAccountLocked,
    lockoutTimeRemaining,
    handleAccountLockout,
    incrementAttempts,
    resetAttempts,
  };
};