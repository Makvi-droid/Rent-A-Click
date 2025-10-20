import React from "react";
import { Bell, CheckCheck } from "lucide-react";

const Header = ({ unreadCount, onMarkAllAsRead }) => {
  return (
    <div className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 rounded-2xl shadow-2xl border p-6 mb-6 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-pink-900/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
              <Bell className="w-6 h-6 text-purple-400" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center shadow-lg shadow-red-500/50 animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text ">
              Notification Center
            </h1>
            <div className="flex items-center text-sm text-gray-400 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2 shadow-lg shadow-green-500/50" />
              Real-time updates enabled
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105 border border-purple-400/30"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
