import React, { useState } from "react";
import { Bell, X } from "lucide-react";
import { useNotifications } from "../pages/NotificationsContext";

const RealtimeNotifications = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const {
    notifications,
    unreadCount,
    removeNotification,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();

  // Only show the 20 most recent in the dropdown
  const recentNotifications = notifications.slice(0, 20);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            if (!showNotifications) markAllAsRead();
          }}
          className="relative p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:scale-105"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
                {recentNotifications.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({recentNotifications.length})
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {recentNotifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${notification.bgColor} border-l-4 ${notification.borderColor}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`${notification.color} mt-0.5 flex-shrink-0`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 break-words">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                          aria-label="Dismiss notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-10"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default RealtimeNotifications;
