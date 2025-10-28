import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";

// Create context for sharing notifications
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
  const [unreadCount, setUnreadCount] = useState(0);

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
              snapshot.docs.forEach((doc) => {
                existingDocs.current.products.add(doc.id);
              });
              isInitialLoad.current.products = false;
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
                    icon: AlertTriangle,
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
                    icon: AlertTriangle,
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

        // Monitor new orders
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

                // Log the data to help debug
                console.log("New checkout data:", data);

                // Access the nested pricing object for the total
                let amount = 0;
                if (data.pricing?.total) {
                  amount = data.pricing.total;
                } else if (data.total !== undefined) {
                  amount = data.total;
                } else if (data.amount !== undefined) {
                  amount = data.amount;
                } else if (data.grandTotal !== undefined) {
                  amount = data.grandTotal;
                } else if (data.totalAmount !== undefined) {
                  amount = data.totalAmount;
                } else if (data.totalPrice !== undefined) {
                  amount = data.totalPrice;
                } else if (data.items && Array.isArray(data.items)) {
                  // Calculate total from items if available
                  amount = data.items.reduce((sum, item) => {
                    const price =
                      item.price || item.totalPrice || item.totalItemCost || 0;
                    return sum + price; // totalItemCost already includes quantity
                  }, 0);
                }

                // Access nested customerInfo for better customer identification
                const customerEmail =
                  data.customerInfo?.email ||
                  data.customerInfo?.fullName ||
                  data.userEmail ||
                  data.email ||
                  data.customerEmail ||
                  data.userName ||
                  "Customer";

                addNotification({
                  id: `new-order-${change.doc.id}`,
                  type: "order",
                  title: "🛒 New Order Received!",
                  message: `Order #${(data.orderNumber || change.doc.id).slice(
                    -6
                  )} from ${customerEmail}${
                    amount > 0 ? ` - ₱${amount.toFixed(2)}` : ""
                  }`,
                  timestamp: new Date(),
                  icon: ShoppingCart,
                  color: "text-green-600",
                  bgColor: "bg-green-50",
                  borderColor: "border-l-green-500",
                  read: false,
                });
              }

              if (change.type === "modified") {
                // Log the modified data to help debug
                console.log("Modified checkout data:", data);

                // Access the nested pricing object for the total
                let amount = 0;
                if (data.pricing?.total) {
                  amount = data.pricing.total;
                } else if (data.total !== undefined) {
                  amount = data.total;
                } else if (data.amount !== undefined) {
                  amount = data.amount;
                } else if (data.grandTotal !== undefined) {
                  amount = data.grandTotal;
                } else if (data.totalAmount !== undefined) {
                  amount = data.totalAmount;
                } else if (data.totalPrice !== undefined) {
                  amount = data.totalPrice;
                } else if (data.items && Array.isArray(data.items)) {
                  amount = data.items.reduce((sum, item) => {
                    const price =
                      item.price || item.totalPrice || item.totalItemCost || 0;
                    return sum + price;
                  }, 0);
                }

                if (data.status === "completed") {
                  addNotification({
                    id: `order-completed-${change.doc.id}-${Date.now()}`,
                    type: "success",
                    title: "Order Completed",
                    message: `Order #${(
                      data.orderNumber || change.doc.id
                    ).slice(-6)} has been completed${
                      amount > 0 ? ` - ₱${amount.toFixed(2)}` : ""
                    }`,
                    timestamp: new Date(),
                    icon: CheckCircle,
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
                    message: `Order #${(
                      data.orderNumber || change.doc.id
                    ).slice(-6)} has been cancelled`,
                    timestamp: new Date(),
                    icon: X,
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

        // Monitor new user registrations
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
                  icon: Users,
                  color: "text-blue-600",
                  bgColor: "bg-blue-50",
                  borderColor: "border-l-blue-500",
                  read: false,
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
      const exists = prev.find((n) => n.id === notification.id);
      if (exists) return prev;

      const newNotifications = [notification, ...prev];
      return newNotifications;
    });

    setUnreadCount((prev) => prev + 1);

    // Play notification sound
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHmq+8OScTgwOUKzn77BiFglCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwOUKzn77BiFQlCmNzyvWMcBjiP1vLMeS0GI3fH8N2RQAoUXbTp66hVFApGnt/yvmwhBTGH0fPTgjQGHWq+8OWcTgwO"
      );
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      // Silent fail
    }
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId && !n.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
          return { ...n, read: true };
        }
        return n;
      })
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
