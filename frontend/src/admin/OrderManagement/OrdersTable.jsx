// OrdersTable.jsx
import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  User,
  CreditCard,
  MapPin,
  Package
} from 'lucide-react';

const OrdersTable = ({
  orders,
  currentPage,
  totalPages,
  ordersPerPage,
  onPageChange,
  onViewDetails,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onDeleteOrder,
  formatCurrency
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const toggleRowExpansion = (orderId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      paid: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      failed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
      refunded: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' }
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ActionMenu = ({ order, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="absolute right-0 top-8 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
        <div className="py-1">
          <button
            onClick={() => {
              onViewDetails(order);
              onClose();
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          
          <div className="border-t border-gray-700 my-1"></div>
          
          <div className="px-4 py-2">
            <label className="block text-xs text-gray-400 mb-1">Status</label>
            <select
              value={order.status || 'pending'}
              onChange={(e) => {
                onUpdateStatus(order.id, e.target.value);
                onClose();
              }}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="px-4 py-2">
            <label className="block text-xs text-gray-400 mb-1">Payment</label>
            <select
              value={order.paymentStatus || 'pending'}
              onChange={(e) => {
                onUpdatePaymentStatus(order.id, e.target.value);
                onClose();
              }}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div className="border-t border-gray-700 my-1"></div>
          
          <button
            onClick={() => {
              onDeleteOrder(order.id);
              onClose();
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            Delete Order
          </button>
        </div>
      </div>
    );
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-400">
          Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, orders.length)} of {orders.length} orders
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-2 rounded-lg text-sm ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : page === '...'
                    ? 'text-gray-500 cursor-default'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
        <div className="text-center text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
          <p>No orders match your current filters. Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      {/* Mobile View */}
      <div className="block lg:hidden">
        {orders.map((order) => (
          <div key={order.id} className="border-b border-gray-700 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-mono text-sm text-blue-400 mb-1">
                  #{order.id || order.orderNumber}
                </div>
                <div className="text-white font-medium">
                  {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(order.status)}
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CreditCard className="w-4 h-4" />
                <span>{formatCurrency(order.pricing?.total || 0)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="capitalize">{order.rentalDetails?.deliveryMethod || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Package className="w-4 h-4" />
                <span>{order.items?.length || 0} items</span>
              </div>
            </div>
            
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onViewDetails(order)}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                View Details
              </button>
              <div className="relative">
                <button
                  onClick={() => setActionMenuOpen(actionMenuOpen === order.id ? null : order.id)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <ActionMenu 
                  order={order} 
                  isOpen={actionMenuOpen === order.id}
                  onClose={() => setActionMenuOpen(null)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Order</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Customer</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Date</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Items</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Total</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Status</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Payment</th>
                <th className="text-right py-4 px-4 text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <tr 
                    className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                      expandedRows.has(order.id) ? 'bg-gray-700/20' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-blue-400">
                          #{order.id || order.orderNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.rentalDetails?.deliveryMethod && (
                            <span className="capitalize">{order.rentalDetails.deliveryMethod}</span>
                          )}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                        </span>
                        <span className="text-sm text-gray-400">
                          {order.customerInfo?.email}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-white text-sm">
                          {formatDate(order.createdAt)}
                        </span>
                        {order.rentalDetails?.startDate && (
                          <span className="text-xs text-gray-400">
                            Rental: {new Date(order.rentalDetails.startDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-white">
                          {order.items?.length || 0} items
                        </span>
                        <span className="text-xs text-gray-400">
                          {order.pricing?.rentalDays || 0} days
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <span className="text-white font-semibold">
                        {formatCurrency(order.pricing?.total || 0)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        {getPaymentStatusBadge(order.paymentStatus)}
                        {order.paymentInfo?.method && (
                          <span className="text-xs text-gray-400 capitalize">
                            {order.paymentInfo.method}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewDetails(order)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === order.id ? null : order.id)}
                            className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="More Actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <ActionMenu 
                            order={order} 
                            isOpen={actionMenuOpen === order.id}
                            onClose={() => setActionMenuOpen(null)}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Pagination />
    </div>
  );
};

export default OrdersTable;