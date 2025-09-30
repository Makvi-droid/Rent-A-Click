// components/Profile/TwoFactorSettings.js
import React, { useState, useEffect } from "react";
import { Shield, ShieldCheck, AlertTriangle } from "lucide-react";
import { auth, firestore } from "../../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useToast } from "./Toast";

export default function TwoFactorSettings() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load current customer data
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          showError("Please sign in to manage your 2FA settings.", 5000);
          return;
        }

        // Find customer document by Firebase UID
        const customerRef = doc(firestore, "customers", user.uid);
        const customerSnap = await getDoc(customerRef);

        if (customerSnap.exists()) {
          setCustomerData({ id: customerSnap.id, ...customerSnap.data() });
        } else {
          showError("Customer profile not found.", 5000);
        }
      } catch (error) {
        console.error("Error loading customer data:", error);
        showError("Failed to load 2FA settings.", 5000);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerData();
  }, [showError]);

  const toggle2FA = async () => {
    if (!customerData) return;

    const newStatus = !customerData.twoFA;

    try {
      setIsUpdating(true);

      // Update in Firestore
      const customerRef = doc(firestore, "customers", customerData.id);
      await updateDoc(customerRef, {
        twoFA: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      setCustomerData((prev) => ({
        ...prev,
        twoFA: newStatus,
      }));

      if (newStatus) {
        showSuccess(
          "Two-factor authentication has been enabled! You'll be prompted for a verification code on your next login.",
          6000
        );
      } else {
        showWarning(
          "Two-factor authentication has been disabled. Your account is less secure without 2FA.",
          6000
        );
      }
    } catch (error) {
      console.error("Error updating 2FA settings:", error);
      showError("Failed to update 2FA settings. Please try again.", 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-2/3 mb-4"></div>
          <div className="h-10 bg-white/10 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="text-red-400 font-semibold">
              Error Loading 2FA Settings
            </h3>
            <p className="text-red-300 text-sm">
              Unable to load your security settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            customerData.twoFA
              ? "bg-green-500/20 border border-green-500/30"
              : "bg-gray-500/20 border border-gray-500/30"
          }`}
        >
          {customerData.twoFA ? (
            <ShieldCheck className="w-6 h-6 text-green-400" />
          ) : (
            <Shield className="w-6 h-6 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-semibold text-lg">
              Two-Factor Authentication
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                customerData.twoFA
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              {customerData.twoFA ? "Enabled" : "Disabled"}
            </span>
          </div>

          <p className="text-gray-300 text-sm mb-4">
            {customerData.twoFA
              ? "Your account is protected with two-factor authentication. You'll receive a verification code via email when signing in."
              : "Add an extra layer of security to your account by enabling two-factor authentication. You'll receive a verification code via email when signing in."}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={toggle2FA}
              disabled={isUpdating}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                customerData.twoFA
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
              }`}
            >
              {isUpdating && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              )}
              {customerData.twoFA ? "Disable 2FA" : "Enable 2FA"}
            </button>

            {customerData.twoFA && (
              <div className="flex items-center gap-2 text-green-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm">Protected</span>
              </div>
            )}
          </div>

          {/* Security Notice */}
          {!customerData.twoFA && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 text-xs font-medium">
                    Security Recommendation
                  </p>
                  <p className="text-yellow-300 text-xs mt-1">
                    We strongly recommend enabling 2FA to protect your account
                    from unauthorized access.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Information */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="text-white font-medium text-sm mb-3">How it works:</h4>
        <ul className="text-gray-300 text-xs space-y-2">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
            When 2FA is enabled, you'll receive a 6-digit code via email during
            sign-in
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
            Verification codes expire after 10 minutes for security
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
            You can request a new code if needed during sign-in
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
            This setting can be changed anytime from your profile
          </li>
        </ul>
      </div>
    </div>
  );
}
