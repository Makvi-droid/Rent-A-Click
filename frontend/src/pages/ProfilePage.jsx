import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase'; // Adjust path as needed
import { 
  User, ArrowLeft, Settings, Shield, Bell, CreditCard, FileText, 
  Download, Upload, Eye, Edit, Trash2, Camera, Clock, Star, 
  Award, TrendingUp, MapPin, Calendar, Mail, Phone, Globe,
  ChevronRight, Activity, Package, Heart, ShoppingBag, LogOut,
  Key, Database, BarChart3, Users, Briefcase, HelpCircle
} from 'lucide-react';

import ActivityFeed from '../components/Profile/ActivityFeed';
import NavigationCard from '../components/Profile/NavigationCard';
import ProfileHeader from '../components/Profile/ProfileHeader';
import QuickActions from '../components/Profile/QuickActions';
import SignOutConfirmation from '../components/Profile/SignOutConfirmation';

const ProfilePage = () => {
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    title: "Camera Enthusiast",
    email: "",
    avatar: null,
    isVerified: false,
    isPremium: false,
    provider: "",
    stats: {
      rentals: 0,
      reviews: 0,
      rating: "New",
      saved: 0
    }
  });

  

  // Load current user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        
        try {
          // Get user document from Firestore
          const userRef = doc(firestore, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          let userData = {};
          
          if (userDoc.exists()) {
            userData = userDoc.data();
          } else {
            // If no Firestore document exists (shouldn't happen with your auth flow, but just in case)
            userData = {
              fullName: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              phoneNumber: firebaseUser.phoneNumber || "",
              provider: firebaseUser.providerData[0]?.providerId?.includes('google') ? 'google' : 'email',
              isEmailVerified: firebaseUser.emailVerified,
              createdAt: new Date(),
              role: 'customer'
            };
            
            // Create the document
            await setDoc(userRef, {
              ...userData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }

          // Determine user's sign-in provider
          const isGoogleUser = firebaseUser.providerData.some(
            provider => provider.providerId === 'google.com'
          );

          // Set user state with current user data
          setUser({
            name: userData.fullName || firebaseUser.displayName || "User",
            title: userData.title || (isGoogleUser ? "Google User" : "Camera Enthusiast"),
            email: userData.email || firebaseUser.email || "",
            avatar: firebaseUser.photoURL || userData.profilePicture || null,
            isVerified: firebaseUser.emailVerified || userData.isEmailVerified || false,
            isPremium: userData.isPremium || false,
            provider: isGoogleUser ? 'google' : 'email',
            uid: firebaseUser.uid,
            stats: {
              rentals: userData.totalRentals || 0,
              reviews: userData.totalReviews || 0,
              rating: userData.averageRating ? `${userData.averageRating}★` : "New",
              saved: userData.savedItems?.length || 0
            }
          });

        } catch (error) {
          console.error("Error loading user data:", error);
          
          // Fallback to Firebase Auth data only
          const isGoogleUser = firebaseUser.providerData.some(
            provider => provider.providerId === 'google.com'
          );

          setUser({
            name: firebaseUser.displayName || "User",
            title: isGoogleUser ? "Google User" : "Camera Enthusiast",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || null,
            isVerified: firebaseUser.emailVerified || false,
            isPremium: false,
            provider: isGoogleUser ? 'google' : 'email',
            uid: firebaseUser.uid,
            stats: {
              rentals: 0,
              reviews: 0,
              rating: "New",
              saved: 0
            }
          });
        }
      } else {
        // No user is signed in, redirect to login
        navigate('/auth');
        return;
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  // Navigation handlers
  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    // In your actual app, replace this with: navigate(path);
    navigate(path)
  };

  const handleQuickAction = (actionId) => {
    const routes = {
      browse: '/productsPage',
      rentals: '/rentals',
      wishlist: '/wishlistPage',
      cart: '/cartPage'
    };
    handleNavigation(routes[actionId]);
  };

  const handleUploadPhoto = () => {
    console.log("Opening photo upload dialog");
    // You could implement photo upload to Firebase Storage here
    // and update the user's profile picture
  };

  const handleEditProfile = () => {
    console.log("Opening profile edit modal");
    // Navigate to profile edit page or open modal
    navigate('/profile/edit');
  };

  const handleLogout = () => {
    setShowSignOutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      setShowSignOutModal(false);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      // You might want to show an error toast here
    }
  };

  const cancelLogout = () => {
    setShowSignOutModal(false);
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mb-4"></div>
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user (should redirect to login)
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-pink-900/10" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500/5 to-transparent rounded-full blur-3xl" />
      
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animation: `float ${4 + i * 0.3}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-12">
        {/* Header with back navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/homePage')}
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <div className="p-2 bg-gray-800 rounded-lg border border-gray-700 group-hover:border-purple-500/50 group-hover:bg-gray-700 transition-all duration-300">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            </div>
            <span className="font-medium">Back to Home</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Welcome back,</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-white">{user.name}</p>
                {user.provider === 'google' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-xs text-blue-300">Google</span>
                  </div>
                )}
                {user.isVerified && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <ProfileHeader 
          user={user} 
          onEdit={handleEditProfile}
          onUploadPhoto={handleUploadPhoto}
        />

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Quick Actions
          </h2>
          <QuickActions onAction={handleQuickAction} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Navigation Cards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              Account Management
            </h2>
            
            <NavigationCard
              title="Account Settings"
              description="Update your personal information and preferences"
              icon={Settings}
              onClick={() => handleNavigation('/settings')}
              color="purple"
            />
            
            <NavigationCard
              title="Security & Privacy"
              description="Manage passwords, 2FA, and privacy settings"
              icon={Shield}
              onClick={() => handleNavigation('/security')}
              color="blue"
            />
            
            <NavigationCard
              title="Notifications"
              description="Configure email and push notification preferences"
              icon={Bell}
              onClick={() => handleNavigation('/notifications')}
              color="green"
              badge=""
            />
            
            <NavigationCard
              title="Billing & Payments"
              description="View payment methods, invoices, and subscription"
              icon={CreditCard}
              onClick={() => handleNavigation('/billing')}
              color="yellow"
            />
            
            <NavigationCard
              title="Help & Support"
              description="Documentation, tutorials, and customer support"
              icon={HelpCircle}
              onClick={() => handleNavigation('/help')}
              color="gray"
            />
          </div>

          {/* Activity Feed */}
          <div>
            <ActivityFeed/>
            
            {/* Logout */}
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full p-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-red-500/25 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmation
        isOpen={showSignOutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
      />

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-15px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;