import React, { useState, useEffect } from 'react';
import { Edit2, User, Mail, Lock } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase'; // If firebase.js is in src/ folder

const PersonalInformation = ({ data, onChange }) => {
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user document from Firestore
          const userRef = doc(firestore, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          let userData = {};
          if (userDoc.exists()) {
            userData = userDoc.data();
          }

          // Extract name information
          const fullName = userData.fullName || firebaseUser.displayName || '';
          const email = userData.email || firebaseUser.email || '';
          
          // Try to split full name into first and last name
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          setUserInfo({
            fullName,
            email,
            firstName,
            lastName
          });

        } catch (error) {
          console.error("Error loading user data:", error);
          // Fallback to Firebase user data
          const fullName = firebaseUser.displayName || '';
          const nameParts = fullName.split(' ');
          
          setUserInfo({
            fullName,
            email: firebaseUser.email || '',
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || ''
          });
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
        {/* First Name - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            First Name *
            <Lock className="w-3 h-3 text-gray-500" />
          </label>
          <div className="relative">
            <input
              type="text"
              value={userInfo.firstName}
              readOnly
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-600/50 rounded-xl
                       text-gray-300 backdrop-blur-sm cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-gray-600/50"
              placeholder="First name from account"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-400/5 rounded-xl pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-1">This information is managed through your account settings</p>
        </div>

        {/* Last Name - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Last Name *
            <Lock className="w-3 h-3 text-gray-500" />
          </label>
          <div className="relative">
            <input
              type="text"
              value={userInfo.lastName}
              readOnly
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-600/50 rounded-xl
                       text-gray-300 backdrop-blur-sm cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-gray-600/50"
              placeholder="Last name from account"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-400/5 rounded-xl pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-1">This information is managed through your account settings</p>
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
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed here for security reasons</p>
        </div>

        {/* Date of Birth - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={data?.dateOfBirth || ''}
            onChange={(e) => onChange && onChange('dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                     text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
          />
          <p className="text-xs text-gray-400 mt-1">Optional - helps us provide age-appropriate recommendations</p>
        </div>
      </div>

      {/* Information Note */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-xl backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-500/20 rounded-full mt-0.5">
            <Mail className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-300 mb-1">Account Information</h4>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              Your name and email are automatically synced from your account. To update this information, 
              please contact our support team or update your account through the authentication provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;