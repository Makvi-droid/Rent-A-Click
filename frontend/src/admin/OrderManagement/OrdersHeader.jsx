// OrdersHeader.jsx
import React from 'react';
import { Settings, Download, RefreshCw } from 'lucide-react';

const OrdersHeader = ({ totalOrders, user }) => {
  

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-gray-300 mt-2">
              Manage and track all rental orders • {totalOrders} total orders
            </p>
            <div className="text-sm text-gray-400 mt-1">
              Welcome back, {user?.displayName || user?.email || 'Admin'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 border border-gray-600"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            

            
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-3 text-center border border-gray-600">
            <div className="text-2xl font-bold text-blue-400">{totalOrders}</div>
            <div className="text-xs text-gray-400">Total Orders</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center border border-gray-600">
            <div className="text-2xl font-bold text-green-400">Live</div>
            <div className="text-xs text-gray-400">Real-time</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center border border-gray-600">
            <div className="text-2xl font-bold text-purple-400">24/7</div>
            <div className="text-xs text-gray-400">Monitoring</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center border border-gray-600">
            <div className="text-2xl font-bold text-yellow-400">Auto</div>
            <div className="text-xs text-gray-400">Updates</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersHeader;