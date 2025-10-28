import React, { useState, useEffect } from "react";
import { Bell, X, Trash2, Filter, Search } from "lucide-react";
import { useNotifications } from "./NotificationsContext";

const NotificationsTab = () => {
  const {
    notifications,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();

  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter notifications when filter type or search query changes
  useEffect(() => {
    let filtered = notifications;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((n) => n.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filterType, searchQuery]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFilterCount = (type) => {
    if (type === "all") return notifications.length;
    return notifications.filter((n) => n.type === type).length;
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      clearAllNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-7 w-7 text-blue-600" />
                Notifications
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Stay updated with real-time system notifications
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {unreadCount} unread
                </span>
              )}
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 mr-2">
              Filter:
            </span>

            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({getFilterCount("all")})
            </button>

            <button
              onClick={() => setFilterType("order")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "order"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Orders ({getFilterCount("order")})
            </button>

            <button
              onClick={() => setFilterType("warning")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "warning"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Stock Alerts ({getFilterCount("warning")})
            </button>

            <button
              onClick={() => setFilterType("info")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "info"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Users ({getFilterCount("info")})
            </button>

            <button
              onClick={() => setFilterType("error")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === "error"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Errors ({getFilterCount("error")})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || filterType !== "all"
                  ? "No notifications found"
                  : "No notifications yet"}
              </h3>
              <p className="text-gray-500">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your filters or search query"
                  : "New notifications will appear here when they arrive"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md ${
                    !notification.read
                      ? "border-l-4 " + notification.borderColor
                      : ""
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`${notification.color} mt-1 flex-shrink-0 p-2 rounded-lg ${notification.bgColor}`}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 break-words">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-3">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Stats Footer */}
        {notifications.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {unreadCount}
                </p>
                <p className="text-sm text-gray-600">Unread</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {getFilterCount("order")}
                </p>
                <p className="text-sm text-gray-600">Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {getFilterCount("warning")}
                </p>
                <p className="text-sm text-gray-600">Alerts</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default NotificationsTab;
