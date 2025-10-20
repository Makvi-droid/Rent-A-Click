import React from "react";
import { X, Trash2, Eye, EyeOff } from "lucide-react";
import { getTypeIcon, getTypeColor, formatTimestamp } from "./Utils";

const Details = ({ notification, onClose, onMarkAsRead, onDelete }) => {
  const cardClasses = `
    w-full lg:w-80 p-6 rounded-2xl border shadow-2xl backdrop-blur-sm
    bg-gray-900/40 border-gray-700/50
    sticky top-6
  `;

  const buttonClasses = (variant = "secondary") => {
    const baseClasses =
      "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-1 transform hover:scale-105";

    if (variant === "danger") {
      return `${baseClasses} bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 border border-red-400/30`;
    }

    return `${baseClasses} bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50`;
  };

  if (!notification) {
    return (
      <div className={cardClasses}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="font-medium mb-2 text-gray-300">
            Select a notification
          </h3>
          <p className="text-sm text-gray-400">
            Choose a notification from the list to view details
          </p>
        </div>
      </div>
    );
  }

  // Format the timestamp
  const formattedTime = formatTimestamp(notification.createdAt);

  return (
    <div className={cardClasses}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={getTypeColor(notification.type, true)}>
            {getTypeIcon(notification.type)}
          </div>
          <h2 className="text-lg font-semibold text-white">Details</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl transition-all duration-300 hover:bg-gray-700/60 text-gray-400 hover:text-white border border-transparent hover:border-gray-600/50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Title and Status */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-base leading-tight text-white">
            {notification.title}
          </h3>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-purple-500 rounded-full ml-2 flex-shrink-0 mt-2 animate-pulse shadow-lg shadow-purple-500/50" />
          )}
        </div>

        {/* Message/Description */}
        <p className="text-sm leading-relaxed text-gray-300">
          {notification.message}
        </p>

        {/* Additional Data/Details */}
        {notification.data && Object.keys(notification.data).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-200">Details:</h4>
            <div className="rounded-xl p-3 space-y-2 bg-gray-800/60 border border-gray-700/50">
              {Object.entries(notification.data).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-300">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                    :
                  </span>
                  <span className="text-xs text-gray-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order ID if available */}
        {notification.orderId && (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/40 text-purple-300 border border-purple-500/30">
              Order: {notification.orderId}
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-400">{formattedTime}</div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-700/50">
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className={buttonClasses()}
          >
            {notification.isRead ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Mark Unread</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Mark Read</span>
              </>
            )}
          </button>

          {onDelete && (
            <button
              onClick={() => {
                onDelete(notification.id);
                onClose();
              }}
              className={buttonClasses("danger")}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
