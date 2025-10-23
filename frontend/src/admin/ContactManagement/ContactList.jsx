// ========================================
// components/Admin/Contact/ContactList.jsx
// ========================================
import React from "react";
import { Mail, Clock, User } from "lucide-react";

const ContactList = ({
  contacts,
  selectedContact,
  onSelectContact,
  loading,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "in-progress":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No contacts found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">
          Contact Inquiries ({contacts.length})
        </h2>
      </div>
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
              selectedContact?.id === contact.id
                ? "bg-purple-500/10 border-l-4 border-l-purple-500"
                : ""
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-white font-medium truncate">
                  {contact.customerName || "Unknown"}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  contact.status
                )} flex-shrink-0 ml-2`}
              >
                {contact.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2 line-clamp-1">
              {contact.subject || "No subject"}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatDate(contact.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </div>
  );
};

export default ContactList;
