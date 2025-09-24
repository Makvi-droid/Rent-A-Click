import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Check,
  X,
  Save,
  Settings,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-hot-toast";
import { createAuditLog } from "../../utils/auditLogger";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
    level: 1,
  });

  // Predefined permissions that can be assigned to roles
  const availablePermissions = [
    {
      id: "user_management",
      name: "User Management",
      description: "Add, edit, delete users",
    },
    {
      id: "role_management",
      name: "Role Management",
      description: "Manage roles and permissions",
    },
    {
      id: "view_employees",
      name: "View Employees",
      description: "View employee list and details",
    },
    {
      id: "edit_employees",
      name: "Edit Employees",
      description: "Modify employee information",
    },
    {
      id: "delete_employees",
      name: "Delete Employees",
      description: "Remove employees from system",
    },
    {
      id: "view_reports",
      name: "View Reports",
      description: "Access reporting features",
    },
    {
      id: "audit_logs",
      name: "Audit Logs",
      description: "View system audit logs",
    },
    {
      id: "system_settings",
      name: "System Settings",
      description: "Configure system settings",
    },
    {
      id: "invite_users",
      name: "Invite Users",
      description: "Send invitation emails to new users",
    },
    {
      id: "manage_departments",
      name: "Manage Departments",
      description: "Create and manage departments",
    },
    {
      id: "view_profile",
      name: "View Profile",
      description: "View own profile",
    },
    {
      id: "edit_profile",
      name: "Edit Profile",
      description: "Edit own profile",
    },
    {
      id: "view_salary",
      name: "View Salary",
      description: "View salary information",
    },
    {
      id: "edit_salary",
      name: "Edit Salary",
      description: "Modify salary information",
    },
  ];

  useEffect(() => {
    const unsubscribeRoles = subscribeToRoles();
    const unsubscribeEmployees = subscribeToEmployees();

    return () => {
      if (unsubscribeRoles) unsubscribeRoles();
      if (unsubscribeEmployees) unsubscribeEmployees();
    };
  }, []);

  // Debug effect to monitor showModal state
  useEffect(() => {
    console.log("=== Modal state changed ===", {
      showModal,
      editingRole: editingRole?.name || null,
      formData: formData.name,
    });
  }, [showModal, editingRole, formData]);

  const subscribeToRoles = () => {
    try {
      const rolesRef = collection(db, "roles");
      const q = query(rolesRef, orderBy("level", "desc"));

      return onSnapshot(q, (snapshot) => {
        const rolesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Roles loaded:", rolesData.length);
        setRoles(rolesData);
        setFetchingData(false);
      });
    } catch (error) {
      console.error("Error subscribing to roles:", error);
      toast.error("Failed to load roles");
      setFetchingData(false);
    }
  };

  const subscribeToEmployees = () => {
    try {
      const employeesRef = collection(db, "employees");
      return onSnapshot(employeesRef, (snapshot) => {
        const employeesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(employeesData);
      });
    } catch (error) {
      console.error("Error subscribing to employees:", error);
    }
  };

  const getUserCountForRole = (roleId) => {
    return employees.filter((emp) => emp.roleId === roleId).length;
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("=== Add Role Button Clicked ===");
    console.log("Current showModal state:", showModal);

    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
      level: 1,
    });

    // Use setTimeout to ensure state update is processed
    setTimeout(() => {
      console.log("Setting showModal to true...");
      setShowModal(true);
    }, 0);
  };

  const handleEditRole = (role, e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("=== Edit role clicked for ===", role.name);
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
      level: role.level || 1,
    });
    setShowModal(true);
  };

  const handleCloseModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("=== Closing modal ===");
    setShowModal(false);
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
      level: 1,
    });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setLoading(true);
    try {
      const roleData = {
        ...formData,
        name: formData.name.trim(),
        updatedAt: new Date(),
      };

      if (editingRole) {
        // Update existing role
        await updateDoc(doc(db, "roles", editingRole.id), roleData);

        await createAuditLog({
          action: "UPDATE_ROLE",
          targetId: editingRole.id,
          details: {
            roleName: formData.name,
            changes: roleData,
          },
          timestamp: new Date(),
        });

        toast.success("Role updated successfully");
      } else {
        // Add new role
        roleData.createdAt = new Date();
        const docRef = await addDoc(collection(db, "roles"), roleData);

        await createAuditLog({
          action: "CREATE_ROLE",
          targetId: docRef.id,
          details: {
            roleName: formData.name,
            permissions: formData.permissions,
          },
          timestamp: new Date(),
        });

        toast.success("Role created successfully");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (role, e) => {
    e.preventDefault();
    e.stopPropagation();

    const userCount = getUserCountForRole(role.id);

    if (userCount > 0) {
      toast.error(
        `Cannot delete role "${role.name}". ${userCount} users are assigned to this role.`
      );
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteDoc(doc(db, "roles", role.id));

        await createAuditLog({
          action: "DELETE_ROLE",
          targetId: role.id,
          details: {
            roleName: role.name,
            permissions: role.permissions,
          },
          timestamp: new Date(),
        });

        toast.success("Role deleted successfully");
      } catch (error) {
        console.error("Error deleting role:", error);
        toast.error("Failed to delete role");
      }
    }
  };

  const togglePermission = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const getPermissionName = (permissionId) => {
    const permission = availablePermissions.find((p) => p.id === permissionId);
    return permission?.name || permissionId;
  };

  // Modal backdrop click handler
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Role Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage user roles and permissions ({roles.length} roles)
            </p>
          </div>
          <div className="flex gap-2">
            {/* Debug button */}
            <button
              onClick={() => {
                console.log("Debug button clicked, showModal:", showModal);
                alert(`Modal state: ${showModal}`);
              }}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded"
            >
              Debug
            </button>
            <button
              onClick={handleAddRole}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </button>
          </div>
        </div>

        {roles.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No roles found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first role
            </p>
            <button
              onClick={handleAddRole}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Role
            </button>
          </div>
        ) : (
          /* Roles Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const userCount = getUserCountForRole(role.id);
              return (
                <div
                  key={role.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {role.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Level {role.level}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => handleEditRole(role, e)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit role"
                        type="button"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteRole(role, e)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete role"
                        disabled={userCount > 0}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {role.description || "No description provided"}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="h-4 w-4 mr-1" />
                    {userCount} user{userCount !== 1 ? "s" : ""}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Permissions ({role.permissions?.length || 0})
                    </h4>
                    <div className="space-y-1">
                      {(role.permissions || [])
                        .slice(0, 3)
                        .map((permissionId) => (
                          <div
                            key={permissionId}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {getPermissionName(permissionId)}
                            </span>
                          </div>
                        ))}
                      {(role.permissions?.length || 0) > 3 && (
                        <div className="text-sm text-gray-500">
                          +{(role.permissions?.length || 0) - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    {role.createdAt && (
                      <p>
                        Created:{" "}
                        {role.createdAt.toDate
                          ? role.createdAt.toDate().toLocaleDateString()
                          : new Date(role.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - Fixed Portal-style Implementation */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleBackdropClick}
              aria-hidden="true"
            />

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRole ? "Edit Role" : "Create New Role"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  type="button"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveRole} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter role name"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Level (1-10) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          level: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Higher levels have more authority
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe this role and its responsibilities"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions * ({formData.permissions.length} selected)
                  </label>
                  <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50">
                    {availablePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            id={permission.id}
                            checked={formData.permissions.includes(
                              permission.id
                            )}
                            onChange={() => togglePermission(permission.id)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor={permission.id}
                            className="font-medium text-gray-700 cursor-pointer block"
                          >
                            {permission.name}
                          </label>
                          <p className="text-gray-500 text-xs mt-1">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                  <button
                    onClick={handleCloseModal}
                    disabled={loading}
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.name.trim() ||
                      formData.permissions.length === 0
                    }
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingRole ? "Update Role" : "Create Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleManagement;
