import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ViewCustomerModal = ({ customer, onClose }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const InfoRow = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="p-2 bg-gray-800 rounded-lg">
        <Icon className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white font-medium">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Customer Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
            {customer.profilePicture ? (
              <img
                src={customer.profilePicture}
                alt={customer.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                {(customer.fullName || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">
                {customer.fullName || "Unknown"}
              </h3>
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    (customer.accountStatus || "active") === "active"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {(customer.accountStatus || "active") === "active" ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Suspended
                    </span>
                  )}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    customer.idVerification?.verified
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  }`}
                >
                  {customer.idVerification?.verified ? (
                    <span className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    "Unverified"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow icon={Mail} label="Email" value={customer.email} />
              <InfoRow
                icon={Calendar}
                label="Date of Birth"
                value={customer.dateOfBirth || "Not provided"}
              />
              <InfoRow icon={User} label="Customer ID" value={customer.id} />
              <InfoRow
                icon={User}
                label="Firebase UID"
                value={customer.firebaseUid}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-400" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow
                icon={Phone}
                label="Primary Phone"
                value={customer.phoneNumber}
              />
              <InfoRow
                icon={Phone}
                label="Alternative Phone"
                value={customer.alternativePhone}
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow
                icon={MapPin}
                label="Street Address"
                value={customer.address?.street}
                className="md:col-span-2"
              />
              <InfoRow
                icon={MapPin}
                label="Barangay"
                value={customer.address?.barangay}
              />
              <InfoRow
                icon={MapPin}
                label="City"
                value={customer.address?.city}
              />
              <InfoRow
                icon={MapPin}
                label="State/Province"
                value={customer.address?.state}
              />
              <InfoRow
                icon={MapPin}
                label="Zip Code"
                value={customer.address?.zipCode}
              />
            </div>
          </div>

          {/* ID Verification */}
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              ID Verification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow
                icon={CreditCard}
                label="ID Type"
                value={customer.idVerification?.type}
              />
              <InfoRow
                icon={CreditCard}
                label="ID Number"
                value={customer.idVerification?.number}
              />
              {customer.idVerification?.documentUrl && (
                <div className="md:col-span-2">
                  <a
                    href={customer.idVerification.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    View ID Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Account Timestamps */}
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow
                icon={Calendar}
                label="Joined"
                value={formatDate(customer.createdAt)}
              />
              <InfoRow
                icon={Calendar}
                label="Last Updated"
                value={formatDate(customer.updatedAt)}
              />
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomerModal;
