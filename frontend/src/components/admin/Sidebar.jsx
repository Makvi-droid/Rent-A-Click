import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  Camera,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Contact,
  Lock,
  LayoutTemplate,
  Shield,
} from "lucide-react";

// Permission to menu item mapping
const permissionToMenuMap = {
  view_dashboard: "dashboard",
  manage_products: "products",
  view_products: "products",
  manage_orders: "orders",
  view_orders: "orders",
  manage_inventory: "inventory",
  view_inventory: "inventory",
  manage_employees: "Employees",
  view_employees: "Employees",
  manage_customers: "customers",
  view_customers: "customers",
  view_analytics: "analytics",
  access_contact_support: "contact",
  manage_settings: "settings",
  view_notifications: "notifications",
  view_content_management: "content_management",
  view_audit_trail: "audit_trail",
};

// Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, activeSection, setActiveSection }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      console.log("=== Fetching User Permissions ===");
      console.log("User:", user);

      if (!user) {
        console.log("No user logged in");
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin first
        console.log("Checking admin status for UID:", user.uid);
        const adminDoc = await getDoc(doc(db, "admin", user.uid));

        if (adminDoc.exists()) {
          console.log("✓ User is ADMIN - granting all permissions");
          setIsAdmin(true);
          // Admins have all permissions
          setUserPermissions(Object.keys(permissionToMenuMap));
          setLoading(false);
          return;
        }

        console.log("User is not admin, checking employee status...");

        // Find employee by firebaseUid
        const employeesRef = collection(db, "employees");
        const q = query(employeesRef, where("firebaseUid", "==", user.uid));
        const employeeSnapshot = await getDocs(q);

        if (!employeeSnapshot.empty) {
          const employeeData = employeeSnapshot.docs[0].data();
          console.log("✓ Found employee record:", {
            email: employeeData.email,
            roleId: employeeData.roleId,
          });

          const roleId = employeeData.roleId;

          if (roleId) {
            console.log("Fetching role permissions for roleId:", roleId);

            // Fetch role permissions
            const roleDoc = await getDoc(doc(db, "roles", roleId));

            if (roleDoc.exists()) {
              const roleData = roleDoc.data();
              console.log("✓ Role data loaded:", {
                roleName: roleData.name,
                permissions: roleData.permissions,
              });

              setUserPermissions(roleData.permissions || []);

              // Log which menu items will be accessible
              const accessibleMenus = (roleData.permissions || [])
                .map((p) => permissionToMenuMap[p])
                .filter(Boolean);
              console.log("Accessible menu items:", accessibleMenus);
            } else {
              console.warn("⚠ Role document not found for roleId:", roleId);
              setUserPermissions([]);
            }
          } else {
            console.warn("⚠ Employee has no roleId assigned");
            setUserPermissions([]);
          }
        } else {
          console.warn("⚠ No employee record found for user");
          setUserPermissions([]);
        }
      } catch (error) {
        console.error("❌ Error fetching user permissions:", error);
        setUserPermissions([]);
      } finally {
        setLoading(false);
        console.log("=== Permission Fetch Complete ===");
      }
    };

    fetchUserPermissions();
  }, [user]);

  const handleLogout = () => {
    navigate("/");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      color: "text-blue-600",
      alwaysEnabled: true,
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
    {
      id: "Employees",
      label: "Employees",
      icon: Users,
      color: "text-red-600",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      color: "text-red-600",
    },
    {
      id: "analytics",
      label: "Sales & Analytics",
      icon: BarChart3,
      color: "text-indigo-600",
    },
    {
      id: "contact",
      label: "Contact Support",
      icon: Contact,
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
    {
      id: "content_management",
      label: "Content Management",
      icon: LayoutTemplate,
      color: "text-yellow-600",
    },
    {
      id: "audit_trail",
      label: "Audit Trail",
      icon: Shield,
      color: "text-purple-600",
    },
  ];

  // Check if user has permission for a menu item
  const hasPermission = (menuId) => {
    // Admins have all permissions
    if (isAdmin) {
      console.log(`Permission check for ${menuId}: ADMIN - ALLOWED`);
      return true;
    }

    // Dashboard is always accessible
    if (menuId === "dashboard") {
      console.log(`Permission check for ${menuId}: DASHBOARD - ALLOWED`);
      return true;
    }

    // Check if any of user's permissions map to this menu item
    const hasAccess = userPermissions.some(
      (permission) => permissionToMenuMap[permission] === menuId
    );

    console.log(`Permission check for ${menuId}:`, {
      hasAccess,
      userPermissions,
      matchingPermissions: userPermissions.filter(
        (p) => permissionToMenuMap[p] === menuId
      ),
    });

    return hasAccess;
  };

  if (loading) {
    return (
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl border-r border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Loading permissions...</p>
        </div>
      </div>
    );
  }

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

        {/* Debug Info - Remove this in production */}
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <p className="text-xs text-gray-600">
            {isAdmin
              ? "👑 Admin User"
              : `🔑 ${userPermissions.length} permissions`}
          </p>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((item) => {
            const hasAccess = hasPermission(item.id);
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (hasAccess) {
                    console.log(`Navigating to: ${item.id}`);
                    setActiveSection(item.id);
                    setIsOpen(false);
                  } else {
                    console.log(`Access denied to: ${item.id}`);
                  }
                }}
                disabled={!hasAccess}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-1
                  ${
                    !hasAccess
                      ? "opacity-40 cursor-not-allowed bg-gray-50"
                      : isActive
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm"
                      : "hover:bg-gray-50 cursor-pointer"
                  }
                `}
                title={
                  !hasAccess
                    ? "You don't have permission to access this section"
                    : ""
                }
              >
                <div className="relative">
                  <item.icon
                    className={`h-5 w-5 ${
                      !hasAccess
                        ? "text-gray-400"
                        : isActive
                        ? item.color
                        : "text-gray-500"
                    }`}
                  />
                  {!hasAccess && (
                    <Lock className="h-3 w-3 text-gray-400 absolute -bottom-1 -right-1" />
                  )}
                </div>
                <span
                  className={`font-medium ${
                    !hasAccess
                      ? "text-gray-400"
                      : isActive
                      ? "text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex items-center justify-center z-[9999]">
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
