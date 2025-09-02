
import { 
  User, ArrowLeft, Settings, Shield, Bell, CreditCard, FileText, 
  Download, Upload, Eye, Edit, Trash2, Camera, Clock, Star, 
  Award, TrendingUp, MapPin, Calendar, Mail, Phone, Globe,
  ChevronRight, Activity, Package, Heart, ShoppingBag, LogOut,
  Key, Database, BarChart3, Users, Briefcase, HelpCircle
} from 'lucide-react';


const ActivityFeed = ({ activities }) => (
  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <Activity className="w-5 h-5 text-purple-400" />
      Recent Activity
    </h3>
    
    
  </div>
);

export default ActivityFeed