import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { getNotificationCounts } from "../components/Notification/Utils";
import { useNotifications } from "../hooks/useNotifications";
import Header from "../components/Notification/Header";
import FilterTabs from "../components/Notification/FilterTabs";
import NotificationList from "../components/Notification/NotificationList";
import Details from "../components/Notification/Details";

const NotificationPage = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  // Get real-time notifications from Firebase (hook now handles customerId internally)
  const {
    notifications,
    loading,
    unreadCount,
    customerId,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "all") return true;
    return notification.type === activeFilter;
  });

  // Get notification counts by type
  const counts = getNotificationCounts(notifications);

  // Handle notification selection
  const handleNotificationSelect = (notification) => {
    setSelectedNotification(notification);
  };

  // Handle marking notification as read/unread (toggle)
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);

      // Update selected notification if it's the one being toggled
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification((prev) => ({
          ...prev,
          isRead: !prev.isRead,
        }));
      }
    } catch (error) {
      console.error("Error toggling notification read status:", error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();

      // Update selected notification if it exists
      if (selectedNotification && !selectedNotification.isRead) {
        setSelectedNotification((prev) => ({
          ...prev,
          isRead: true,
        }));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Show loading state while fetching customer ID
  if (loading && !customerId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Show message if no customer ID found
  if (!customerId && !loading && user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-4">
            <p className="text-yellow-400 mb-2">Customer Profile Not Found</p>
            <p className="text-gray-400 text-sm">
              Please complete your profile setup to view notifications.
            </p>
          </div>
          <button
            onClick={() => navigate("/profilePage")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
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

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-8">
        {/* Header with back navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/profilePage")}
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <div className="p-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 group-hover:border-purple-500/50 group-hover:bg-gray-700/50 transition-all duration-300 shadow-lg">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            </div>
            <span className="font-medium hidden sm:block">Back to Profile</span>
          </button>
        </div>

        <Header
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <FilterTabs
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              counts={counts}
            />

            <NotificationList
              notifications={filteredNotifications}
              selectedNotification={selectedNotification}
              setSelectedNotification={handleNotificationSelect}
              onMarkAsRead={handleMarkAsRead}
              loading={loading}
            />
          </div>

          {/* Details Panel */}
          <Details
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          100% {
            transform: translateY(-15px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPage;
