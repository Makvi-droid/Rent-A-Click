// OrderDetailsModal.jsx - Fixed date rendering issue
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Package, 
  Truck, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit3,
  Save,
  Loader,
  Copy,
  ExternalLink
} from 'lucide-react';

const OrderDetailsModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onUpdatePaymentStatus, 
  formatCurrency 
}) => {
  const [isEditing, setIsEditing] = useState({ status: false, payment: false });
  const [tempValues, setTempValues] = useState({ status: '', paymentStatus: '' });
  const [isUpdating, setIsUpdating] = useState({ status: false, payment: false });
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    if (order) {
      setTempValues({
        status: order.status || '',
        paymentStatus: order.paymentStatus || ''
      });
    }
  }, [order]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', icon: Clock, text: 'Pending' },
      confirmed: { color: 'bg-blue-500', icon: CheckCircle, text: 'Confirmed' },
      completed: { color: 'bg-green-500', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-500', icon: XCircle, text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${config.color} shadow-lg`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-500', icon: CheckCircle, text: 'Paid' },
      pending: { color: 'bg-yellow-500', icon: AlertCircle, text: 'Pending' },
      failed: { color: 'bg-red-500', icon: XCircle, text: 'Failed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${config.color} shadow-lg`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const handleUpdateStatus = async (type) => {
    setIsUpdating({ ...isUpdating, [type]: true });
    
    try {
      if (type === 'status') {
        await onUpdateStatus(order.id, tempValues.status);
      } else {
        await onUpdatePaymentStatus(order.id, tempValues.paymentStatus);
      }
      setIsEditing({ ...isEditing, [type]: false });
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    } finally {
      setIsUpdating({ ...isUpdating, [type]: false });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Enhanced date formatting function to handle all Firestore timestamp formats
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      let parsedDate;
      
      // Handle different date formats
      if (date instanceof Date) {
        // Already a Date object
        parsedDate = date;
      } else if (typeof date === 'object' && date !== null) {
        // Handle Firestore Timestamp objects
        if (date.seconds !== undefined) {
          // Firestore Timestamp with seconds and nanoseconds
          parsedDate = new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
        } else if (typeof date.toDate === 'function') {
          // Firestore Timestamp with toDate method
          parsedDate = date.toDate();
        } else if (date._seconds !== undefined) {
          // Alternative Firestore Timestamp format
          parsedDate = new Date(date._seconds * 1000 + (date._nanoseconds || 0) / 1000000);
        } else {
          // Try to convert object to string and parse
          console.warn('Unknown date object format:', date);
          return 'Invalid Date Format';
        }
      } else if (typeof date === 'string' || typeof date === 'number') {
        // String or timestamp number
        parsedDate = new Date(date);
      } else {
        console.warn('Unknown date format:', typeof date, date);
        return 'Unknown Date Format';
      }
      
      // Validate the parsed date
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        console.warn('Invalid date after parsing:', date);
        return 'Invalid Date';
      }
      
      // Format the date
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(parsedDate);
      
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Date Error';
    }
  };

  // Enhanced rental date formatter with better error handling
  const formatRentalDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      // Handle different date value types
      let dateToFormat;
      
      if (typeof dateValue === 'object' && dateValue !== null) {
        // Handle Firestore Timestamp objects
        if (dateValue.seconds !== undefined) {
          dateToFormat = new Date(dateValue.seconds * 1000);
        } else if (typeof dateValue.toDate === 'function') {
          dateToFormat = dateValue.toDate();
        } else {
          // Try to extract date string if it's an object with date info
          dateToFormat = dateValue;
        }
      } else {
        dateToFormat = dateValue;
      }
      
      // If it's already a nicely formatted string, return as is
      if (typeof dateToFormat === 'string' && (
        dateToFormat.includes('/') || 
        dateToFormat.includes('-') || 
        dateToFormat.match(/^\w+\s+\d{1,2},\s+\d{4}$/)
      )) {
        return dateToFormat;
      }
      
      // Try to parse as date
      const parsedDate = new Date(dateToFormat);
      
      if (isNaN(parsedDate.getTime())) {
        // If can't parse, return original value as string
        return String(dateToFormat);
      }
      
      // Format successfully parsed date
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(parsedDate);
      
    } catch (error) {
      console.error('Error formatting rental date:', error, dateValue);
      // Return original value as string if all else fails
      return String(dateValue);
    }
  };

  // Helper function to safely render any value as string
  const safeRender = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      // Handle objects that might be timestamps
      if (value.seconds !== undefined || typeof value.toDate === 'function') {
        return formatDate(value);
      }
      // For other objects, try to stringify safely
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl border border-gray-700/50 transform transition-all duration-300 scale-100 animate-in">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-gray-400">#{safeRender(order.id?.slice(-8), 'Unknown')}</p>
                  <button
                    onClick={() => copyToClipboard(order.id)}
                    className="p-1 text-gray-400 hover:text-white transition-colors rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {showCopied && (
                    <span className="text-green-400 text-sm animate-fade-in">Copied!</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Order Info */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Status */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-300">Order Status</h3>
                      <button
                        onClick={() => setIsEditing({ ...isEditing, status: !isEditing.status })}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {isEditing.status ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={tempValues.status}
                          onChange={(e) => setTempValues({ ...tempValues, status: e.target.value })}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleUpdateStatus('status')}
                          disabled={isUpdating.status}
                          className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {isUpdating.status ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      getStatusBadge(order.status)
                    )}
                  </div>

                  {/* Payment Status */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-300">Payment Status</h3>
                      <button
                        onClick={() => setIsEditing({ ...isEditing, payment: !isEditing.payment })}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {isEditing.payment ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={tempValues.paymentStatus}
                          onChange={(e) => setTempValues({ ...tempValues, paymentStatus: e.target.value })}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                        <button
                          onClick={() => handleUpdateStatus('payment')}
                          disabled={isUpdating.payment}
                          className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {isUpdating.payment ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      getPaymentStatusBadge(order.paymentStatus)
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Full Name</label>
                        <p className="text-white font-medium">
                          {safeRender(order.customerInfo?.firstName)} {safeRender(order.customerInfo?.lastName)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-white">{safeRender(order.customerInfo?.email)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Phone</label>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-white">{safeRender(order.customerInfo?.phone)}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Address</label>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-white">
                            {order.customerInfo?.address ? 
                              `${safeRender(order.customerInfo.address)}, ${safeRender(order.customerInfo.city)}` : 
                              'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rental Details */}
                {order.rentalDetails && (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-green-400" />
                      Rental Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Start Date</label>
                        <p className="text-white">{formatRentalDate(order.rentalDetails.startDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">End Date</label>
                        <p className="text-white">{formatRentalDate(order.rentalDetails.endDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Duration</label>
                        <p className="text-white">{safeRender(order.rentalDetails.duration || order.rentalDetails.rentalDays)} days</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Delivery Method</label>
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <p className="text-white capitalize">{safeRender(order.rentalDetails.deliveryMethod)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Payment & Summary */}
              <div className="space-y-6">
                
                {/* Payment Information */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Method</label>
                      <p className="text-white capitalize">{safeRender(order.paymentInfo?.method)}</p>
                    </div>
                    {order.paymentInfo?.reference && (
                      <div>
                        <label className="text-sm text-gray-400">Reference</label>
                        <p className="text-white font-mono text-sm">{safeRender(order.paymentInfo.reference)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    {order.pricing?.subtotal !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">{formatCurrency(order.pricing.subtotal)}</span>
                      </div>
                    )}
                    {order.pricing?.deliveryFee !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delivery Fee</span>
                        <span className="text-white">{formatCurrency(order.pricing.deliveryFee)}</span>
                      </div>
                    )}
                    {order.pricing?.tax !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tax</span>
                        <span className="text-white">{formatCurrency(order.pricing.tax)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-white">Total</span>
                        <span className="text-xl font-bold text-green-400">
                          {formatCurrency(order.pricing?.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-400" />
                    Timeline
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created</span>
                      <span className="text-white">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-white">{formatDate(order.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/50">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200"
            >
              Close
            </button>
            
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .animate-in {
          animation: modalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-in-out;
        }
        @keyframes modalIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailsModal;