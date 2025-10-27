import React, { useState, useEffect } from "react";
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
import Dashboard from "./Dashboard";
import ProductManagement from "../../components/admin/ProductManagement";
import ComingSoon from "../../components/admin/ComingSoon";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import Inventory from "./Inventory";
import OrderManagement from "./OrderManagement";
import EmployeeManagement from "./EmployeeManagement";
import CustomerManagemet from "./CustomerManagement";
import Analytics from "./Analytics";
import Contact from "./Contact";
import Settings from "./Settings";
import ContentManagement from "./ContentManagement";
import AuditTrail from "./AuditTrail";
import NotificationsTab from "./NotificationsTab";

const AdminDashboard = () => {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loadingUserData, setLoadingUserData] = useState(true);

  const mockStats = {
    totalRevenue: 45230,
    totalOrders: 156,
    totalProducts: 87,
    totalUsers: 1249,
    lowStockItems: 12,
    pendingOrders: 23,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoadingUserData(false);
        return;
      }

      try {
        // Check if user is admin
        const adminDoc = await getDoc(doc(db, "admin", user.uid));
        if (adminDoc.exists()) {
          setUserData({
            name: user.displayName || "Admin User",
            email: user.email,
            role: "admin",
            avatar:
              user.photoURL ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
            isAdmin: true,
          });
          setLoadingUserData(false);
          return;
        }

        // Check if user is employee
        const employeesRef = collection(db, "employees");
        const q = query(employeesRef, where("firebaseUid", "==", user.uid));
        const employeeSnapshot = await getDocs(q);

        if (!employeeSnapshot.empty) {
          const employeeData = employeeSnapshot.docs[0].data();

          // Fetch role name
          let roleName = "Employee";
          if (employeeData.roleId) {
            const roleDoc = await getDoc(doc(db, "roles", employeeData.roleId));
            if (roleDoc.exists()) {
              roleName = roleDoc.data().name;
            }
          }

          setUserData({
            name:
              `${employeeData.firstName || ""} ${
                employeeData.lastName || ""
              }`.trim() ||
              user.displayName ||
              "Employee",
            email: user.email || employeeData.email,
            role: roleName,
            avatar:
              employeeData.profileImage ||
              user.photoURL ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
            isAdmin: false,
            employeeData: employeeData,
          });
        } else {
          // Fallback for authenticated users without admin or employee record
          setUserData({
            name: user.displayName || "User",
            email: user.email,
            role: "user",
            avatar:
              user.photoURL ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
            isAdmin: false,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback user data
        setUserData({
          name: user.displayName || "User",
          email: user.email,
          role: "user",
          avatar:
            user.photoURL ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
          isAdmin: false,
        });
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [user]);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductManagement />;
      case "orders":
        return <OrderManagement />;
      case "inventory":
        return <Inventory />;
      case "Employees":
        return <EmployeeManagement />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      case "notifications":
        return <NotificationsTab />;
      case "contact":
        return <Contact />;
      case "customers":
        return <CustomerManagemet />;
      case "content_management":
        return <ContentManagement />;
      case "audit_trail":
        return <AuditTrail />;
      default:
        return <Dashboard stats={mockStats} />;
    }
  };

  // Loading state
  if (loading || loadingUserData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication Error</p>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          setIsOpen={setSidebarOpen}
          user={
            userData || {
              name: "User",
              email: user.email,
              role: "user",
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
            }
          }
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
