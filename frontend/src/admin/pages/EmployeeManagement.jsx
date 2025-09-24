import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

// Import components
import EmployeeList from "../EmployeeManagement/EmployeeList";
import AddEmployeeModal from "../EmployeeManagement/AddEmployeeModal";
import RoleManagement from "../EmployeeManagement/RoleManagement";
import InvitationManagement from "../EmployeeManagement/InvitationManagement";
import AuditLogs from "../EmployeeManagement/AuditLogs";
import SearchAndFilter from "../EmployeeManagement/SearchAndFilter";

const EmployeeManagement = () => {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    department: "",
  });
  const [permissionChecked, setPermissionChecked] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && !permissionChecked) {
        try {
          const adminDoc = await getDoc(doc(db, "admin", user.uid));
          setIsAdmin(adminDoc.exists());
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } finally {
          setPermissionChecked(true);
        }
      }
    };

    checkAdminStatus();
  }, [user, permissionChecked]);

  // Debug: Log showAddModal state changes
  useEffect(() => {
    console.log("showAddModal state changed:", showAddModal);
  }, [showAddModal]);

  const handleAddEmployee = () => {
    console.log("=== handleAddEmployee called ===");
    console.log("Current showAddModal state:", showAddModal);
    console.log("Setting showAddModal to true...");
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    console.log("=== handleCloseModal called ===");
    console.log("Current showAddModal state:", showAddModal);
    console.log("Setting showAddModal to false...");
    setShowAddModal(false);
  };

  const tabs = [
    { id: "employees", label: "Employees", icon: Users },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "invitations", label: "Invitations", icon: UserPlus },
    { id: "audit", label: "Audit Logs", icon: Settings },
  ];

  if (loading || !permissionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Please sign in to access the employee management system.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Access Required
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "employees":
        return (
          <div className="space-y-6">
            <SearchAndFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              onAddEmployee={handleAddEmployee}
            />
            <EmployeeList searchTerm={searchTerm} filters={filters} />
          </div>
        );
      case "roles":
        return <RoleManagement />;
      case "invitations":
        return <InvitationManagement />;
      case "audit":
        return <AuditLogs />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Employee Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your organization's employees, roles, and permissions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Test button for modal */}
              <button
                onClick={handleAddEmployee}
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Test Modal
              </button>
              <button
                onClick={() =>
                  toast.success(
                    "Export functionality would be implemented here"
                  )
                }
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Add Employee Modal - Moved inside the main component */}
      {console.log(
        "About to render AddEmployeeModal, showAddModal:",
        showAddModal
      )}
      <AddEmployeeModal isOpen={showAddModal} onClose={handleCloseModal} />
    </div>
  );
};

export default EmployeeManagement;
