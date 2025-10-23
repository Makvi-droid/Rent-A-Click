// Main Dashboard Component

import React, { useState } from "react";
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

const AdminDashboard = () => {
  const mockUser = {
    name: "John Admin",
    email: "john@rentaclick.com",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
  };

  const mockStats = {
    totalRevenue: 45230,
    totalOrders: 156,
    totalProducts: 87,
    totalUsers: 1249,
    lowStockItems: 12,
    pendingOrders: 23,
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [user] = useState(mockUser);

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
        return <ComingSoon title="Settings" />;
      case "notifications":
        return <ComingSoon title="Notifications" />;
      case "contact":
        return <Contact />;
      case "customers":
        return <CustomerManagemet />;
      default:
        return <Dashboard stats={mockStats} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userRole={user.role}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsOpen={setSidebarOpen} user={user} />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
