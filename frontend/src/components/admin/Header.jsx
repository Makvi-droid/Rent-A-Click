import { useState, useEffect } from "react";
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
  ChevronDown,
} from "lucide-react";
import { auth, firestore } from "../../firebase"; // Adjust path as needed
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Header = ({ setIsOpen }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order received", time: "2 min ago", type: "info" },
    { id: 2, message: "Low stock alert", time: "5 min ago", type: "warning" },
    {
      id: 3,
      message: "System update complete",
      time: "1 hour ago",
      type: "success",
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get admin data from Firestore
          const adminDoc = await getDoc(doc(firestore, "admin", user.uid));
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              name:
                adminData.name ||
                adminData.fullName ||
                user.displayName ||
                "Admin User",
              role: adminData.role || "admin",
              avatar:
                adminData.photoURL ||
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  adminData.name || "Admin"
                )}&background=6366f1&color=fff`,
              department: adminData.department || "Management",
              joinDate: adminData.createdAt || new Date(),
            });
          } else {
            // Fallback if admin document doesn't exist
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              name: user.displayName || "Admin User",
              role: "admin",
              avatar:
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.displayName || "Admin"
                )}&background=6366f1&color=fff`,
              department: "Management",
              joinDate: new Date(),
            });
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
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
      console.error("Error signing out:", error);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: Shield,
      manager: Briefcase,
      inventory: Package,
      sales: DollarSign,
      logistics: Truck,
    };
    return icons[role] || User;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "text-purple-600 bg-purple-100",
      manager: "text-blue-600 bg-blue-100",
      inventory: "text-green-600 bg-green-100",
      sales: "text-orange-600 bg-orange-100",
      logistics: "text-indigo-600 bg-indigo-100",
    };
    return colors[role] || "text-gray-600 bg-gray-100";
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
        </div>

        <div className="flex items-center space-x-3">
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
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                      currentUser.role
                    )}`}
                  >
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </button>
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
