// OrdersFilters.jsx
import React, { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';

const OrdersFilters = ({ filters, onFilterChange, totalResults }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Payment Status' },
    { value: 'pending', label: 'Payment Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'All Payment Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'paypal', label: 'PayPal' }
  ];

  const deliveryMethodOptions = [
    { value: 'all', label: 'All Delivery Methods' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'delivery', label: 'Delivery' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const clearFilters = () => {
    onFilterChange('status', 'all');
    onFilterChange('paymentStatus', 'all');
    onFilterChange('paymentMethod', 'all');
    onFilterChange('deliveryMethod', 'all');
    onFilterChange('dateRange', 'all');
    onFilterChange('searchQuery', '');
    onFilterChange('customDateStart', '');
    onFilterChange('customDateEnd', '');
  };

  const hasActiveFilters = () => {
    return filters.status !== 'all' ||
           filters.paymentStatus !== 'all' ||
           filters.paymentMethod !== 'all' ||
           filters.deliveryMethod !== 'all' ||
           filters.dateRange !== 'all' ||
           filters.searchQuery.trim() !== '';
  };

  return (
    <div className="mb-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md text-sm">
              {totalResults} results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${
                showAdvanced 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Advanced
            </button>
            
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors duration-200"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, email, or phone..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => onFilterChange('paymentStatus', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {paymentStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => onFilterChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {paymentMethodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t border-gray-700 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Delivery Method */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Method</label>
                <select
                  value={filters.deliveryMethod}
                  onChange={(e) => onFilterChange('deliveryMethod', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {deliveryMethodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Date Range */}
              {filters.dateRange === 'custom' && (
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Custom Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.customDateStart}
                      onChange={(e) => onFilterChange('customDateStart', e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="date"
                      value={filters.customDateEnd}
                      onChange={(e) => onFilterChange('customDateEnd', e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 mr-2">Active filters:</span>
              
              {filters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-sm">
                  Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
                  <button
                    onClick={() => onFilterChange('status', 'all')}
                    className="ml-1 hover:bg-blue-500/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.paymentStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-sm">
                  Payment: {paymentStatusOptions.find(opt => opt.value === filters.paymentStatus)?.label}
                  <button
                    onClick={() => onFilterChange('paymentStatus', 'all')}
                    className="ml-1 hover:bg-green-500/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.paymentMethod !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md text-sm">
                  Method: {paymentMethodOptions.find(opt => opt.value === filters.paymentMethod)?.label}
                  <button
                    onClick={() => onFilterChange('paymentMethod', 'all')}
                    className="ml-1 hover:bg-purple-500/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.deliveryMethod !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-md text-sm">
                  Delivery: {deliveryMethodOptions.find(opt => opt.value === filters.deliveryMethod)?.label}
                  <button
                    onClick={() => onFilterChange('deliveryMethod', 'all')}
                    className="ml-1 hover:bg-orange-500/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.dateRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-md text-sm">
                  Date: {dateRangeOptions.find(opt => opt.value === filters.dateRange)?.label}
                  <button
                    onClick={() => onFilterChange('dateRange', 'all')}
                    className="ml-1 hover:bg-yellow-500/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-sm">
                  Search: "{filters.searchQuery.trim()}"
                  <button
                    onClick={() => onFilterChange('searchQuery', '')}
                    className="ml-1 hover:bg-red-500/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersFilters;