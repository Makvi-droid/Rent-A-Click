import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  Users,
} from "lucide-react";

const RealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track if this is the initial load to prevent false notifications
  const isInitialLoad = useRef({
    products: true,
    checkouts: true,
    users: true,
  });

  // Track existing document IDs to prevent duplicates
  const existingDocs = useRef({
    products: new Set(),
    checkouts: new Set(),
    users: new Set(),
  });

  useEffect(() => {
    // Import Firebase dynamically
    const initializeFirebase = async () => {
      try {
        const { db } = await import("../../firebase");
        const { collection, onSnapshot, query, orderBy } = await import(
          "firebase/firestore"
        );

        const unsubscribes = [];

        // Monitor low stock products
        const productsUnsubscribe = onSnapshot(
          collection(db, "products"),
          (snapshot) => {
            if (isInitialLoad.current.products) {
              // On initial load, just record existing products
              snapshot.docs.forEach((doc) => {
                existingDocs.current.products.add(doc.id);
              });
              isInitialLoad.current.products = false;
              return;
            }

            snapshot.docChanges().forEach((change) => {
              const data = change.doc.data();

              // Only trigger on actual modifications, not initial adds
              if (change.type === "modified") {
                if (data.stock <= 5 && data.stock > 0) {
                  addNotification({
                    id: `low-stock-${change.doc.id}-${Date.now()}`,
                    type: "warning",
                    title: "Low Stock Alert",
                    message: `${data.name} is running low (${data.stock} remaining)`,
                    timestamp: new Date(),
                    icon: AlertTriangle,
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-l-yellow-500",
                  });
                } else if (data.stock === 0) {
                  addNotification({
                    id: `out-of-stock-${change.doc.id}-${Date.now()}`,
                    type: "error",
                    title: "Out of Stock",
                    message: `${data.name} is now out of stock`,
                    timestamp: new Date(),
                    icon: AlertTriangle,
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-l-red-500",
                  });
                }
              }
            });
          }
        );

        // Monitor new orders - FIXED: Removed limit(1) to track all orders
        const checkoutsUnsubscribe = onSnapshot(
          query(collection(db, "checkouts"), orderBy("createdAt", "desc")),
          (snapshot) => {
            if (isInitialLoad.current.checkouts) {
              // On initial load, record all existing orders
              snapshot.docs.forEach((doc) => {
                existingDocs.current.checkouts.add(doc.id);
              });
              isInitialLoad.current.checkouts = false;
              return;
            }

            snapshot.docChanges().forEach((change) => {
              const data = change.doc.data();

              // Only notify for truly new orders
              if (
                change.type === "added" &&
                !existingDocs.current.checkouts.has(change.doc.id)
              ) {
                existingDocs.current.checkouts.add(change.doc.id);

                addNotification({
                  id: `new-order-${change.doc.id}`,
                  type: "success",
                  title: "🛒 New Order Received!",
                  message: `Order #${change.doc.id.slice(-6)} from ${
                    data.userEmail || "Customer"
                  } - ₱${data.amount?.toFixed(2) || "0.00"}`,
                  timestamp: new Date(),
                  icon: ShoppingCart,
                  color: "text-green-600",
                  bgColor: "bg-green-50",
                  borderColor: "border-l-green-500",
                });
              }

              // Monitor order status changes
              if (change.type === "modified") {
                if (data.status === "completed") {
                  addNotification({
                    id: `order-completed-${change.doc.id}-${Date.now()}`,
                    type: "success",
                    title: "Order Completed",
                    message: `Order #${change.doc.id.slice(
                      -6
                    )} has been completed - ₱${data.amount?.toFixed(2)}`,
                    timestamp: new Date(),
                    icon: CheckCircle,
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                    borderColor: "border-l-green-500",
                  });
                } else if (data.status === "cancelled") {
                  addNotification({
                    id: `order-cancelled-${change.doc.id}-${Date.now()}`,
                    type: "error",
                    title: "Order Cancelled",
                    message: `Order #${change.doc.id.slice(
                      -6
                    )} has been cancelled`,
                    timestamp: new Date(),
                    icon: X,
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-l-red-500",
                  });
                }
              }
            });
          }
        );

        // Monitor new user registrations
        const usersUnsubscribe = onSnapshot(
          collection(db, "users"),
          (snapshot) => {
            if (isInitialLoad.current.users) {
              // On initial load, record existing users
              snapshot.docs.forEach((doc) => {
                existingDocs.current.users.add(doc.id);
              });
              isInitialLoad.current.users = false;
              return;
            }

            snapshot.docChanges().forEach((change) => {
              if (
                change.type === "added" &&
                !existingDocs.current.users.has(change.doc.id)
              ) {
                existingDocs.current.users.add(change.doc.id);
                const data = change.doc.data();

                addNotification({
                  id: `new-user-${change.doc.id}`,
                  type: "info",
                  title: "New User Registration",
                  message: `${
                    data.name || data.email || "New user"
                  } has registered`,
                  timestamp: new Date(),
                  icon: Users,
                  color: "text-blue-600",
                  bgColor: "bg-blue-50",
                  borderColor: "border-l-blue-500",
                });
              }
            });
          }
        );

        unsubscribes.push(
          productsUnsubscribe,
          checkoutsUnsubscribe,
          usersUnsubscribe
        );

        return () => {
          unsubscribes.forEach((unsubscribe) => unsubscribe());
        };
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    const cleanup = initializeFirebase();
    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications((prev) => {
      // Check if notification with same ID already exists
      const exists = prev.find((n) => n.id === notification.id);
      if (exists) return prev;

      // Add new notification to the top, keep only 20 most recent
      const newNotifications = [notification, ...prev].slice(0, 20);
      return newNotifications;
    });

    setUnreadCount((prev) => prev + 1);

    // Play notification sound (optional)
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHmq+8OScTgwOUKzn77BiFglCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwO"
      );
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore autoplay errors
    } catch (e) {
      // Silent fail for audio
    }

    // Auto-remove notification after 15 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 15000);
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            if (!showNotifications) markAllAsRead();
          }}
          className="relative p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:scale-105"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
                {notifications.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({notifications.length})
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${notification.bgColor} border-l-4 ${notification.borderColor}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`${notification.color} mt-0.5 flex-shrink-0`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 break-words">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                          aria-label="Dismiss notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-10"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default RealtimeNotifications;
