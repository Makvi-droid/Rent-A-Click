// OrdersTable.jsx - Enhanced with item display, physical ID verification, and fixed penalty
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
  Package,
  Shield,
  ShieldCheck,
  ShieldX,
  Image,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  FileImage,
  ChevronDown,
  ChevronUp,
  ShieldAlert
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
  onUpdateReturnStatus,
  onUpdatePhysicalIdStatus, // NEW
  onDeleteOrder,
  formatCurrency,
  formatDate,
  latePenaltyAmount = 150 // NEW: Fixed penalty amount
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Safe date formatting function - moved to component level
  const safeFormatDate = (date, options = {}) => {
    // Use the passed formatDate function if available
    if (formatDate && typeof formatDate === 'function') {
      return formatDate(date, options);
    }
    
    if (!date) return 'N/A';
    
    try {
      let validDate;
      
      if (date instanceof Date) {
        validDate = date;
      } else if (typeof date === 'object' && date !== null) {
        if (date.seconds !== undefined) {
          validDate = new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
        } else if (typeof date.toDate === 'function') {
          validDate = date.toDate();
        } else {
          console.warn('Unknown date object:', date);
          return 'Invalid Date';
        }
      } else {
        validDate = new Date(date);
      }
      
      if (!validDate || isNaN(validDate.getTime())) {
        console.warn('Invalid date:', date);
        return 'Invalid Date';
      }
      
      const defaultOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Manila'
      };
      
      return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(validDate);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Date Error';
    }
  };

  const formatRentalDate = (date) => {
    if (!date) return 'N/A';
    
    // Use the passed formatDate function if available
    if (formatDate && typeof formatDate === 'function') {
      return formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    try {
      const validDate = new Date(date);
      if (isNaN(validDate.getTime())) {
        if (typeof date === 'string' && (date.includes('/') || date.includes('-'))) {
          return date;
        }
        return 'Invalid Date';
      }
      return validDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting rental date:', error);
      return 'Date Error';
    }
  };

  // Check if return is overdue
  const isReturnOverdue = (order) => {
    if (order.itemReturned) return false;
    
    const returnDate = new Date(order.rentalDetails?.endDate);
    const returnTime = order.rentalDetails?.returnTime;
    
    if (returnTime) {
      const [hours, minutes] = returnTime.split(':');
      returnDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    return new Date() > returnDate;
  };

  // Calculate penalty
  const calculatePenalty = (order) => {
    return isReturnOverdue(order) && !order.itemReturned ? latePenaltyAmount : 0;
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

  // ENHANCED: ID Verification Badge with Physical Verification
  const getIdVerificationBadge = (order) => {
  if (order.physicalIdShown) {
    return (
      <div className="flex items-center space-x-1" title="Physical ID Shown">
        <ShieldCheck className="w-4 h-4 text-green-400" />
      </div>
    );
  } else {
    return (
      <div className="flex items-center space-x-1" title="Physical ID Not Shown">
        <ShieldX className="w-4 h-4 text-gray-400" />
      </div>
    );
  }
};

  // Return Status Badge
  const getReturnStatusBadge = (order) => {
    const isOverdue = isReturnOverdue(order);
    
    if (order.itemReturned) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Returned
        </span>
      );
    } else if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-400 border-red-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-orange-500/20 text-orange-400 border-orange-500/30">
          <RotateCcw className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  // NEW: Render rental items with images and names
  const renderRentalItems = (order) => {
    const items = order.items || order.rentalItems || [];
    if (items.length === 0) return <span className="text-gray-400">No items</span>;

    return (
      <div className="space-y-2">
        {items.slice(0, 2).map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-700 rounded overflow-hidden flex-shrink-0">
              {item.imageUrl || item.image ? (
                <img
                  src={item.imageUrl || item.image}
                  alt={item.name || 'Item'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full ${item.imageUrl || item.image ? 'hidden' : 'flex'} items-center justify-center`}>
                <FileImage className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate font-medium">
                {item.name || item.title || 'Unnamed Item'}
              </p>
              {item.brand && (
                <p className="text-xs text-gray-400 truncate">{item.brand}</p>
              )}
            </div>
            {item.quantity && (
              <span className="text-xs text-gray-400">x{item.quantity}</span>
            )}
          </div>
        ))}
        {items.length > 2 && (
          <p className="text-xs text-gray-400">+{items.length - 2} more items</p>
        )}
      </div>
    );
  };

  // ENHANCED: Action Menu with Physical ID Verification
  const ActionMenu = ({ order, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="absolute right-0 top-8 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
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

          {/* Return Status Toggle */}
          <div className="px-4 py-2">
            <label className="flex items-center space-x-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={order.itemReturned || false}
                onChange={(e) => {
                  onUpdateReturnStatus(order.id, e.target.checked, e.target.checked ? new Date() : null);
                  onClose();
                }}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span>Mark as Returned</span>
            </label>
          </div>

          {/* NEW: Physical ID Verification Toggle */}
          {order.idSubmitted && (
            
<div className="px-4 py-2">
  <label className="flex items-center space-x-2 text-xs text-gray-300">
    <input
      type="checkbox"
      checked={order.physicalIdShown || false}
      onChange={(e) => {
        onUpdatePhysicalIdStatus(order.id, e.target.checked);
        onClose();
      }}
      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
    />
    <span>Customer Showed Physical ID</span>
  </label>
</div>

          )}
          
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

  const toggleRowExpansion = (orderId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
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
                <div className="flex items-center gap-2">
                  {getIdVerificationBadge(order)}
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center gap-2">
                  {getReturnStatusBadge(order)}
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
              </div>
            </div>

            {/* Mobile Rental Items Display */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">Rental Items</label>
              {renderRentalItems(order)}
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{safeFormatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CreditCard className="w-4 h-4" />
                <span>{formatCurrency((order.pricing?.total || 0) + calculatePenalty(order))}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="capitalize">{order.rentalDetails?.deliveryMethod || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Package className="w-4 h-4" />
                <span>{(order.items || order.rentalItems || []).length} items</span>
              </div>
            </div>

            {/* Penalty Warning for Mobile */}
            {calculatePenalty(order) > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-2 mb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-xs font-medium">
                    Late Return Penalty: {formatCurrency(calculatePenalty(order))}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
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
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Items</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Date</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Total</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Status</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Payment</th>
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">Return</th>
                <th className="text-center py-4 px-4 text-gray-300 font-semibold">Physical ID</th>
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

                    {/* NEW: Items Column with Images */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleRowExpansion(order.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {expandedRows.has(order.id) ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </button>
                        <div>
                          <span className="text-white text-sm">
                            {(order.items || order.rentalItems || []).length} items
                          </span>
                          <div className="text-xs text-gray-400">
                            {order.pricing?.rentalDays || order.rentalDetails?.duration || 0} days
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-white text-sm">
                          {safeFormatDate(order.createdAt)}
                        </span>
                        {order.rentalDetails?.startDate && (
                          <span className="text-xs text-gray-400">
                            Rental: {formatRentalDate(order.rentalDetails.startDate)}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold">
                          {formatCurrency((order.pricing?.total || 0) + calculatePenalty(order))}
                        </span>
                        {calculatePenalty(order) > 0 && (
                          <span className="text-xs text-red-400">
                            +{formatCurrency(calculatePenalty(order))} penalty
                          </span>
                        )}
                      </div>
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
                      {getReturnStatusBadge(order)}
                    </td>

                    {/* ENHANCED: ID Status Column */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      {getIdVerificationBadge(order)}
                      <span className="text-xs text-gray-400">
                        {order.physicalIdShown ? 'Shown' : 'Not Shown'}
                      </span>
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

                  {/* Expandable Row for Item Details */}
                  {expandedRows.has(order.id) && (
                    <tr className="bg-gray-700/20">
                      <td colSpan="10" className="px-4 py-3 border-b border-gray-700/30">
                        <div className="space-y-2">
                          <h4 className="text-white font-medium text-sm mb-2">Rental Items:</h4>
                          {renderRentalItems(order)}
                        </div>
                      </td>
                    </tr>
                  )}
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