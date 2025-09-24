// OrdersStats.jsx - Enhanced with Physical ID Verification and Penalty Tracking
import React from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  CreditCard,
  RotateCcw,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  ShieldX
} from 'lucide-react';

const OrdersStats = ({ stats, formatCurrency, latePenaltyAmount = 150 }) => {
  const statCards = [
    // First Row - Core Order Stats
    {
      title: 'Total Orders',
      value: stats.total,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400'
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400'
    },

    // Second Row - Financial Stats
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      isAmount: true
    },
    {
      title: 'Pending Revenue',
      value: formatCurrency(stats.pendingRevenue),
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400',
      isAmount: true
    },
    {
      title: 'Late Penalties',
      value: formatCurrency(stats.totalPenalties || 0),
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      isAmount: true,
      subtitle: `₱${latePenaltyAmount} per overdue item`
    },

    // Third Row - Return Status
    {
      title: 'Items Returned',
      value: stats.itemsReturned,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400'
    },
    {
      title: 'Pending Returns',
      value: stats.itemsPending,
      icon: RotateCcw,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    {
      title: 'Overdue Items',
      value: stats.overdueItems,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400'
    },

    // Fourth Row - ID Verification Stats
   // REPLACE the existing ID stats with:
{
  title: 'ID Shown',
  value: stats.physicalIdShown || 0,
  icon: ShieldCheck,
  color: 'from-green-500 to-green-600',
  bgColor: 'bg-green-500/10',
  textColor: 'text-green-400'
},
{
  title: 'ID Not Shown',
  value: stats.physicalIdNotShown || 0,
  icon: ShieldX,
  color: 'from-gray-500 to-gray-600',
  bgColor: 'bg-gray-500/10',
  textColor: 'text-gray-400'
}
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className={`${stat.bgColor} backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-2xl font-bold ${stat.textColor}`}>
                    {typeof stat.value === 'number' && !stat.isAmount 
                      ? stat.value.toLocaleString() 
                      : stat.value
                    }
                  </span>
                  {stat.subtitle && (
                    <span className="text-xs text-gray-400 text-right mt-1">
                      {stat.subtitle}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-white font-medium text-sm leading-tight">
                  {stat.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Revenue Summary */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Revenue Overview</h3>
              <p className="text-emerald-300 text-sm">Including penalties</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Orders Revenue:</span>
              <span className="text-emerald-400 font-medium">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Late Penalties:</span>
              <span className="text-red-400 font-medium">{formatCurrency(stats.totalPenalties || 0)}</span>
            </div>
            <div className="border-t border-emerald-700/50 pt-2">
              <div className="flex justify-between">
                <span className="text-white font-medium">Total Revenue:</span>
                <span className="text-emerald-400 font-bold text-lg">
                  {formatCurrency((stats.totalRevenue || 0) + (stats.totalPenalties || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Return Status Summary */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Return Status</h3>
              <p className="text-blue-300 text-sm">Item tracking</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Returned:</span>
              <span className="text-green-400 font-medium">{stats.itemsReturned}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Pending:</span>
              <span className="text-blue-400 font-medium">{stats.itemsPending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Overdue:</span>
              <span className="text-red-400 font-medium">{stats.overdueItems}</span>
            </div>
            <div className="border-t border-blue-700/50 pt-2">
              <div className="flex justify-between">
                <span className="text-white font-medium">Total Items:</span>
                <span className="text-blue-400 font-bold text-lg">
                  {(stats.itemsReturned || 0) + (stats.itemsPending || 0) + (stats.overdueItems || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ID Verification Summary */}
<div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-700/50">
  <div className="flex items-center space-x-3 mb-4">
    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
      <Shield className="w-5 h-5 text-white" />
    </div>
    <div>
      <h3 className="text-white font-semibold">ID Verification</h3>
      <p className="text-yellow-300 text-sm">Physical ID tracking</p>
    </div>
  </div>
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="text-gray-300">ID Shown:</span>
      <span className="text-green-400 font-medium">{stats.physicalIdShown || 0}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-300">ID Not Shown:</span>
      <span className="text-gray-400 font-medium">{stats.physicalIdNotShown || 0}</span>
    </div>
    <div className="border-t border-yellow-700/50 pt-2">
      <div className="flex justify-between">
        <span className="text-white font-medium">Show Rate:</span>
        <span className="text-yellow-400 font-bold text-lg">
          {stats.total > 0 
            ? Math.round(((stats.physicalIdShown || 0) / stats.total) * 100) 
            : 0}%
        </span>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default OrdersStats;