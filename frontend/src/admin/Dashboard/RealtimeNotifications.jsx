import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Bell, X, AlertTriangle, CheckCircle, ShoppingCart, Users } from 'lucide-react';

const RealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribes = [];
    const notificationQueue = [];

    // Monitor low stock products
    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        
        if (change.type === 'modified' && data.stock <= 5 && data.stock > 0) {
          addNotification({
            id: `low-stock-${change.doc.id}`,
            type: 'warning',
            title: 'Low Stock Alert',
            message: `${data.name} is running low (${data.stock} remaining)`,
            timestamp: new Date(),
            icon: AlertTriangle,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          });
        } else if (change.type === 'modified' && data.stock === 0) {
          addNotification({
            id: `out-of-stock-${change.doc.id}`,
            type: 'error',
            title: 'Out of Stock',
            message: `${data.name} is now out of stock`,
            timestamp: new Date(),
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          });
        }
      });
    });

    // Monitor new orders
    const checkoutsUnsubscribe = onSnapshot(
      query(collection(db, 'checkouts'), orderBy('createdAt', 'desc'), limit(1)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            addNotification({
              id: `new-order-${change.doc.id}`,
              type: 'success',
              title: 'New Order',
              message: `Order ${change.doc.id} placed by ${data.userEmail} - $${data.amount}`,
              timestamp: new Date(),
              icon: ShoppingCart,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            });
          }
        });
      }
    );

    // Monitor order status changes
    const orderStatusUnsubscribe = onSnapshot(collection(db, 'checkouts'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          if (data.status === 'completed') {
            addNotification({
              id: `order-completed-${change.doc.id}`,
              type: 'success',
              title: 'Order Completed',
              message: `Order ${change.doc.id} has been completed - $${data.amount}`,
              timestamp: new Date(),
              icon: CheckCircle,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            });
          } else if (data.status === 'cancelled') {
            addNotification({
              id: `order-cancelled-${change.doc.id}`,
              type: 'error',
              title: 'Order Cancelled',
              message: `Order ${change.doc.id} has been cancelled`,
              timestamp: new Date(),
              icon: X,
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            });
          }
        }
      });
    });

    // Monitor new user registrations
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          addNotification({
            id: `new-user-${change.doc.id}`,
            type: 'info',
            title: 'New User Registration',
            message: `${data.name || data.email} has registered`,
            timestamp: new Date(),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          });
        }
      });
    });

    unsubscribes.push(productsUnsubscribe, checkoutsUnsubscribe, orderStatusUnsubscribe, usersUnsubscribe);

    function addNotification(notification) {
      setNotifications(prev => {
        const exists = prev.find(n => n.id === notification.id);
        if (exists) return prev;
        
        const newNotifications = [notification, ...prev].slice(0, 20); // Keep only 20 most recent
        return newNotifications;
      });
      
      setUnreadCount(prev => prev + 1);

      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        removeNotification(notification.id);
      }, 10000);
    }

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
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
    
    if (minutes < 1) return 'Just now';
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
          className="relative p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
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
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${notification.bgColor} border-l-4 border-l-${notification.color.split('-')[1]}-500`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`${notification.color} mt-0.5`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
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
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default RealtimeNotifications;