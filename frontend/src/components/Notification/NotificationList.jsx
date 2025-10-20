import React from "react";
import {
  getTypeIcon,
  getTypeColor,
  getTypeBadgeColor,
  formatTimestamp,
} from "./Utils";

const NotificationItem = ({
  notification,
  isSelected,
  onClick,
  onMarkAsRead,
}) => {
  const handleClick = () => {
    // Always call onClick first to select the notification
    onClick(notification);

    // Auto-mark as read when clicked (only if currently unread)
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const cardClasses = `
    p-4 rounded-xl border cursor-pointer transition-all duration-300 backdrop-blur-sm
    ${
      isSelected
        ? "bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/50 shadow-lg shadow-purple-500/20"
        : "bg-gray-900/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/50 hover:shadow-lg"
    }
    ${
      !notification.isRead
        ? "border-l-4 border-l-purple-500 shadow-purple-500/10"
        : ""
    }
    transform hover:scale-[1.01]
  `;

  // Format timestamp
  const formattedTime = formatTimestamp(notification.createdAt);

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className={`mt-1 ${getTypeColor(notification.type, true)}`}>
            {getTypeIcon(notification.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3
                className={`font-semibold text-sm truncate ${
                  !notification.isRead ? "text-white" : "text-gray-300"
                }`}
              >
                {notification.title}
              </h3>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-purple-500 rounded-full ml-2 flex-shrink-0 animate-pulse shadow-lg shadow-purple-500/50" />
              )}
            </div>

            <p
              className={`text-sm line-clamp-2 mb-2 ${
                !notification.isRead ? "text-gray-300" : "text-gray-400"
              }`}
            >
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{formattedTime}</span>

              <div className="flex items-center space-x-2">
                {notification.orderId && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-800/60 text-gray-300 border border-gray-700/50">
                    #{notification.orderId.replace("order_", "")}
                  </span>
                )}
                <span className={getTypeBadgeColor(notification.type, true)}>
                  {notification.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationList = ({
  notifications,
  selectedNotification,
  setSelectedNotification,
  onMarkAsRead,
  loading,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-medium mb-2 text-white">
          No notifications found
        </h3>
        <p className="text-sm text-gray-400">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          isSelected={selectedNotification?.id === notification.id}
          onClick={setSelectedNotification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};

export default NotificationList;
