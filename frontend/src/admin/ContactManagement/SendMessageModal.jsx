// ========================================
// components/Admin/Contact/SendMessageModal.jsx
// ========================================
import React, { useState, useEffect } from "react";
import { X, Send, User, Search, CheckCircle, AlertCircle } from "lucide-react";
import { collection, query, getDocs, addDoc } from "firebase/firestore";
import { firestore } from "../../firebase";

const SendMessageModal = ({ onClose }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messageData, setMessageData] = useState({
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersRef = collection(firestore, "customers");
        const q = query(customersRef);
        const snapshot = await getDocs(q);
        const customersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customersData);
        setFilteredCustomers(customersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(
        (customer) =>
          customer.fullName?.toLowerCase().includes(query) ||
          customer.email?.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);

  const handleSendMessage = async () => {
    if (!selectedCustomer) {
      setSendStatus({
        type: "error",
        message: "Please select a customer",
      });
      return;
    }

    if (!messageData.subject.trim() || !messageData.message.trim()) {
      setSendStatus({
        type: "error",
        message: "Please fill in all fields",
      });
      return;
    }

    setSending(true);
    setSendStatus(null);

    try {
      // Create notification for selected customer
      const notificationData = {
        customerId: selectedCustomer.id,
        type: "support",
        title: messageData.subject.trim(),
        message: messageData.message.trim(),
        isRead: false,
        createdAt: new Date(),
      };

      await addDoc(collection(firestore, "notifications"), notificationData);

      setSendStatus({
        type: "success",
        message: `Message sent successfully to ${selectedCustomer.fullName}!`,
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setSelectedCustomer(null);
        setMessageData({ subject: "", message: "" });
        setSendStatus(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
      setSendStatus({
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Send className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Send Message to Customer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Select Customer
              </h3>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              {/* Customer List */}
              <div className="bg-white/5 rounded-xl border border-white/10 max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading customers...</p>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-8 text-center">
                    <User className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No customers found</p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${
                        selectedCustomer?.id === customer.id
                          ? "bg-purple-500/20 border-l-4 border-l-purple-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/20 rounded-full">
                          <User className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {customer.fullName || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Form */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Message Details
              </h3>

              {selectedCustomer && (
                <div className="bg-purple-500/10 rounded-xl p-4 mb-4 border border-purple-500/20">
                  <p className="text-sm text-purple-400 mb-1">Sending to:</p>
                  <p className="text-white font-medium">
                    {selectedCustomer.fullName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedCustomer.email}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subject <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={messageData.subject}
                    onChange={(e) =>
                      setMessageData({
                        ...messageData,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Enter message subject"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Message <span className="text-pink-400">*</span>
                  </label>
                  <textarea
                    value={messageData.message}
                    onChange={(e) =>
                      setMessageData({
                        ...messageData,
                        message: e.target.value,
                      })
                    }
                    placeholder="Type your message here..."
                    rows="8"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>

                {/* Status Message */}
                {sendStatus && (
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-xl ${
                      sendStatus.type === "success"
                        ? "bg-green-500/20 border border-green-500/30"
                        : "bg-red-500/20 border border-red-500/30"
                    }`}
                  >
                    {sendStatus.type === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
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

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !selectedCustomer}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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

export default SendMessageModal;
