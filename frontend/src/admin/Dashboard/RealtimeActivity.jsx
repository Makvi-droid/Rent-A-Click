import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { UserPlus, ShoppingCart, Package, AlertCircle, Clock } from 'lucide-react';

const RealtimeActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes = [];
    const allActivities = [];

    // Listen to recent checkouts
    const checkoutsQuery = query(
      collection(db, 'checkouts'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const checkoutsUnsubscribe = onSnapshot(checkoutsQuery, (snapshot) => {
      const checkoutActivities = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'checkout',
          message: `New order ${doc.id} by ${data.userEmail}`,
          amount: data.amount,
          status: data.status,
          timestamp: data.createdAt?.toDate() || new Date(),
          icon: ShoppingCart,
          color: getStatusColor(data.status)
        };
      });
      
      updateActivities('checkouts', checkoutActivities);
    });

    // Listen to recent users (if they have a createdAt field)
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const userActivity = {
            id: change.doc.id,
            type: 'user',
            message: `New user registered: ${data.name || data.email}`,
            timestamp: data.createdAt?.toDate() || new Date(),
            icon: UserPlus,
            color: 'text-blue-500'
          };
          
          addSingleActivity(userActivity);
        }
      });
    });

    // Listen to product changes
    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        let activity = null;

        if (change.type === 'added') {
          activity = {
            id: change.doc.id,
            type: 'product',
            message: `New product added: ${data.name}`,
            timestamp: data.createdAt?.toDate() || new Date(),
            icon: Package,
            color: 'text-green-500'
          };
        } else if (change.type === 'modified') {
          // Check if stock changed to 0
          if (data.stock === 0) {
            activity = {
              id: change.doc.id,
              type: 'product',
              message: `Product out of stock: ${data.name}`,
              timestamp: new Date(),
              icon: AlertCircle,
              color: 'text-red-500'
            };
          }
        }

        if (activity) {
          addSingleActivity(activity);
        }
      });
    });

    unsubscribes.push(checkoutsUnsubscribe, usersUnsubscribe, productsUnsubscribe);

    function updateActivities(type, newActivities) {
      setActivities(prev => {
        const filtered = prev.filter(activity => activity.type !== type);
        const combined = [...filtered, ...newActivities]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 20); // Keep only recent 20 activities
        return combined;
      });
    }

    function addSingleActivity(activity) {
      setActivities(prev => {
        const newActivities = [activity, ...prev]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 20);
        return newActivities;
      });
    }

    setLoading(false);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <div key={`${activity.id}-${index}`} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`${activity.color} p-2 rounded-full bg-gray-50`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                    {activity.amount && (
                      <span className="text-xs font-medium text-gray-700">
                        ${activity.amount}
                      </span>
                    )}
                    {activity.status && (
                      <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Showing {activities.length} recent activities
          </p>
        </div>
      )}
    </div>
  );
};

export default RealtimeActivity;