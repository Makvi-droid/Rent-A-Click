
import { 
  User, ArrowLeft, Settings, Shield, Bell, CreditCard, FileText, 
  Download, Upload, Eye, Edit, Trash2, Camera, Clock, Star, 
  Award, TrendingUp, MapPin, Calendar, Mail, Phone, Globe,
  ChevronRight, Activity, Package, Heart, ShoppingBag, LogOut,
  Key, Database, BarChart3, Users, Briefcase, HelpCircle
} from 'lucide-react';

const NavigationCard = ({ title, description, icon: Icon, onClick, color = "purple", badge = null }) => (
  <button
    onClick={onClick}
    className={`w-full p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 hover:border-${color}-500/50 transition-all duration-300 group hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-${color}-500/10 relative overflow-hidden`}
  >
    {/* Background effects */}
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
    
    <div className="relative z-10 flex items-center space-x-4">
      <div className={`p-3 bg-gradient-to-r from-${color}-500/20 to-${color}-600/20 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">{title}</h3>
          {badge && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">{badge}</span>
          )}
        </div>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
    </div>
  </button>
);

export default NavigationCard