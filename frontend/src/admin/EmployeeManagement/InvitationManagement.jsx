import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-hot-toast";
import { Mail, XCircle } from "lucide-react";

const InvitationManagement = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "employees"),
        where("status", "==", "invited")
      );
      const snapshot = await getDocs(q);
      const invitedUsers = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setInvitations(invitedUsers);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const resendInvite = async (employeeId, email) => {
    try {
      // TODO: Trigger email sending via SendGrid / Firebase Extension
      toast.success(`Resent invite to ${email}`);
    } catch (error) {
      console.error("Error resending invite:", error);
      toast.error("Failed to resend invite");
    }
  };

  const revokeInvite = async (employeeId) => {
    try {
      await deleteDoc(doc(db, "employees", employeeId));
      toast.success("Invitation revoked");
      fetchInvitations();
    } catch (error) {
      console.error("Error revoking invite:", error);
      toast.error("Failed to revoke invite");
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading invitations...</p>;
  }

  if (invitations.length === 0) {
    return <p className="text-gray-500">No pending invitations</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Pending Invitations
      </h2>
      <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invitations.map((emp) => (
              <tr key={emp.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {emp.name || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{emp.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{emp.role}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => resendInvite(emp.id, emp.email)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Resend
                  </button>
                  <button
                    onClick={() => revokeInvite(emp.id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvitationManagement;
