import React, { useState } from "react";
import {
  User,
  Camera,
  Star,
  Award,
  Heart,
  Shield,
  Upload,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
} from "lucide-react";

const ProfileHeader = ({ user, onEdit, onUploadPhoto }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showFullInfo, setShowFullInfo] = useState(false);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      user.avatar, // Profile photo
      user.phoneNumber, // Phone number
      user.address, // Address
      user.dateOfBirth, // Date of birth
    ];

    const completedFields = fields.filter((field) => {
      if (typeof field === "object" && field !== null) {
        // For address object, check if it has any values
        return Object.values(field).some((val) => val && val.toString().trim());
      }
      return field && field.toString().trim();
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const isProfileIncomplete = profileCompletion < 100;

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
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1 transform transition-transform duration-300 group-hover:scale-105">
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
            className={`absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center transition-all duration-300 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          >
            <Upload className="w-6 h-6 text-white mb-1" />
            <span className="text-xs text-white font-medium">Change Photo</span>
          </div>

          {/* Status indicator */}
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                {user.isVerified && (
                  <div className="relative group/badge">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap z-50">
                      Verified Account
                    </div>
                  </div>
                )}
                {user.isPremium && (
                  <div className="relative group/badge">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap z-50">
                      Premium Member
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-lg mb-2">{user.title}</p>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2 text-purple-400 font-medium justify-center md:justify-start">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-2 text-gray-400 justify-center md:justify-start">
                    <Phone className="w-4 h-4" />
                    {user.phoneNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info - Expandable */}
          {(user.address || user.dateOfBirth) && (
            <div className="mb-4">
              <button
                onClick={() => setShowFullInfo(!showFullInfo)}
                className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-300 flex items-center gap-1 mx-auto md:mx-0"
              >
                {showFullInfo ? "Hide" : "Show"} Additional Info
                <svg
                  className={`w-4 h-4 transform transition-transform duration-300 ${
                    showFullInfo ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showFullInfo && (
                <div className="mt-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 text-left">
                  {user.dateOfBirth && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">Birthday:</span>
                      {new Date(user.dateOfBirth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-400 block mb-1">
                          Address:
                        </span>
                        <span className="block">
                          {user.address.street && `${user.address.street}`}
                          {user.address.street &&
                            (user.address.barangay || user.address.city) &&
                            ", "}
                          {user.address.barangay && `${user.address.barangay}`}
                          {user.address.barangay && user.address.city && ", "}
                          {user.address.city && `${user.address.city}`}
                          {user.address.city && user.address.state && ", "}
                          {user.address.state && `${user.address.state}`}
                          {user.address.zipCode && ` ${user.address.zipCode}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
                className="text-center p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group transform hover:scale-105"
              >
                <stat.icon
                  className={`w-5 h-5 mx-auto mb-2 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`}
                />
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Profile Completion Indicator */}
          {isProfileIncomplete && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-yellow-300 font-medium">
                  Profile Completion
                </span>
                <span className="text-sm text-yellow-300">
                  {profileCompletion}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>

              {/* Show what's missing */}
              <div className="space-y-1 mt-3">
                <p className="text-xs text-yellow-300 font-medium mb-2">
                  Complete these items:
                </p>
                {!user.avatar && (
                  <div className="flex items-center gap-2 text-xs text-yellow-200/80">
                    <div className="w-4 h-4 rounded-full border border-yellow-500/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-500">•</span>
                    </div>
                    <span>Upload profile photo</span>
                  </div>
                )}
                {!user.phoneNumber && (
                  <div className="flex items-center gap-2 text-xs text-yellow-200/80">
                    <div className="w-4 h-4 rounded-full border border-yellow-500/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-500">•</span>
                    </div>
                    <span>Add phone number</span>
                  </div>
                )}
                {!user.address && (
                  <div className="flex items-center gap-2 text-xs text-yellow-200/80">
                    <div className="w-4 h-4 rounded-full border border-yellow-500/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-500">•</span>
                    </div>
                    <span>Add address</span>
                  </div>
                )}
                {!user.dateOfBirth && (
                  <div className="flex items-center gap-2 text-xs text-yellow-200/80">
                    <div className="w-4 h-4 rounded-full border border-yellow-500/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-500">•</span>
                    </div>
                    <span>Add date of birth</span>
                  </div>
                )}
              </div>

              <button
                onClick={onEdit}
                className="mt-3 w-full text-xs text-yellow-300 hover:text-yellow-200 transition-colors duration-300 bg-yellow-500/10 hover:bg-yellow-500/20 py-2 rounded-lg font-medium"
              >
                Complete your profile to unlock all features →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
