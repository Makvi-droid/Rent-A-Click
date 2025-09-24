import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Shield } from "lucide-react";

const PermissionGuard = ({ children, requiredRole = "admin" }) => {
  const [user, loading] = useAuthState(auth);
  const [hasPermission, setHasPermission] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setHasPermission(false);
        setChecking(false);
        return;
      }

      try {
        if (requiredRole === "admin") {
          const adminDoc = await getDoc(doc(db, "admin", user.uid));
          setHasPermission(adminDoc.exists());
        } else {
          // For other roles, check the employee document
          const employeeDoc = await getDoc(doc(db, "employees", user.uid));
          if (employeeDoc.exists()) {
            const employeeData = employeeDoc.data();
            const roleDoc = await getDoc(doc(db, "roles", employeeData.roleId));
            if (roleDoc.exists()) {
              const roleData = roleDoc.data();
              setHasPermission(
                roleData.name === requiredRole ||
                  roleData.permissions.includes(requiredRole)
              );
            }
          }
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setHasPermission(false);
      } finally {
        setChecking(false);
      }
    };

    checkPermissions();
  }, [user, requiredRole]);

  if (loading || checking) {
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
            Authentication Required
          </h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
