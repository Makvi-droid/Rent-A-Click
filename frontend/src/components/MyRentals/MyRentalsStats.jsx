// components/MyRentals/MyRentalsStats.jsx
import React from 'react';
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const MyRentalsStats = ({ stats, formatCurrency, isVisible }) => {
  const statCards = [
    {
      title: 'Completed Rentals',
      value: stats.completed,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400',
      delay: '200ms'
    },
    {
      title: 'Active Rentals',
      value: stats.active,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
      delay: '400ms'
    },
    {
      title: 'Upcoming Rentals',
      value: stats.upcoming,
      icon: AlertCircle,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-400',
      delay: '600ms'
    },
    {
      title: 'Total Investment',
      value: formatCurrency(stats.totalSpent),
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400',
      delay: '800ms',
      isAmount: true
    }
  ];

  return (
    <div className={`mb-12 transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} 
         style={{ transitionDelay: '300ms' }}>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`${stat.bgColor} ${stat.borderColor} backdrop-blur-sm border rounded-2xl p-6 hover:scale-105 hover:bg-white/10 transition-all duration-500 group cursor-pointer relative overflow-hidden`}
              style={{ transitionDelay: stat.delay }}
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                
                {/* Trend Indicator - show for amounts */}
                {stat.isAmount && stats.totalSpent > 0 && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">+2.4%</span>
                  </div>
                )}
              </div>

              {/* Value */}
              <div className="mb-2">
                <div className={`text-3xl font-bold text-white group-hover:${stat.textColor.replace('text-', 'text-')} transition-colors duration-300`}>
                  {stat.isAmount ? stat.value : stat.value}
                </div>
              </div>

              {/* Title */}
              <div className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors duration-300">
                {stat.title}
              </div>

              {/* Progress Bar for non-amount stats */}
              {!stat.isAmount && stats.total > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`bg-gradient-to-r ${stat.color} h-1.5 rounded-full transition-all duration-1000`}
                      style={{ 
                        width: `${Math.min((stat.value / stats.total) * 100, 100)}%`,
                        transitionDelay: '1s'
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.total > 0 ? Math.round((stat.value / stats.total) * 100) : 0}% of total
                  </div>
                </div>
              )}

              {/* Decorative corner element */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 transform translate-x-8 -translate-y-8`} />
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      {stats.total > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
            <div className="text-sm text-gray-400">
              {stats.active > 0 && (
                <span className="text-green-400 font-medium">
                  {stats.active} active rental{stats.active > 1 ? 's' : ''}
                </span>
              )}
              {stats.active > 0 && stats.upcoming > 0 && <span className="mx-2">•</span>}
              {stats.upcoming > 0 && (
                <span className="text-yellow-400 font-medium">
                  {stats.upcoming} upcoming rental{stats.upcoming > 1 ? 's' : ''}
                </span>
              )}
              {(stats.active > 0 || stats.upcoming > 0) && stats.completed > 0 && <span className="mx-2">•</span>}
              {stats.completed > 0 && (
                <span className="text-blue-400 font-medium">
                  {stats.completed} completed
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRentalsStats;