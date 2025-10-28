import React, { useState, useEffect } from "react";
import { Edit2, User, Mail, Lock, Calendar } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, firestore } from "../../firebase";

const PersonalInformation = ({ data, onChange }) => {
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Query customers collection by firebaseUid
          const customersRef = collection(firestore, "customers");
          const q = query(
            customersRef,
            where("firebaseUid", "==", firebaseUser.uid)
          );
          const querySnapshot = await getDocs(q);

          let userData = {};

          if (!querySnapshot.empty) {
            // Customer document exists
            const customerDoc = querySnapshot.docs[0];
            userData = customerDoc.data();

            // Extract name information from customer document
            const fullName =
              userData.fullName || firebaseUser.displayName || "";
            const email = userData.email || firebaseUser.email || "";

            // Try to split full name into first and last name
            const nameParts = fullName.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            setUserInfo({
              fullName,
              email,
              firstName,
              lastName,
            });

            // Initialize parent form data if not already set
            if (onChange && !data?.firstName) {
              onChange("firstName", firstName);
              onChange("lastName", lastName);
            }
          } else {
            // No customer document yet - fallback to Firebase Auth data
            const fullName = firebaseUser.displayName || "";
            const nameParts = fullName.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            setUserInfo({
              fullName,
              email: firebaseUser.email || "",
              firstName,
              lastName,
            });

            // Initialize parent form data
            if (onChange) {
              onChange("firstName", firstName);
              onChange("lastName", lastName);
            }
          }
        } catch (error) {
          console.error("Error loading customer data:", error);
          // Fallback to Firebase Auth data
          const fullName = firebaseUser.displayName || "";
          const nameParts = fullName.trim().split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          setUserInfo({
            fullName,
            email: firebaseUser.email || "",
            firstName,
            lastName,
          });

          if (onChange) {
            onChange("firstName", firstName);
            onChange("lastName", lastName);
          }
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-6 w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-700 rounded mb-2 w-24"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
          <Edit2 className="w-5 h-5 text-blue-400" />
        </div>
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name - Now Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            First Name *
          </label>
          <input
            type="text"
            value={data?.firstName || ""}
            onChange={(e) => onChange && onChange("firstName", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                     text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
            placeholder="Enter your first name"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter your legal first name
          </p>
        </div>

        {/* Last Name - Now Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Last Name *
          </label>
          <input
            type="text"
            value={data?.lastName || ""}
            onChange={(e) => onChange && onChange("lastName", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                     text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
            placeholder="Enter your last name"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter your legal last name
          </p>
        </div>

        {/* Email Address - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            Email Address *
            <Lock className="w-3 h-3 text-gray-500" />
          </label>
          <div className="relative">
            <input
              type="email"
              value={userInfo.email}
              readOnly
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-600/50 rounded-xl
                       text-gray-300 backdrop-blur-sm cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-gray-600/50"
              placeholder="Email from account"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-400/5 rounded-xl pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Email cannot be changed here for security
          </p>
        </div>

        {/* Date of Birth - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Date of Birth *
          </label>
          <input
            type="date"
            value={data?.dateOfBirth || ""}
            onChange={(e) =>
              onChange && onChange("dateOfBirth", e.target.value)
            }
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                     text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300
                     [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
          />
          <p className="text-xs text-gray-400 mt-1">
            Required for age verification purposes
          </p>
        </div>
      </div>

      {/* Information Note */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-xl backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-500/20 rounded-full mt-0.5">
            <Mail className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-300 mb-1">
              Account Information
            </h4>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              Your email is synced from your account and protected for security.
              You can edit your name fields to ensure your legal name is
              accurate for verification purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;
