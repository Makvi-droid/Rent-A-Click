import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot} from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const RealtimeCharts = () => {
  const [chartData, setChartData] = useState({
    dailyOrders: [],
    monthlyRevenue: [],
    productCategories: [],
    orderStatuses: []
  });
  const [selectedChart, setSelectedChart] = useState('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes = [];

    // Listen to checkouts for real-time order data
    const checkoutsUnsubscribe = onSnapshot(collection(db, 'checkouts'), (snapshot) => {
      const checkouts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      // Process daily orders data
      const dailyOrdersMap = {};
      const last7Days = [];
      
      // Generate last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyOrdersMap[dateStr] = 0;
        last7Days.push(dateStr);
      }

      // Count orders per day
      checkouts.forEach(checkout => {
        const dateStr = checkout.createdAt.toISOString().split('T')[0];
        if (dailyOrdersMap.hasOwnProperty(dateStr)) {
          dailyOrdersMap[dateStr]++;
        }
      });

      const dailyOrdersData = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        orders: dailyOrdersMap[date] || 0
      }));

      // Process monthly revenue data - FIXED TO MATCH ORDER MANAGEMENT LOGIC
      const monthlyRevenueMap = {};
      const last6Months = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().substring(0, 7); // YYYY-MM format
        monthlyRevenueMap[monthStr] = 0;
        last6Months.push(monthStr);
      }

      checkouts.forEach(checkout => {
        // FIXED: Use the same logic as OrderManagement component
        // Check for paymentStatus === 'paid' instead of status === 'completed'
        if (checkout.paymentStatus === 'paid') {
          const monthStr = checkout.createdAt.toISOString().substring(0, 7);
          if (monthlyRevenueMap.hasOwnProperty(monthStr)) {
            // FIXED: Use pricing.total instead of amount to match OrderManagement
            const revenue = checkout.pricing?.total || checkout.amount || 0;
            monthlyRevenueMap[monthStr] += parseFloat(revenue);
          }
        }
      });

      const monthlyRevenueData = last6Months.map(month => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthlyRevenueMap[month] || 0
      }));

      // Process order statuses
      const statusCounts = {};
      checkouts.forEach(checkout => {
        const status = checkout.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const orderStatusesData = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        percentage: ((count / checkouts.length) * 100).toFixed(1)
      }));

      setChartData(prev => ({
        ...prev,
        dailyOrders: dailyOrdersData,
        monthlyRevenue: monthlyRevenueData,
        orderStatuses: orderStatusesData
      }));
    });

    // Listen to products for category data
    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const products = snapshot.docs.map(doc => doc.data());
      
      const categoryCounts = {};
      products.forEach(product => {
        const category = product.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      const productCategoriesData = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
        percentage: ((count / products.length) * 100).toFixed(1)
      }));

      setChartData(prev => ({
        ...prev,
        productCategories: productCategoriesData
      }));
    });

    unsubscribes.push(checkoutsUnsubscribe, productsUnsubscribe);
    setLoading(false);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const chartTabs = [
    { id: 'orders', label: 'Daily Orders', icon: '📊' },
    { id: 'revenue', label: 'Monthly Revenue', icon: '💰' },
    { id: 'categories', label: 'Product Categories', icon: '📦' },
    { id: 'status', label: 'Order Status', icon: '📈' }
  ];

  const renderChart = () => {
    switch (selectedChart) {
      case 'orders':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'categories':
        return (
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.productCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartData.productCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'status':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.orderStatuses} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="status" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {/* Chart tabs */}
      <div className="flex space-x-1 mb-4">
        {chartTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedChart(tab.id)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedChart === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart container */}
      <div className="mt-4">
        {renderChart()}
      </div>

      {/* Chart summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          {selectedChart === 'orders' && (
            <>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.dailyOrders.reduce((sum, day) => sum + day.orders, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Orders (7 days)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.dailyOrders.length > 0 ? 
                    (chartData.dailyOrders.reduce((sum, day) => sum + day.orders, 0) / 7).toFixed(1) : 
                    '0'
                  }
                </p>
                <p className="text-sm text-gray-500">Avg Orders/Day</p>
              </div>
            </>
          )}
          
          {selectedChart === 'revenue' && (
            <>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{chartData.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500">Total Revenue (6 months)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{chartData.monthlyRevenue.length > 0 ? 
                    (chartData.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0) / 6).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 
                    '0.00'
                  }
                </p>
                <p className="text-sm text-gray-500">Avg Revenue/Month</p>
              </div>
            </>
          )}
          
          {selectedChart === 'categories' && (
            <>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.productCategories.length}
                </p>
                <p className="text-sm text-gray-500">Total Categories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.productCategories.reduce((sum, cat) => sum + cat.count, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Products</p>
              </div>
            </>
          )}
          
          {selectedChart === 'status' && (
            <>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.orderStatuses.find(s => s.status === 'Completed')?.count || 0}
                </p>
                <p className="text-sm text-gray-500">Completed Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.orderStatuses.find(s => s.status === 'Pending')?.count || 0}
                </p>
                <p className="text-sm text-gray-500">Pending Orders</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeCharts;