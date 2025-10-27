// src/utils/auditLogger.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

/**
 * Comprehensive audit logging system for tracking all system activities
 */

// Action type constants for consistency
export const AUDIT_ACTIONS = {
  // Employee Management
  ADD_EMPLOYEE: "add_employee",
  UPDATE_EMPLOYEE: "update_employee",
  DELETE_EMPLOYEE: "delete_employee",
  INVITE_EMPLOYEE: "invite_employee",
  ACTIVATE_EMPLOYEE: "activate_employee",
  DEACTIVATE_EMPLOYEE: "deactivate_employee",

  // Role Management
  CREATE_ROLE: "create_role",
  UPDATE_ROLE: "update_role",
  DELETE_ROLE: "delete_role",
  ASSIGN_ROLE: "assign_role",

  // Order Management
  CREATE_ORDER: "create_order",
  UPDATE_ORDER_STATUS: "update_order_status",
  UPDATE_PAYMENT_STATUS: "update_payment_status",
  UPDATE_RETURN_STATUS: "update_return_status",
  UPDATE_ID_VERIFICATION: "update_id_verification",
  DELETE_ORDER: "delete_order",

  // Product Management
  ADD_PRODUCT: "add_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",
  UPDATE_INVENTORY: "update_inventory",

  // Customer Management
  CREATE_CUSTOMER: "create_customer",
  UPDATE_CUSTOMER: "update_customer",
  DELETE_CUSTOMER: "delete_customer",

  // Settings
  UPDATE_SETTINGS: "update_settings",
  UPDATE_BUSINESS_HOURS: "update_business_hours",
  UPDATE_BLOCKED_DATES: "update_blocked_dates",

  // Authentication
  LOGIN: "login",
  LOGOUT: "logout",
  PASSWORD_RESET: "password_reset",
  FAILED_LOGIN: "failed_login",

  // System
  SYSTEM_ERROR: "system_error",
  DATA_EXPORT: "data_export",
  BULK_UPDATE: "bulk_update",
};

// Target entity types
export const AUDIT_TARGETS = {
  EMPLOYEE: "employee",
  ROLE: "role",
  ORDER: "order",
  PRODUCT: "product",
  CUSTOMER: "customer",
  INVENTORY: "inventory",
  SETTINGS: "settings",
  SYSTEM: "system",
  AUTH: "authentication",
};

// Severity levels
export const AUDIT_SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  CRITICAL: "critical",
};

/**
 * Create an audit log entry in Firestore
 *
 * @param {Object} logData
 * @param {string} logData.action - Action performed (use AUDIT_ACTIONS constants)
 * @param {string} logData.target - Entity affected (use AUDIT_TARGETS constants)
 * @param {string} [logData.targetId] - ID of the affected entity
 * @param {Object} [logData.details] - Additional information about the action
 * @param {string} [logData.severity] - Severity level (default: "info")
 * @param {Object} [logData.metadata] - Additional metadata
 * @returns {Promise<string>} Document ID of created log
 */
export const createAuditLog = async ({
  action,
  target,
  targetId = null,
  details = {},
  severity = AUDIT_SEVERITY.INFO,
  metadata = {},
}) => {
  try {
    const user = auth.currentUser;

    // Get user info (admin or employee)
    let userRole = "unknown";
    let userName = "System";

    if (user) {
      try {
        // Check if admin
        const adminDoc = await getDoc(doc(db, "admin", user.uid));
        if (adminDoc.exists()) {
          userRole = "admin";
          userName = user.email;
        } else {
          // Check if employee
          const employeeQuery = query(
            collection(db, "employees"),
            where("firebaseUid", "==", user.uid)
          );
          const employeeSnapshot = await getDocs(employeeQuery);

          if (!employeeSnapshot.empty) {
            const employeeData = employeeSnapshot.docs[0].data();
            userRole = "employee";
            userName = `${employeeData.firstName} ${employeeData.lastName}`;
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }

    // Prepare log entry
    const logEntry = {
      action,
      target,
      targetId,
      details: {
        ...details,
        // Add browser/device info if available
        userAgent: navigator?.userAgent || "unknown",
        platform: navigator?.platform || "unknown",
      },
      severity,
      metadata,
      timestamp: serverTimestamp(),
      userId: user?.uid || null,
      userEmail: user?.email || "system",
      userName,
      userRole,
      // Add IP address if available (would need backend for real IP)
      ipAddress: null,
    };

    const docRef = await addDoc(collection(db, "auditLogs"), logEntry);

    console.log("✓ Audit log created:", {
      id: docRef.id,
      action,
      target,
      user: userName,
    });

    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating audit log:", error);
    // Don't throw error - audit logging shouldn't break app functionality
    return null;
  }
};

/**
 * Specialized logging functions for common operations
 */

// Employee operations
export const logEmployeeAction = async (
  action,
  employeeData,
  additionalDetails = {}
) => {
  return createAuditLog({
    action,
    target: AUDIT_TARGETS.EMPLOYEE,
    targetId: employeeData.id || employeeData.uid,
    details: {
      employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
      email: employeeData.email,
      ...additionalDetails,
    },
  });
};

// Order operations
export const logOrderAction = async (
  action,
  orderData,
  additionalDetails = {}
) => {
  return createAuditLog({
    action,
    target: AUDIT_TARGETS.ORDER,
    targetId: orderData.id,
    details: {
      orderNumber: orderData.orderNumber,
      customerEmail: orderData.customerInfo?.email,
      amount: orderData.pricing?.total,
      ...additionalDetails,
    },
  });
};

// Product operations
export const logProductAction = async (
  action,
  productData,
  additionalDetails = {}
) => {
  return createAuditLog({
    action,
    target: AUDIT_TARGETS.PRODUCT,
    targetId: productData.id,
    details: {
      productName: productData.name,
      category: productData.category,
      ...additionalDetails,
    },
  });
};

// Authentication operations
export const logAuthAction = async (action, additionalDetails = {}) => {
  return createAuditLog({
    action,
    target: AUDIT_TARGETS.AUTH,
    details: additionalDetails,
    severity:
      action === AUDIT_ACTIONS.FAILED_LOGIN
        ? AUDIT_SEVERITY.WARNING
        : AUDIT_SEVERITY.INFO,
  });
};

// System errors
export const logSystemError = async (errorMessage, errorDetails = {}) => {
  return createAuditLog({
    action: AUDIT_ACTIONS.SYSTEM_ERROR,
    target: AUDIT_TARGETS.SYSTEM,
    details: {
      errorMessage,
      ...errorDetails,
    },
    severity: AUDIT_SEVERITY.ERROR,
  });
};

// Batch operations
export const logBulkAction = async (
  action,
  target,
  affectedCount,
  details = {}
) => {
  return createAuditLog({
    action: AUDIT_ACTIONS.BULK_UPDATE,
    target,
    details: {
      bulkAction: action,
      affectedCount,
      ...details,
    },
    severity: AUDIT_SEVERITY.WARNING,
  });
};

// Helper to format changes for better readability
export const formatChanges = (oldValue, newValue) => {
  return {
    before: oldValue,
    after: newValue,
    changed: oldValue !== newValue,
  };
};

export default createAuditLog;
