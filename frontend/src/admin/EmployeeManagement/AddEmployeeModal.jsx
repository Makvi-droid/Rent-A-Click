import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
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
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  roleId: yup.string().required("Role is required"),
  notes: yup.string(),
});

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: "pending",
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      generatePassword();
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

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setTemporaryPassword(password);
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

  const sendInvitationEmail = async (employeeData, docRefId) => {
    try {
      const isDevelopment = import.meta.env.DEV;
      const isNetlifyDev = window.location.port === "8888";

      if (isDevelopment && !isNetlifyDev) {
        // Development mode without Netlify - simulate email sending
        console.log(
          "📧 Development Mode - Email would be sent to:",
          employeeData.email
        );
        console.log("Login Credentials:");
        console.log("  Email:", employeeData.email);
        console.log("  Temporary Password:", employeeData.temporaryPassword);

        toast.success(
          `[DEV MODE] Email simulation successful for ${employeeData.email}`,
          {
            duration: 4000,
          }
        );

        // Create the invitation record
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

        // Fixed: Use docRefId instead of employeeData.employeeId
        await createAuditLog({
          action: "SEND_INVITATION",
          targetType: "employee",
          targetId: docRefId, // Use the Firestore document ID
          details: {
            email: employeeData.email,
            employeeId: employeeData.employeeId,
            mode: "development",
          },
          timestamp: new Date(),
        });

        return;
      }

      // Production or Netlify Dev - actually send email
      const response = await fetch(
        "/.netlify/functions/send-employee-invitation", // Fixed: removed .js extension
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: employeeData.email,
            employeeId: employeeData.employeeId,
            roleName: roles.find((r) => r.id === employeeData.roleId)?.name,
            invitedBy: auth.currentUser?.email,
            temporaryPassword: employeeData.temporaryPassword,
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        emailId: result.emailId,
      };

      await addDoc(collection(db, "employeeInvitations"), invitationData);

      toast.success(`Invitation email sent to ${employeeData.email}`);

      // Fixed: Use docRefId instead of employeeData.employeeId
      await createAuditLog({
        action: "SEND_INVITATION",
        targetType: "employee",
        targetId: docRefId, // Use the Firestore document ID
        details: {
          email: employeeData.email,
          employeeId: employeeData.employeeId,
          emailId: result.emailId,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(`Failed to send invitation: ${error.message}`);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const employeeId = await generateEmployeeId();

      const employeeData = {
        ...data,
        employeeId,
        temporaryPassword,
        passwordChangeRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: sendInvite ? "pending" : data.status || "active",
      };

      const docRef = await addDoc(collection(db, "employees"), employeeData);

      // Fixed: Use docRef.id for audit log
      await createAuditLog({
        action: "CREATE_EMPLOYEE",
        targetType: "employee",
        targetId: docRef.id, // Use the Firestore document ID
        details: { employeeId, email: data.email },
        timestamp: new Date(),
      });

      if (sendInvite) {
        // Pass the document ID to sendInvitationEmail
        await sendInvitationEmail(
          { ...employeeData, id: docRef.id },
          docRef.id
        );
      }

      toast.success("Employee added successfully!");
      reset();
      setTemporaryPassword("");
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="inline h-4 w-4 mr-1" />
                Email *
              </label>
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
                placeholder="+1 (555) 123-4567"
              />
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

            {/* Temporary Password Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-blue-900">
                  🔐 Temporary Password
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 hover:text-blue-900"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={temporaryPassword}
                  readOnly
                  className="w-full px-3 py-2 pr-10 bg-white border border-blue-300 rounded-md font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                This password will be sent to the employee via email. They will
                be required to change it on first login.
              </p>
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
                Send invitation email with login credentials
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
