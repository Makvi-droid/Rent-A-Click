import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Calendar,
  Building,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-hot-toast";
import { createAuditLog } from "../../utils/auditLogger";
import { format } from "date-fns";

const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  department: yup.string().required("Department is required"),
  roleId: yup.string().required("Role is required"),
  startDate: yup.string().required("Start date is required"),
  status: yup.string().required("Status is required"),
  notes: yup.string(),
});

const EmployeeModal = ({ employee, mode, isOpen, onClose, onUpdate }) => {
  const [roles, setRoles] = useState([]);
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
    if (isOpen && employee) {
      console.log("EmployeeModal opened with employee:", employee);
      fetchRoles();
      populateForm();
      setCurrentMode(mode);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, employee, mode]);

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

  const populateForm = () => {
    if (!employee) return;

    setValue("firstName", employee.firstName || "");
    setValue("lastName", employee.lastName || "");
    setValue("email", employee.email || "");
    setValue("phone", employee.phone || "");
    setValue("department", employee.department || "");
    setValue("roleId", employee.roleId || "");
    setValue("status", employee.status || "active");
    setValue("notes", employee.notes || "");

    // Handle start date
    if (employee.startDate) {
      try {
        let dateStr;
        if (typeof employee.startDate === "string") {
          dateStr = employee.startDate.split("T")[0];
        } else if (employee.startDate.toDate) {
          dateStr = format(employee.startDate.toDate(), "yyyy-MM-dd");
        }
        setValue("startDate", dateStr);
      } catch (error) {
        console.error("Error formatting date:", error);
      }
    }
  };

  const onSubmit = async (data) => {
    if (currentMode === "view") return;

    setLoading(true);
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "employees", employee.id), updateData);

      await createAuditLog({
        action: "UPDATE_EMPLOYEE",
        target: "employee",
        targetId: employee.id,
        details: {
          employeeId: employee.employeeId,
          changes: data,
        },
      });

      toast.success("Employee updated successfully");
      onUpdate && onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const switchToEditMode = () => {
    setCurrentMode("edit");
  };

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.name || "Unknown Role";
  };

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

  if (!isOpen || !employee) {
    return null;
  }

  const isViewMode = currentMode === "view";

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-modal-title"
    >
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3
              id="employee-modal-title"
              className="text-lg font-medium text-gray-900 flex items-center"
            >
              <User className="h-5 w-5 mr-2" />
              {isViewMode ? "Employee Details" : "Edit Employee"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
              type="button"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Employee ID and Status Badge */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Employee ID</span>
              <p className="text-lg font-semibold text-gray-900">
                {employee.employeeId}
              </p>
            </div>
            <div>{getStatusBadge(employee.status)}</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline h-4 w-4 mr-1" />
                  First Name *
                </label>
                {isViewMode ? (
                  <p className="text-sm text-gray-900 py-2">
                    {employee.firstName}
                  </p>
                ) : (
                  <>
                    <input
                      {...register("firstName")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                {isViewMode ? (
                  <p className="text-sm text-gray-900 py-2">
                    {employee.lastName}
                  </p>
                ) : (
                  <>
                    <input
                      {...register("lastName")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email *
                </label>
                {isViewMode ? (
                  <p className="text-sm text-gray-900 py-2">{employee.email}</p>
                ) : (
                  <>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="employee@company.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone
                </label>
                {isViewMode ? (
                  <p className="text-sm text-gray-900 py-2">
                    {employee.phone || "N/A"}
                  </p>
                ) : (
                  <input
                    {...register("phone")}
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                )}
              </div>
            </div>

            {/* Department and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Role *
                </label>
                {isViewMode ? (
                  <p className="text-sm text-gray-900 py-2">
                    {getRoleName(employee.roleId)}
                  </p>
                ) : (
                  <>
                    <select
                      {...register("roleId")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Status *
                </label>
                {isViewMode ? (
                  <div className="py-2">{getStatusBadge(employee.status)}</div>
                ) : (
                  <>
                    <select
                      {...register("status")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="archived">Archived</option>
                    </select>
                    {errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.status.message}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="inline h-4 w-4 mr-1" />
                Notes
              </label>
              {isViewMode ? (
                <p className="text-sm text-gray-900 py-2">
                  {employee.notes || "No notes available"}
                </p>
              ) : (
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about the employee..."
                />
              )}
            </div>

            {/* Metadata */}
            {employee.createdAt && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created:{" "}
                  {typeof employee.createdAt === "string"
                    ? format(new Date(employee.createdAt), "MMM dd, yyyy HH:mm")
                    : format(employee.createdAt.toDate(), "MMM dd, yyyy HH:mm")}
                </p>
                {employee.updatedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last Updated:{" "}
                    {typeof employee.updatedAt === "string"
                      ? format(
                          new Date(employee.updatedAt),
                          "MMM dd, yyyy HH:mm"
                        )
                      : format(
                          employee.updatedAt.toDate(),
                          "MMM dd, yyyy HH:mm"
                        )}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isViewMode ? "Close" : "Cancel"}
              </button>
              {isViewMode ? (
                <button
                  type="button"
                  onClick={switchToEditMode}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Employee
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
