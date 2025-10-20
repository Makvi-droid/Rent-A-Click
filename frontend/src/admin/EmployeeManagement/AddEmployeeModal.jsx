import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Save,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { toast } from "react-hot-toast";
import { createAuditLog } from "../../utils/auditLogger";

const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  department: yup.string().required("Department is required"),
  roleId: yup.string().required("Role is required"),
  startDate: yup.date().required("Start date is required"),
  salary: yup.number().positive("Salary must be positive"),
  manager: yup.string(),
  notes: yup.string(),
});

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: "pending",
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchEmployees();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const generateEmployeeId = async () => {
    try {
      const counterRef = doc(db, "counters", "employeeId");
      const counterDoc = await getDoc(counterRef);

      let nextId = 1;
      if (counterDoc.exists()) {
        nextId = counterDoc.data().count + 1;
      }

      await updateDoc(counterRef, { count: increment(1) });
      return `EMP${nextId.toString().padStart(4, "0")}`;
    } catch (error) {
      const counterRef = doc(db, "counters", "employeeId");
      await setDoc(counterRef, { count: 1 });
      return "EMP0001";
    }
  };

  const sendInvitationEmail = async (employeeData) => {
    try {
      // Check if running in development mode without Netlify Dev
      const isDevelopment = import.meta.env.DEV;
      const isNetlifyDev = window.location.port === "8888";

      if (isDevelopment && !isNetlifyDev) {
        // Development mode without Netlify - simulate email sending
        console.log(
          "📧 Development Mode - Email would be sent to:",
          employeeData.email
        );
        console.log("Employee Data:", employeeData);

        toast.success(
          `[DEV MODE] Email simulation successful for ${employeeData.email}`,
          {
            duration: 4000,
          }
        );

        // Still create the invitation record
        const invitationData = {
          email: employeeData.email,
          employeeId: employeeData.employeeId,
          roleName: roles.find((r) => r.id === employeeData.roleId)?.name,
          invitedBy: auth.currentUser?.email,
          invitedAt: new Date(),
          status: "sent",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          emailId: "dev-simulation",
        };

        await addDoc(collection(db, "employeeInvitations"), invitationData);

        await createAuditLog({
          action: "SEND_INVITATION",
          targetId: employeeData.employeeId,
          details: { email: employeeData.email, mode: "development" },
          timestamp: new Date(),
        });

        return;
      }

      // Production or Netlify Dev - actually send email
      const response = await fetch(
        "/.netlify/functions/send-employee-invitation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: employeeData.email,
            employeeId: employeeData.employeeId,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            roleName: roles.find((r) => r.id === employeeData.roleId)?.name,
            startDate: employeeData.startDate,
            invitedBy: auth.currentUser?.email,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      // Create invitation record in Firestore
      const invitationData = {
        email: employeeData.email,
        employeeId: employeeData.employeeId,
        roleName: roles.find((r) => r.id === employeeData.roleId)?.name,
        invitedBy: auth.currentUser?.email,
        invitedAt: new Date(),
        status: "sent",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        emailId: result.emailId,
      };

      await addDoc(collection(db, "employeeInvitations"), invitationData);

      toast.success(`Invitation email sent to ${employeeData.email}`);

      await createAuditLog({
        action: "SEND_INVITATION",
        targetId: employeeData.employeeId,
        details: { email: employeeData.email, emailId: result.emailId },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(`Failed to send invitation: ${error.message}`);
      throw error; // Re-throw to handle in onSubmit
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const employeeId = await generateEmployeeId();

      const employeeData = {
        ...data,
        employeeId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: sendInvite ? "pending" : data.status || "active",
      };

      const docRef = await addDoc(collection(db, "employees"), employeeData);

      await createAuditLog({
        action: "CREATE_EMPLOYEE",
        targetId: docRef.id,
        details: { employeeId, email: data.email },
        timestamp: new Date(),
      });

      if (sendInvite) {
        await sendInvitationEmail({ ...employeeData, id: docRef.id });
      }

      toast.success("Employee added successfully!");
      reset();
      onClose();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3
              id="modal-title"
              className="text-lg font-medium text-gray-900 flex items-center"
            >
              <User className="h-5 w-5 mr-2" />
              Add New Employee
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  {...register("firstName")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email *
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="inline h-4 w-4 mr-1" />
                  Department *
                </label>
                <select
                  {...register("department")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <Shield className="inline h-4 w-4 mr-1" />
                  Role *
                </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes about the employee..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={sendInvite}
                onChange={(e) => setSendInvite(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Send invitation email with login instructions
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : sendInvite ? (
                  <Send className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {sendInvite ? "Add & Send Invite" : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
