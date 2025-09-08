import { useState, useEffect } from 'react';
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
  XCircle,
  ChevronDown
} from 'lucide-react';
import { auth, firestore } from '../../firebase'; // Adjust path as needed
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Header = ({ setIsOpen }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order received", time: "2 min ago", type: "info" },
    { id: 2, message: "Low stock alert", time: "5 min ago", type: "warning" },
    { id: 3, message: "System update complete", time: "1 hour ago", type: "success" }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get admin data from Firestore
          const adminDoc = await getDoc(doc(firestore, 'admin', user.uid));
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              name: adminData.name || adminData.fullName || user.displayName || 'Admin User',
              role: adminData.role || 'admin',
              avatar: adminData.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminData.name || 'Admin')}&background=6366f1&color=fff`,
              department: adminData.department || 'Management',
              joinDate: adminData.createdAt || new Date()
            });
          } else {
            // Fallback if admin document doesn't exist
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              name: user.displayName || 'Admin User',
              role: 'admin',
              avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Admin')}&background=6366f1&color=fff`,
              department: 'Management',
              joinDate: new Date()
            });
          }
        } catch (error) {
          console.error('Error fetching admin data:', error);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: Shield,
      manager: Briefcase,
      inventory: Package,
      sales: DollarSign,
      logistics: Truck
    };
    return icons[role] || User;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'text-purple-600 bg-purple-100',
      manager: 'text-blue-600 bg-blue-100',
      inventory: 'text-green-600 bg-green-100',
      sales: 'text-orange-600 bg-orange-100',
      logistics: 'text-indigo-600 bg-indigo-100'
    };
    return colors[role] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-10"></div>
            <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-80"></div>
          </div>
          <div className="animate-pulse bg-gray-200 rounded-full h-12 w-32"></div>
        </div>
      </header>
    );
  }

  if (!currentUser) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-center px-6 py-4">
          <p className="text-gray-500">Please log in to continue</p>
        </div>
      </header>
    );
  }
  
  const RoleIcon = getRoleIcon(currentUser.role);

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-30 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
          >
            <Menu className="h-5 w-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-12 pr-4 py-3 w-80 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
            >
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                {notifications.length}
              </span>
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <p className="text-sm text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl px-4 py-2.5 transition-all duration-200 border border-gray-100 hover:border-blue-200 group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                  {currentUser.name}
                </p>
                <div className="flex items-center space-x-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(currentUser.role)}`}>
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
            </button>
            
            {/* User Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-sm text-gray-500">{currentUser.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{currentUser.department}</p>
                </div>
                
                <div className="py-2">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="h-4 w-4 mr-3" />
                    Account Settings
                  </button>
                </div>
                
                <div className="border-t border-gray-100 pt-2">
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {(showDropdown || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowDropdown(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;