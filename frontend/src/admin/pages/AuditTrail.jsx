// src/components/AuditTrail/AuditTrail.jsx
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  startAfter,
  getDocs,
} from "firebase/firestore";
import {
  Shield,
  Filter,
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Activity,
} from "lucide-react";

const AuditTrail = () => {
  const [user] = useAuthState(auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "all",
    target: "all",
    severity: "all",
    user: "all",
    dateRange: "all",
    searchQuery: "",
  });
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    criticalLogs: 0,
    warningLogs: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [hasMore, setHasMore] = useState(true);

  // Fetch audit logs with real-time updates
  useEffect(() => {
    if (!user) return;

    const logsRef = collection(db, "auditLogs");
    const logsQuery = query(
      logsRef,
      orderBy("timestamp", "desc"),
      limit(100) // Get last 100 logs
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const logsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));

        setLogs(logsData);
        calculateStats(logsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching audit logs:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Calculate statistics
  const calculateStats = (logsData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setStats({
      totalLogs: logsData.length,
      todayLogs: logsData.filter((log) => log.timestamp >= today).length,
      criticalLogs: logsData.filter((log) => log.severity === "critical")
        .length,
      warningLogs: logsData.filter((log) => log.severity === "warning").length,
    });
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // Action filter
    if (filters.action !== "all" && log.action !== filters.action) return false;

    // Target filter
    if (filters.target !== "all" && log.target !== filters.target) return false;

    // Severity filter
    if (filters.severity !== "all" && log.severity !== filters.severity)
      return false;

    // User filter
    if (filters.user !== "all" && log.userId !== filters.user) return false;

    // Date range filter
    if (filters.dateRange !== "all") {
      const logDate = log.timestamp;
      const now = new Date();

      switch (filters.dateRange) {
        case "today":
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (logDate < today) return false;
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (logDate < weekAgo) return false;
          break;
        case "month":
          const monthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          if (logDate < monthAgo) return false;
          break;
      }
    }

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = `
        ${log.action}
        ${log.target}
        ${log.userName}
        ${log.userEmail}
        ${JSON.stringify(log.details)}
      `.toLowerCase();

      if (!searchableText.includes(query)) return false;
    }

    return true;
  });

  // Get severity icon and color
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case "critical":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
        };
      case "error":
        return {
          icon: AlertCircle,
          color: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-200",
        };
      case "warning":
        return {
          icon: AlertCircle,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
        };
      default:
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
        };
    }
  };

  // Format action name for display
  const formatAction = (action) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Export logs to CSV
  const exportToCSV = () => {
    const headers = [
      "Timestamp",
      "User",
      "Action",
      "Target",
      "Severity",
      "Details",
    ];
    const csvData = filteredLogs.map((log) => [
      log.timestamp.toLocaleString(),
      log.userName,
      formatAction(log.action),
      log.target,
      log.severity,
      JSON.stringify(log.details),
    ]);

    const csv = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString()}.csv`;
    a.click();
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audit trail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Audit Trail
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete system activity log and security monitoring
                </p>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLogs}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.todayLogs}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.criticalLogs}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.warningLogs}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Severity */}
            <select
              value={filters.severity}
              onChange={(e) =>
                setFilters({ ...filters, severity: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>

            {/* Target */}
            <select
              value={filters.target}
              onChange={(e) =>
                setFilters({ ...filters, target: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Targets</option>
              <option value="employee">Employee</option>
              <option value="order">Order</option>
              <option value="product">Product</option>
              <option value="customer">Customer</option>
              <option value="settings">Settings</option>
              <option value="authentication">Authentication</option>
            </select>

            {/* Date Range */}
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters({ ...filters, dateRange: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            {/* Reset */}
            <button
              onClick={() =>
                setFilters({
                  action: "all",
                  target: "all",
                  severity: "all",
                  user: "all",
                  dateRange: "all",
                  searchQuery: "",
                })
              }
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLogs.map((log) => {
                  const severityConfig = getSeverityConfig(log.severity);
                  const SeverityIcon = severityConfig.icon;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full ${severityConfig.bg} ${severityConfig.border} border w-fit`}
                        >
                          <SeverityIcon
                            className={`h-4 w-4 ${severityConfig.color}`}
                          />
                          <span
                            className={`text-xs font-medium ${severityConfig.color} capitalize`}
                          >
                            {log.severity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{log.timestamp.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {log.userName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {log.target}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md">
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-700">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstLog + 1} to{" "}
                {Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
                {filteredLogs.length} logs
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
