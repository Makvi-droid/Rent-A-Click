
import { 
  User, ArrowLeft, Settings, Shield, Bell, CreditCard, FileText, 
  Download, Upload, Eye, Edit, Trash2, Camera, Clock, Star, 
  Award, TrendingUp, MapPin, Calendar, Mail, Phone, Globe,
  ChevronRight, Activity, Package, Heart, ShoppingBag, LogOut,
  Key, Database, BarChart3, Users, Briefcase, HelpCircle
} from 'lucide-react';


const QuickActions = ({ onAction }) => {
  const actions = [
    { id: 'browse', label: 'Browse Cameras', icon: Camera, color: 'purple' },
    { id: 'rentals', label: 'My Rentals', icon: Clock, color: 'blue' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, color: 'pink' },
    { id: 'cart', label: 'Shopping Cart', icon: ShoppingBag, color: 'green' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className={`p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 hover:border-${action.color}-500/50 transition-all duration-300 group hover:transform hover:scale-[1.05] hover:shadow-lg hover:shadow-${action.color}-500/20`}
        >
          <action.icon className={`w-8 h-8 mx-auto mb-2 text-${action.color}-400 group-hover:scale-110 transition-transform duration-300`} />
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions