import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
} from "lucide-react";

// Role permissions
const rolePermissions = {
  admin: [
    "products",
    "orders",
    "inventory",
    "Employees",
    "customers",
    "analytics",
    "settings",
    "notifications",
  ],
  manager: ["analytics", "users"],
  inventory: ["inventory", "products"],
  sales: ["orders", "analytics"],
  logistics: ["orders", "inventory"],
};

// Sidebar Component
const Sidebar = ({
  isOpen,
  setIsOpen,
  activeSection,
  setActiveSection,
  userRole,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session / token logic here if you have one
    navigate("/"); // redirect to login
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      id: "products",
      label: "Products",
      icon: Camera,
      color: "text-purple-600",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      color: "text-orange-600",
    },
    { id: "Employees", label: "Employees", icon: Users, color: "text-red-600" },
    { id: "customers", label: "Customers", icon: Users, color: "text-red-600" },
    {
      id: "analytics",
      label: "Sales & Analytics",
      icon: BarChart3,
      color: "text-indigo-600",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "text-gray-600",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "text-yellow-600",
    },
  ];

  const allowedItems = menuItems.filter(
    (item) =>
      item.id === "dashboard" || rolePermissions[userRole]?.includes(item.id)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
        fixed left-0 top-0 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-0
        w-64 border-r border-gray-200
      `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rent-a-Click
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {allowedItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm"
                    : "hover:bg-gray-50"
                }
              `}
            >
              <item.icon
                className={`h-5 w-5 ${
                  activeSection === item.id ? item.color : "text-gray-500"
                }`}
              />
              <span
                className={`font-medium ${
                  activeSection === item.id ? "text-gray-900" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-red-50 transition-colors text-red-600"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
            <h2 className="text-lg font-semibold text-gray-800">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mt-2">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
