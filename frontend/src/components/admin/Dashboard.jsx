// Dashboard Component

import StatsCard from './StatsCard';

import { 
  Camera, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Download,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  LogOut,
  User,
  Shield,
  Briefcase,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const Dashboard = ({ stats }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
      <p className="text-gray-600">Welcome back! Here's what's happening with your camera rental business.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Total Revenue"
        value={stats.totalRevenue}
        change={12.5}
        icon={DollarSign}
        color="bg-gradient-to-r from-green-500 to-emerald-600"
        prefix="$"
      />
      <StatsCard
        title="Total Orders"
        value={stats.totalOrders}
        change={8.2}
        icon={ShoppingCart}
        color="bg-gradient-to-r from-blue-500 to-cyan-600"
      />
      <StatsCard
        title="Products"
        value={stats.totalProducts}
        change={3.1}
        icon={Camera}
        color="bg-gradient-to-r from-purple-500 to-pink-600"
      />
      <StatsCard
        title="Users"
        value={stats.totalUsers}
        change={15.8}
        icon={Users}
        color="bg-gradient-to-r from-orange-500 to-red-600"
      />
      <StatsCard
        title="Low Stock Items"
        value={stats.lowStockItems}
        icon={AlertTriangle}
        color="bg-gradient-to-r from-yellow-500 to-orange-600"
      />
      <StatsCard
        title="Pending Orders"
        value={stats.pendingOrders}
        icon={Clock}
        color="bg-gradient-to-r from-indigo-500 to-purple-600"
      />
    </div>
    
    {/* Recent Activity */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {[
          { action: "New order placed", details: "Canon EOS R5 rental for 3 days", time: "2 minutes ago", status: "success" },
          { action: "Low stock alert", details: "Sony A7III - Only 2 units left", time: "5 minutes ago", status: "warning" },
          { action: "Payment received", details: "$450 from customer #1249", time: "10 minutes ago", status: "success" },
          { action: "Return processed", details: "Nikon D850 returned by customer", time: "1 hour ago", status: "info" }
        ].map((activity, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-full ${
              activity.status === 'success' ? 'bg-green-100' :
              activity.status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              <CheckCircle className={`h-4 w-4 ${
                activity.status === 'success' ? 'text-green-600' :
                activity.status === 'warning' ? 'text-yellow-600' : 'text-blue-600'
              }`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{activity.action}</p>
              <p className="text-sm text-gray-600">{activity.details}</p>
            </div>
            <span className="text-xs text-gray-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Dashboard