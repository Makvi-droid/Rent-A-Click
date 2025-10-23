// components/Notification/Utils.js
// UPDATED: Added "support" type for admin responses
import { Package, Gift, CreditCard, Bell, MessageCircle } from "lucide-react";

export const getTypeIcon = (type) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case "orders":
    case "order":
      return <Package className={iconClass} />;
    case "promotions":
    case "promotion":
      return <Gift className={iconClass} />;
    case "billing":
    case "payment":
      return <CreditCard className={iconClass} />;
    case "support":
      return <MessageCircle className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

export const getTypeColor = (type, isDarkMode) => {
  switch (type) {
    case "orders":
    case "order":
      return isDarkMode ? "text-blue-400" : "text-blue-600";
    case "promotions":
    case "promotion":
      return isDarkMode ? "text-green-400" : "text-green-600";
    case "billing":
    case "payment":
      return isDarkMode ? "text-purple-400" : "text-purple-600";
    case "support":
      return isDarkMode ? "text-pink-400" : "text-pink-600";
    default:
      return isDarkMode ? "text-gray-400" : "text-gray-600";
  }
};

export const getNotificationCounts = (notifications) => {
  return {
    all: notifications.length,
    orders: notifications.filter(
      (n) => n.type === "orders" || n.type === "order"
    ).length,
    promotions: notifications.filter(
      (n) => n.type === "promotions" || n.type === "promotion"
    ).length,
    billing: notifications.filter(
      (n) => n.type === "billing" || n.type === "payment"
    ).length,
    support: notifications.filter((n) => n.type === "support").length,
  };
};

export const getTypeBadgeColor = (type, isDarkMode) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (type) {
    case "orders":
    case "order":
      return `${baseClasses} ${
        isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
      }`;
    case "promotions":
    case "promotion":
      return `${baseClasses} ${
        isDarkMode
          ? "bg-green-900 text-green-200"
          : "bg-green-100 text-green-800"
      }`;
    case "billing":
    case "payment":
      return `${baseClasses} ${
        isDarkMode
          ? "bg-purple-900 text-purple-200"
          : "bg-purple-100 text-purple-800"
      }`;
    case "support":
      return `${baseClasses} ${
        isDarkMode ? "bg-pink-900 text-pink-200" : "bg-pink-100 text-pink-800"
      }`;
    default:
      return `${baseClasses} ${
        isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
      }`;
  }
};

// Helper to get readable type name
export const getTypeDisplayName = (type) => {
  switch (type) {
    case "orders":
    case "order":
      return "Order";
    case "promotions":
    case "promotion":
      return "Promotion";
    case "billing":
    case "payment":
      return "Billing";
    case "support":
      return "Support";
    default:
      return "Notification";
  }
};

// Helper function to format timestamp from Firebase timestamp or Date
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1d ago";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return date.toLocaleDateString();
  }
};
