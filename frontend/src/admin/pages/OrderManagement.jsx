// OrderManagement.jsx - Enhanced with proper admin verification
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  deleteDoc,
  getDoc,
  where,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';

// Component imports
import OrdersHeader from '../OrderManagement/OrdersHeader';
import OrdersFilters from '../OrderManagement/OrdersFilters';
import OrdersTable from '../OrderManagement/OrdersTable';
import OrderDetailsModal from '../OrderManagement/OrderDetailsModal';
import OrdersStats from '../OrderManagement/OrdersStats';
import OrdersLoadingState from '../OrderManagement/OrdersLoadingState';
import OrdersErrorState from '../OrderManagement/OrdersErrorState';

const OrderManagement = () => {
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    paymentMethod: 'all',
    deliveryMethod: 'all',
    dateRange: 'all',
    searchQuery: '',
    customDateStart: '',
    customDateEnd: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    pendingRevenue: 0
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminCheckLoading(false);
        return;
      }

      try {
        const adminDocRef = doc(db, 'admin', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        
        if (adminDoc.exists()) {
          setIsAdmin(true);
          console.log('User verified as admin');
        } else {
          setIsAdmin(false);
          console.log('User is not an admin');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setError('Failed to verify admin privileges');
      } finally {
        setAdminCheckLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Fetch orders from Firebase (only if user is admin)
  useEffect(() => {
    if (!user || !isAdmin || adminCheckLoading) return;

    const ordersRef = collection(db, 'checkouts');
    const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(ordersQuery, 
      (snapshot) => {
        try {
          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          }));
          
          setOrders(ordersData);
          calculateStats(ordersData);
          setLoading(false);
        } catch (err) {
          console.error('Error processing orders:', err);
          setError('Failed to load orders');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError('Failed to connect to database. Please check your admin privileges.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin, adminCheckLoading]);

  // Calculate statistics
  const calculateStats = (ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: ordersData.filter(order => order.status === 'pending').length,
      confirmed: ordersData.filter(order => order.status === 'confirmed').length,
      completed: ordersData.filter(order => order.status === 'completed').length,
      cancelled: ordersData.filter(order => order.status === 'cancelled').length,
      totalRevenue: ordersData
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (order.pricing?.total || 0), 0),
      pendingRevenue: ordersData
        .filter(order => order.paymentStatus === 'pending')
        .reduce((sum, order) => sum + (order.pricing?.total || 0), 0)
    };
    setStats(stats);
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Payment status filter
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === filters.paymentStatus);
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(order => order.paymentInfo?.method === filters.paymentMethod);
    }

    // Delivery method filter
    if (filters.deliveryMethod !== 'all') {
      filtered = filtered.filter(order => order.rentalDetails?.deliveryMethod === filters.deliveryMethod);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'custom':
          if (filters.customDateStart && filters.customDateEnd) {
            const start = new Date(filters.customDateStart);
            const end = new Date(filters.customDateEnd);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= start && orderDate <= end;
            });
          }
          break;
        default:
          break;
      }

      if (startDate && filters.dateRange !== 'custom') {
        filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
      }
    }

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order =>
        order.id?.toLowerCase().includes(query) ||
        order.orderNumber?.toLowerCase().includes(query) ||
        order.customerInfo?.firstName?.toLowerCase().includes(query) ||
        order.customerInfo?.lastName?.toLowerCase().includes(query) ||
        order.customerInfo?.email?.toLowerCase().includes(query) ||
        order.customerInfo?.phone?.includes(query)
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, filters]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!isAdmin) {
      alert('You do not have permission to update orders');
      return;
    }

    try {
      const orderRef = doc(db, 'checkouts', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      console.log('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please check your admin privileges.');
      } else {
        alert('Failed to update order status: ' + error.message);
      }
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    if (!isAdmin) {
      alert('You do not have permission to update payment status');
      return;
    }

    try {
      const orderRef = doc(db, 'checkouts', orderId);
      await updateDoc(orderRef, {
        paymentStatus: newPaymentStatus,
        updatedAt: new Date()
      });
      console.log('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment status:', error);
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please check your admin privileges.');
      } else {
        alert('Failed to update payment status: ' + error.message);
      }
    }
  };

  // Delete order with enhanced error handling
  const deleteOrder = async (orderId) => {
    if (!isAdmin) {
      alert('You do not have permission to delete orders');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Attempting to delete order:', orderId);
      await deleteDoc(doc(db, 'checkouts', orderId));
      console.log('Order deleted successfully');
      alert('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      
      if (error.code === 'permission-denied') {
        alert('Permission denied. You may not have admin privileges or the Firestore security rules need to be updated.');
        console.error('Admin check - isAdmin:', isAdmin);
        console.error('User ID:', user?.uid);
      } else if (error.code === 'not-found') {
        alert('Order not found. It may have already been deleted.');
      } else {
        alert('Failed to delete order: ' + error.message);
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Loading state
  if (authLoading || adminCheckLoading || loading) {
    return <OrdersLoadingState />;
  }

  // Error state
  if (error) {
    return <OrdersErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">You need to be logged in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Not authorized (not an admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You need admin privileges to access the order management system.</p>
          <p className="mb-4 text-gray-400">User ID: {user.uid}</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Home
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <OrdersHeader 
          totalOrders={filteredOrders.length}
          user={user}
        />

        {/* Statistics */}
        <OrdersStats 
          stats={stats}
          formatCurrency={formatCurrency}
        />

        {/* Filters */}
        <OrdersFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          totalResults={filteredOrders.length}
        />

        {/* Orders Table */}
        <OrdersTable
          orders={currentOrders}
          currentPage={currentPage}
          totalPages={totalPages}
          ordersPerPage={ordersPerPage}
          onPageChange={setCurrentPage}
          onViewDetails={viewOrderDetails}
          onUpdateStatus={updateOrderStatus}
          onUpdatePaymentStatus={updatePaymentStatus}
          onDeleteOrder={deleteOrder}
          formatCurrency={formatCurrency}
        />

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedOrder(null);
            }}
            onUpdateStatus={updateOrderStatus}
            onUpdatePaymentStatus={updatePaymentStatus}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
};

export default OrderManagement;