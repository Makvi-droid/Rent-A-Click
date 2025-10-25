import React, { useState, useEffect } from "react";
import {
  Users,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  UserCheck,
  UserX,
  Archive,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import EmployeeModal from "./EmployeeModal";
import { createAuditLog } from "../../utils/auditLogger";

const EmployeeList = ({ searchTerm, filters }) => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    fetchRoles();
    const unsubscribe = subscribeToEmployees();
    return () => unsubscribe && unsubscribe();
  }, []);

  const subscribeToEmployees = () => {
    try {
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, orderBy("createdAt", "desc"));

      return onSnapshot(q, (snapshot) => {
        const employeesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(employeesData);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error subscribing to employees:", error);
      setLoading(false);
    }
  };

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

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      !searchTerm ||
      `${employee.firstName} ${employee.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !filters.role || employee.roleId === filters.role;
    const matchesStatus = !filters.status || employee.status === filters.status;
    const matchesDepartment =
      !filters.department || employee.department === filters.department;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      const employee = employees.find((emp) => emp.id === employeeId);

      await updateDoc(doc(db, "employees", employeeId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      await createAuditLog({
        action: "CHANGE_STATUS",
        target: "employee",
        targetId: employeeId,
        details: {
          newStatus,
          employeeId: employee?.employeeId,
          name: `${employee?.firstName} ${employee?.lastName}`,
        },
      });

      toast.success(`Employee status updated to ${newStatus}`);
      setDropdownOpen(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update employee status");
    }
  };

  const handleSoftDelete = async (employeeId) => {
    if (window.confirm("Are you sure you want to archive this employee?")) {
      try {
        const employee = employees.find((emp) => emp.id === employeeId);

        await updateDoc(doc(db, "employees", employeeId), {
          status: "archived",
          archivedAt: new Date(),
          updatedAt: new Date(),
        });

        await createAuditLog({
          action: "ARCHIVE_EMPLOYEE",
          target: "employee",
          targetId: employeeId,
          details: {
            reason: "Soft delete",
            employeeId: employee?.employeeId,
            name: `${employee?.firstName} ${employee?.lastName}`,
          },
        });

        toast.success("Employee archived successfully");
        setDropdownOpen(null);
      } catch (error) {
        console.error("Error archiving employee:", error);
        toast.error("Failed to archive employee");
      }
    }
  };

  const handlePermanentDelete = async (employeeId) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this employee? This action cannot be undone."
      )
    ) {
      try {
        const employee = employees.find((emp) => emp.id === employeeId);

        await createAuditLog({
          action: "DELETE_EMPLOYEE",
          target: "employee",
          targetId: employeeId,
          details: {
            type: "permanent",
            employeeId: employee?.employeeId,
            name: `${employee?.firstName} ${employee?.lastName}`,
          },
        });

        await deleteDoc(doc(db, "employees", employeeId));

        toast.success("Employee deleted permanently");
        setDropdownOpen(null);
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast.error("Failed to delete employee");
      }
    }
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

  const openModal = (employee, mode) => {
    console.log("Opening modal with employee:", employee, "mode:", mode);
    setSelectedEmployee(employee);
    setModalMode(mode);
    setShowModal(true);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setShowModal(false);
    setSelectedEmployee(null);
    setDropdownOpen(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Employees ({filteredEmployees.length})
          </h3>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No employees found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || Object.values(filters).some((f) => f)
              ? "Try adjusting your search or filters"
              : "Get started by adding a new employee"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {employee.firstName?.[0]}
                          {employee.lastName?.[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {employee.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {employee.email}
                    </div>
                    {employee.phone && (
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-1" />
                        {employee.phone}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRoleName(employee.roleId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(employee.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === employee.id ? null : employee.id
                          )
                        }
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>

                      {dropdownOpen === employee.id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => openModal(employee, "edit")}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </button>

                            <div className="border-t border-gray-100"></div>

                            {employee.status !== "active" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(employee.id, "active")
                                }
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </button>
                            )}

                            {employee.status !== "suspended" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(employee.id, "suspended")
                                }
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Suspend
                              </button>
                            )}

                            {employee.status !== "archived" && (
                              <button
                                onClick={() => handleSoftDelete(employee.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </button>
                            )}

                            <div className="border-t border-gray-100"></div>

                            <button
                              onClick={() => handlePermanentDelete(employee.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Permanently
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          mode={modalMode}
          isOpen={showModal}
          onClose={closeModal}
          onUpdate={() => {
            // Data will update automatically through the subscription
          }}
        />
      )}
    </div>
  );
};

export default EmployeeList;
