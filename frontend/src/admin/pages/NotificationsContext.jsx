import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  Users,
} from "lucide-react";

// NotificationsContext
const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isInitialLoad = useRef({
    products: true,
    checkouts: true,
    users: true,
  });

  const existingDocs = useRef({
    products: new Set(),
    checkouts: new Set(),
    users: new Set(),
  });

  useEffect(() => {
    let unsubscribes = [];

    const initializeFirebase = async () => {
      try {
        // Dynamic import to handle Firebase
        const firebaseModule = await import("../../firebase");
        const db = firebaseModule.db;
        const { collection, onSnapshot, query, orderBy } = await import(
          "firebase/firestore"
        );

        // Monitor products for stock changes
        const productsUnsubscribe = onSnapshot(
          collection(db, "products"),
          (snapshot) => {
            if (isInitialLoad.current.products) {
              snapshot.docs.forEach((doc) => {
                existingDocs.current.products.add(doc.id);
              });
              isInitialLoad.current.products = false;
              setIsLoading(false);
              return;
            }

            snapshot.docChanges().forEach((change) => {
              const data = change.doc.data();

              if (change.type === "modified") {
                if (data.stock <= 5 && data.stock > 0) {
                  addNotification({
                    id: `low-stock-${change.doc.id}-${Date.now()}`,
                    type: "warning",
                    title: "Low Stock Alert",
                    message: `${data.name} is running low (${data.stock} remaining)`,
                    timestamp: new Date(),
                    icon: "AlertTriangle",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-l-yellow-500",
                    read: false,
                  });
                } else if (data.stock === 0) {
                  addNotification({
                    id: `out-of-stock-${change.doc.id}-${Date.now()}`,
                    type: "error",
                    title: "Out of Stock",
                    message: `${data.name} is now out of stock`,
                    timestamp: new Date(),
                    icon: "AlertTriangle",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-l-red-500",
                    read: false,
                  });
                }
              }
            });
          }
        );

        // Monitor checkouts for new orders
        const checkoutsUnsubscribe = onSnapshot(
          query(collection(db, "checkouts"), orderBy("createdAt", "desc")),
          (snapshot) => {
            if (isInitialLoad.current.checkouts) {
              snapshot.docs.forEach((doc) => {
                existingDocs.current.checkouts.add(doc.id);
              });
              isInitialLoad.current.checkouts = false;
              return;
            }

            snapshot.docChanges().forEach((change) => {
              const data = change.doc.data();

              if (
                change.type === "added" &&
                !existingDocs.current.checkouts.has(change.doc.id)
              ) {
                existingDocs.current.checkouts.add(change.doc.id);

                addNotification({
                  id: `new-order-${change.doc.id}`,
                  type: "order",
                  title: "New Order Received",
                  message: `Order #${change.doc.id.slice(-6)} from ${
                    data.userEmail || "Customer"
                  } - ₱${data.amount?.toFixed(2) || "0.00"}`,
                  timestamp: new Date(),
                  icon: "ShoppingCart",
                  color: "text-green-600",
                  bgColor: "bg-green-50",
                  borderColor: "border-l-green-500",
                  read: false,
                });

                playNotificationSound();
              }

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
                    icon: "CheckCircle",
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                    borderColor: "border-l-green-500",
                    read: false,
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
                    icon: "X",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-l-red-500",
                    read: false,
                  });
                }
              }
            });
          }
        );

        // Monitor users for new registrations
        const usersUnsubscribe = onSnapshot(
          collection(db, "users"),
          (snapshot) => {
            if (isInitialLoad.current.users) {
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
                  icon: "Users",
                  color: "text-blue-600",
                  bgColor: "bg-blue-50",
                  borderColor: "border-l-blue-500",
                  read: false,
                });
              }
            });
          }
        );

        unsubscribes = [
          productsUnsubscribe,
          checkoutsUnsubscribe,
          usersUnsubscribe,
        ];
      } catch (error) {
        console.error("Error initializing notifications:", error);
        setIsLoading(false);
      }
    };

    initializeFirebase();

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe && unsubscribe());
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications((prev) => {
      const exists = prev.find((n) => n.id === notification.id);
      if (exists) return prev;
      return [notification, ...prev];
    });
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHmq+8OScTgwOUKzn77BiFglCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwO"
      );
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.read).length;
  };

  const getFilterCount = (type) => {
    if (type === "all") return notifications.length;
    return notifications.filter((n) => n.type === type).length;
  };

  const value = {
    notifications,
    isLoading,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    getUnreadCount,
    getFilterCount,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Bell Icon Component (for Header or anywhere)
export const NotificationBell = () => {
  const { notifications, getUnreadCount, markAllAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = getUnreadCount();

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

  const iconMap = {
    AlertTriangle: AlertTriangle,
    CheckCircle: CheckCircle,
    ShoppingCart: ShoppingCart,
    Users: Users,
    X: X,
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) markAllAsRead();
        }}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
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
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

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
                  {notifications.slice(0, 10).map((notification) => {
                    const IconComponent = iconMap[notification.icon] || Bell;
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
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
