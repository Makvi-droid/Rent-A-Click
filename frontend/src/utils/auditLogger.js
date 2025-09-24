// src/utils/auditLogger.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

/**
 * Create an audit log entry in Firestore.
 *
 * @param {Object} logData
 * @param {string} logData.action - The type of action performed (e.g., "add_employee", "update_role").
 * @param {string} logData.target - The entity affected (e.g., "employee", "role", "invitation").
 * @param {string} [logData.targetId] - The ID of the entity affected (e.g., employeeId, roleId).
 * @param {Object} [logData.details] - Any additional info about the action.
 */
export const createAuditLog = async ({
  action,
  target,
  targetId = null,
  details = {},
}) => {
  try {
    const user = auth.currentUser;

    await addDoc(collection(db, "auditLogs"), {
      action, // e.g., "add_employee"
      target, // e.g., "employee"
      targetId, // optional: "uid123"
      details, // e.g., { name: "John Doe", role: "Manager" }
      timestamp: serverTimestamp(),
      userId: user?.uid || null,
      userEmail: user?.email || "system",
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};
