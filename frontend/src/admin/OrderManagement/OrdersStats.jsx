// OrdersStats.jsx
import React from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Package, 
  XCircle, 
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const OrdersStats = ({ stats, formatCurrency }) => {
  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: ShoppingBag,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-400'
    },
    {
      title: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: Package,
      color: 'purple',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400'
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
      isRevenue: true
    },
    {
      title: 'Pending Revenue',
      value: formatCurrency(stats.pendingRevenue),
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      textColor: 'text-orange-400',
      isRevenue: true
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={stat.title}
              className={`
                ${stat.bgColor} ${stat.borderColor}
                bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 
                border transition-all duration-300 
                hover:scale-105 hover:shadow-lg hover:bg-gray-700/50
                ${index >= 5 ? 'xl:col-span-1 lg:col-span-2 sm:col-span-1' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.isRevenue ? (
                      <span className="text-lg">{stat.value}</span>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
              </div>

              {/* Progress bar for visual representation */}
              {!stat.isRevenue && stats.total > 0 && (
                <div className="mt-3">
                  <div className="bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full bg-gradient-to-r ${
                        stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        stat.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                        stat.color === 'green' ? 'from-green-500 to-green-600' :
                        stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        'from-red-500 to-red-600'
                      }`}
                      style={{
                        width: `${(stat.value / stats.total) * 100}%`
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.total > 0 ? ((stat.value / stats.total) * 100).toFixed(1) : 0}% of total
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Revenue Summary Bar */}
      {(stats.totalRevenue > 0 || stats.pendingRevenue > 0) && (
        <div className="mt-4 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Revenue Overview
            </h3>
            <div className="text-sm text-gray-400">
              Total: {formatCurrency(stats.totalRevenue + stats.pendingRevenue)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-green-400 font-medium">Paid Revenue</span>
                <span className="text-green-400 font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-orange-400 font-medium">Pending Revenue</span>
                <span className="text-orange-400 font-bold">
                  {formatCurrency(stats.pendingRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersStats;