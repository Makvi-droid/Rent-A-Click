// src/components/EmployeeManagement/AuditLogs.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";
import { format } from "date-fns";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // listen to Firestore in real-time
    const q = query(
      collection(db, "auditLogs"),
      orderBy("timestamp", "desc"),
      limit(50) // load latest 50 logs, can expand later
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading audit logs...</p>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Logs</h2>

      {logs.length === 0 ? (
        <p className="text-gray-500">No logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Target</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">Performed By</th>
                <th className="px-4 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-4 py-2">{log.target}</td>
                  <td className="px-4 py-2">
                    <pre className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                      {JSON.stringify(log.details || {}, null, 2)}
                    </pre>
                  </td>
                  <td className="px-4 py-2">{log.userEmail || "System"}</td>
                  <td className="px-4 py-2">
                    {log.timestamp?.toDate
                      ? format(log.timestamp.toDate(), "PPpp")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
