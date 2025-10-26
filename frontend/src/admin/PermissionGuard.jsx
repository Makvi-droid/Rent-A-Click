import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Permission to menu item mapping
const permissionToMenuMap = {
  view_dashboard: "dashboard",
  manage_products: "products",
  view_products: "products",
  manage_orders: "orders",
  view_orders: "orders",
  manage_inventory: "inventory",
  view_inventory: "inventory",
  manage_employees: "Employees",
  view_employees: "Employees",
  manage_customers: "customers",
  view_customers: "customers",
  view_analytics: "analytics",
  access_contact_support: "contact",
  manage_settings: "settings",
  view_notifications: "notifications",
};

// Create a context for permissions
export const PermissionsContext = React.createContext({
  permissions: [],
  isAdmin: false,
  loading: true,
  hasAccess: () => false,
});

// Permission Provider Component
export const PermissionsProvider = ({ children }) => {
  const [user] = useAuthState(auth);
  const [permissions, setPermissions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check admin
        const adminDoc = await getDoc(doc(db, "admin", user.uid));
        if (adminDoc.exists()) {
          setIsAdmin(true);
          setPermissions(Object.keys(permissionToMenuMap));
          setLoading(false);
          return;
        }

        // Check employee
        const employeesRef = collection(db, "employees");
        const q = query(employeesRef, where("firebaseUid", "==", user.uid));
        const employeeSnapshot = await getDocs(q);

        if (!employeeSnapshot.empty) {
          const employeeData = employeeSnapshot.docs[0].data();
          if (employeeData.roleId) {
            const roleDoc = await getDoc(doc(db, "roles", employeeData.roleId));
            if (roleDoc.exists()) {
              setPermissions(roleDoc.data().permissions || []);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const hasAccess = (section) => {
    if (isAdmin) return true;
    if (section === "dashboard") return true;

    return permissions.some(
      (permission) => permissionToMenuMap[permission] === section
    );
  };

  return (
    <PermissionsContext.Provider
      value={{ permissions, isAdmin, loading, hasAccess }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

// Hook to use permissions
export const usePermissions = () => {
  const context = React.useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
};
