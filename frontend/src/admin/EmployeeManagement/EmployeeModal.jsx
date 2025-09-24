import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Save,
  Edit,
  Eye,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { createAuditLog } from "../../utils/auditLogger";

const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  department: yup.string().required("Department is required"),
  roleId: yup.string().required("Role is required"),
  startDate: yup.string().required("Start date is required"),
  salary: yup.number().positive("Salary must be positive"),
  manager: yup.string(),
  notes: yup.string(),
});

const EmployeeModal = ({ employee, mode, isOpen, onClose, onUpdate }) => {
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isOpen && mode === "view" && employee) {
      createAuditLog({
        action: "VIEW_EMPLOYEE",
        targetId: employee.id,
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        timestamp: new Date(),
      });
    }
  }, [isOpen, mode, employee]);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const fetchRoles = async () => {
    try {
      const rolesSnapshot = await getDocs(collection(db, "roles"));
      const rolesData = rolesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const employeesSnapshot = await getDocs(collection(db, "employees"));
      const employeesData = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesData.filter((emp) => emp.id !== employee.id));
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const populateForm = () => {
    if (employee) {
      setValue("firstName", employee.firstName || "");
      setValue("lastName", employee.lastName || "");
      setValue("email", employee.email || "");
      setValue("phone", employee.phone || "");
      setValue("department", employee.department || "");
      setValue("roleId", employee.roleId || "");
      setValue(
        "startDate",
        employee.startDate
          ? typeof employee.startDate === "string"
            ? employee.startDate
            : employee.startDate.toDate().toISOString().split("T")[0]
          : ""
      );
      setValue("salary", employee.salary || "");
      setValue("manager", employee.manager || "");
      setValue("notes", employee.notes || "");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "employees", employee.id), updateData);

      await createAuditLog({
        action: "UPDATE_EMPLOYEE",
        targetId: employee.id,
        details: { changes: data },
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        timestamp: new Date(),
      });

      toast.success("Employee updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    "IT",
    "HR",
    "Finance",
    "Marketing",
    "Operations",
    "Sales",
    "Legal",
    "Customer Service",
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      inactive: { bg: "bg-gray-100", text: "text-gray-800", label: "Inactive" },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
      },
      suspended: { bg: "bg-red-100", text: "text-red-800", label: "Suspended" },
      archived: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Archived",
      },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const currentRole = roles.find((role) => role.id === employee?.roleId);
  const managerEmployee = employees.find((emp) => emp.id === employee?.manager);

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              {currentMode === "view" ? (
                <Eye className="h-5 w-5 mr-2" />
              ) : (
                <Edit className="h-5 w-5 mr-2" />
              )}
              {currentMode === "view" ? "Employee Details" : "Edit Employee"}
            </h3>
            <div className="flex items-center space-x-2">
              {currentMode === "view" && (
                <button
                  onClick={() => setCurrentMode("edit")}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {currentMode === "view" ? (
            // View Mode
            <div className="space-y-6 z-50">
              {/* Header Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-semibold text-blue-600">
                      {employee.firstName?.[0]}
                      {employee.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </h2>
                    <p className="text-gray-600">
                      {currentRole?.name || "Unknown Role"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Employee ID: {employee.employeeId}
                    </p>
                  </div>
                  <div>{getStatusBadge(employee.status)}</div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <p className="text-gray-900">{employee.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <p className="text-gray-900">
                        {employee.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Work Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Department:
                      </span>
                      <p className="text-gray-900">{employee.department}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Role:</span>
                      <p className="text-gray-900">
                        {currentRole?.name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Start Date:
                      </span>
                      <p className="text-gray-900">
                        {employee.startDate
                          ? typeof employee.startDate === "string"
                            ? format(
                                new Date(employee.startDate),
                                "MMM dd, yyyy"
                              )
                            : format(
                                employee.startDate.toDate(),
                                "MMM dd, yyyy"
                              )
                          : "Not provided"}
                      </p>
                    </div>
                    {employee.salary && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Salary:
                        </span>
                        <p className="text-gray-900">
                          ${employee.salary.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Additional Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Reports To:
                      </span>
                      <p className="text-gray-900">
                        {managerEmployee
                          ? `${managerEmployee.firstName} ${managerEmployee.lastName} (${managerEmployee.employeeId})`
                          : "No manager assigned"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Created:
                      </span>
                      <p className="text-gray-900">
                        {employee.createdAt
                          ? format(employee.createdAt.toDate(), "MMM dd, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Last Updated:
                      </span>
                      <p className="text-gray-900">
                        {employee.updatedAt
                          ? format(employee.updatedAt.toDate(), "MMM dd, yyyy")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {employee.notes && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {employee.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Permissions */}
              {currentRole && currentRole.permissions && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Role Permissions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentRole.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    {...register("firstName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    {...register("lastName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Work Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    {...register("department")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    {...register("roleId")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.roleId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.roleId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    {...register("startDate")}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (Annual)
                  </label>
                  <input
                    {...register("salary")}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.salary && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.salary.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reports To (Manager)
                </label>
                <select
                  {...register("manager")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Manager</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setCurrentMode("view")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
