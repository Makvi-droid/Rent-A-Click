import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Save,
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
import { createUserWithEmailAndPassword } from "firebase/auth";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  roleId: yup.string().required("Role is required"),
  notes: yup.string(),
});

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
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
      status: "active",
    },
  });

  useEffect(() => {
    if (isOpen) {
      console.log("AddEmployeeModal opened");
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
        await updateDoc(counterRef, { count: increment(1) });
      } else {
        await setDoc(counterRef, { count: 1 });
      }

      return `EMP${nextId.toString().padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating employee ID:", error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // STEP 1: Create Firebase Auth account FIRST
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email.toLowerCase().trim(),
        temporaryPassword
      );
      const firebaseUser = userCredential.user;

      // STEP 2: Generate employee ID
      const employeeId = await generateEmployeeId();

      // STEP 3: Create employee document - USE FIREBASE UID AS DOCUMENT ID
      const employeeData = {
        ...data,
        email: data.email.toLowerCase().trim(),
        employeeId,
        firebaseUid: firebaseUser.uid,
        passwordChangeRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "active",
      };

      const employeeRef = doc(db, "employees", firebaseUser.uid);
      await setDoc(employeeRef, employeeData);

      // ✅ STEP 4: Create audit log
      await createAuditLog({
        action: "CREATE_EMPLOYEE",
        target: "employee",
        targetId: firebaseUser.uid,
        details: {
          employeeId,
          email: data.email,
          roleId: data.roleId,
        },
      });

      // ✅ STEP 5: Show success message
      toast.success(
        `Employee added! Temporary password: ${temporaryPassword}`,
        { duration: 10000 }
      );

      console.log("=== EMPLOYEE CREATION SUCCESS ===");
      console.log("Firebase UID:", firebaseUser.uid);
      console.log("Employee ID:", employeeId);
      console.log("Email:", data.email);
      console.log("Temporary Password:", temporaryPassword);
      console.log("================================");

      reset();
      setTemporaryPassword("");
      onClose();
    } catch (error) {
      console.error("❌ Error adding employee:", error);

      // Handle specific Firebase Auth errors
      let errorMessage = "Failed to add employee";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Each employee needs a unique email.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Generated password is too weak. Please regenerate.";
      } else if (error.code === "permission-denied") {
        errorMessage =
          "Permission denied. Check Firestore security rules for employees collection.";
      }

      toast.error(errorMessage);
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
    console.log("AddEmployeeModal not rendering - isOpen is false");
    return null;
  }

  console.log("AddEmployeeModal rendering with isOpen:", isOpen);

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-employee-modal-title"
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
              id="add-employee-modal-title"
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
                ⚠️ Save this password! The employee will use this to login and
                will be required to change it on first login.
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
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Add Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
