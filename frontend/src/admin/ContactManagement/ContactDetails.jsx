// ========================================
// components/Admin/Contact/ContactDetails.jsx
// ========================================
import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import { createNotification } from "../../services/notificationService";

const ContactDetails = ({ contact, onStatusUpdate, onClose }) => {
  const [response, setResponse] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  if (!contact) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Select a contact to view details</p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      setSendStatus({
        type: "error",
        message: "Please enter a response message",
      });
      return;
    }

    if (!contact.customerId) {
      setSendStatus({
        type: "error",
        message: "Customer ID not found. Cannot send notification.",
      });
      return;
    }

    setSending(true);
    setSendStatus(null);

    try {
      // Create notification using your existing service
      await createNotification(
        contact.customerId,
        "support",
        `Response to: ${contact.subject}`,
        response.trim()
      );

      // Update contact with response and timestamp
      const contactRef = doc(firestore, "contacts", contact.id);
      await updateDoc(contactRef, {
        lastResponse: response.trim(),
        lastResponseAt: new Date(),
        updatedAt: new Date(),
        status: contact.status === "pending" ? "in-progress" : contact.status,
      });

      setSendStatus({
        type: "success",
        message: "Response sent successfully!",
      });
      setResponse("");

      setTimeout(() => setSendStatus(null), 3000);
    } catch (error) {
      console.error("Error sending response:", error);
      setSendStatus({
        type: "error",
        message: "Failed to send response. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusUpdate(contact.id, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

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

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Contact Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        {/* Customer Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Customer Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-purple-400" />
              <span className="text-white">{contact.customerName}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-purple-400" />
              <span className="text-white">{contact.customerEmail}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-white">
                {formatDate(contact.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {["pending", "in-progress", "resolved"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                  contact.status === status
                    ? getStatusColor(status)
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                }`}
              >
                {status === "in-progress"
                  ? "In Progress"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Subject
          </label>
          <p className="text-white bg-white/5 rounded-lg p-3 border border-white/10">
            {contact.subject}
          </p>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Message
          </label>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white whitespace-pre-wrap">{contact.message}</p>
          </div>
        </div>

        {/* Last Response (if exists) */}
        {contact.lastResponse && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Previous Response
            </label>
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <p className="text-white whitespace-pre-wrap">
                {contact.lastResponse}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Sent: {formatDate(contact.lastResponseAt)}
              </p>
            </div>
          </div>
        )}

        {/* Response Section */}
        <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
          <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Send Response</span>
          </h3>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response here..."
            rows="5"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none mb-3"
          />

          {sendStatus && (
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg mb-3 ${
                sendStatus.type === "success"
                  ? "bg-green-500/20 border border-green-500/30"
                  : "bg-red-500/20 border border-red-500/30"
              }`}
            >
              {sendStatus.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <p
                className={`text-sm ${
                  sendStatus.type === "success"
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {sendStatus.message}
              </p>
            </div>
          )}

          <button
            onClick={handleSendResponse}
            disabled={sending || !response.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Response</span>
              </>
            )}
          </button>
        </div>
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

export default ContactDetails;
