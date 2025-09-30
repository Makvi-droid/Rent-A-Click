import React, { useState, useEffect } from "react";
import {
  User,
  ArrowLeft,
  Settings,
  Shield,
  Bell,
  CreditCard,
  FileText,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Camera,
  Clock,
  Star,
  Award,
  TrendingUp,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  ChevronRight,
  Activity,
  Package,
  Heart,
  ShoppingBag,
  LogOut,
  Key,
  Database,
  BarChart3,
  Users,
  Briefcase,
  HelpCircle,
} from "lucide-react";

// Sub-components for better organization
const ProfileHeader = ({ user, onEdit, onUploadPhoto }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/30 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-pink-500/10" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
        {/* Profile Photo */}
        <div
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={onUploadPhoto}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
            <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>

          {/* Upload overlay */}
          <div
            className={`absolute inset-0 rounded-full bg-black/60 flex items-center justify-center transition-all duration-300 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          >
            <Upload className="w-8 h-8 text-white" />
          </div>

          {/* Status indicator */}
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                {user.name}
                {user.isVerified && (
                  <Shield className="w-6 h-6 text-blue-400" />
                )}
                {user.isPremium && <Star className="w-6 h-6 text-yellow-400" />}
              </h1>
              <p className="text-gray-400 text-lg mb-2">{user.title}</p>
              <p className="text-purple-400 font-medium">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Rentals",
                value: user.stats.rentals,
                icon: Camera,
                color: "purple",
              },
              {
                label: "Reviews",
                value: user.stats.reviews,
                icon: Star,
                color: "yellow",
              },
              {
                label: "Rating",
                value: user.stats.rating,
                icon: Award,
                color: "blue",
              },
              {
                label: "Saved",
                value: user.stats.saved,
                icon: Heart,
                color: "pink",
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group"
              >
                <stat.icon
                  className={`w-5 h-5 mx-auto mb-1 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`}
                />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
