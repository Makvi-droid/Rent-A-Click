// ========================================
// components/Admin/Contact/ContactHeader.jsx
// ========================================
import React from "react";
import { MessageSquare, Send } from "lucide-react";

const ContactHeader = ({ onSendMessage }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <MessageSquare className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Contact & Support</h1>
            <p className="text-gray-400 mt-1">
              Manage customer inquiries and send notifications
            </p>
          </div>
        </div>

        <button
          onClick={onSendMessage}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Send className="w-5 h-5" />
          <span className="font-medium">Send Message</span>
        </button>
      </div>
    </div>
  );
};

export default ContactHeader;
