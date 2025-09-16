import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot} from 'firebase/firestore';
import { Users, Package, ShoppingCart, DollarSign} from 'lucide-react';

const RealtimeStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCheckouts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    outOfStockProducts: 0,
    activeUsers: 0,
    completedOrders: 0,
    paidOrders: 0,
    pendingRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  // Currency formatter to match OrderManagement
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const unsubscribes = [];

    // Listen to users collection
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs;
      setStats(prev => ({
        ...prev,
        totalUsers: users.length,
        // You can add more logic to determine active users based on your criteria
        activeUsers: users.filter(doc => {
          const userData = doc.data();
          // Example: users active in last 30 days
          const lastActive = userData.lastActive?.toDate();
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return lastActive && lastActive > thirtyDaysAgo;
        }).length
      }));
    });

    // Listen to products collection
    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const products = snapshot.docs;
      const outOfStock = products.filter(doc => {
        const productData = doc.data();
        return productData.stock === 0 || productData.status === 'out_of_stock';
      }).length;

      setStats(prev => ({
        ...prev,
        totalProducts: products.length,
        outOfStockProducts: outOfStock
      }));
    });

    // Listen to checkouts collection - FIXED TO MATCH ORDER MANAGEMENT LOGIC
    const checkoutsUnsubscribe = onSnapshot(collection(db, 'checkouts'), (snapshot) => {
      const checkouts = snapshot.docs;
      let totalRevenue = 0;
      let pendingRevenue = 0;
      let pendingCount = 0;
      let completedCount = 0;
      let paidCount = 0;

      checkouts.forEach(doc => {
        const checkoutData = doc.data();
        
        // FIXED: Use pricing.total instead of amount to match OrderManagement
        const amount = checkoutData.pricing?.total || checkoutData.amount || 0;
        
        // Count by order status
        if (checkoutData.status === 'completed') {
          completedCount++;
        } else if (checkoutData.status === 'pending') {
          pendingCount++;
        }
        
        // FIXED: Calculate revenue based on paymentStatus like OrderManagement
        if (checkoutData.paymentStatus === 'paid') {
          totalRevenue += parseFloat(amount);
          paidCount++;
        } else if (checkoutData.paymentStatus === 'pending') {
          pendingRevenue += parseFloat(amount);
        }
      });

      setStats(prev => ({
        ...prev,
        totalCheckouts: checkouts.length,
        totalRevenue: totalRevenue,
        pendingRevenue: pendingRevenue,
        pendingOrders: pendingCount,
        completedOrders: completedCount,
        paidOrders: paidCount
      }));
    });

    // Listen to inventory collection if it exists
    const inventoryUnsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      // Handle inventory data if needed
    }, (error) => {
      // Handle case where inventory collection might not exist
      console.log('Inventory collection not found or no access');
    });

    unsubscribes.push(usersUnsubscribe, productsUnsubscribe, checkoutsUnsubscribe, inventoryUnsubscribe);
    setLoading(false);

    // Cleanup function
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: `+${stats.activeUsers} active`,
      icon: Users,
      color: 'bg-blue-500',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      change: `${stats.outOfStockProducts} out of stock`,
      icon: Package,
      color: 'bg-green-500',
      changeColor: stats.outOfStockProducts > 0 ? 'text-red-600' : 'text-gray-500'
    },
    {
      title: 'Total Orders',
      value: stats.totalCheckouts,
      change: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      changeColor: 'text-yellow-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: `${stats.paidOrders} paid orders`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      changeColor: 'text-green-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-xs ${stat.changeColor} mt-1`}>{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            </div>
            
            {/* Live indicator */}
            <div className="flex items-center mt-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>

            {/* Additional revenue info for revenue card */}
            {stat.title === 'Total Revenue' && stats.pendingRevenue > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats.pendingRevenue)} pending
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RealtimeStats;