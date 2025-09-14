// Stats Card Component


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

const StatsCard = ({ title, value, change, icon: Icon, color, prefix = "" }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{prefix}{value.toLocaleString()}</p>
        {change && (
          <p className={`text-sm flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);


export default StatsCard