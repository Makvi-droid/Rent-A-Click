import React from "react";
import { Eye, Edit, Trash2, UserX, UserCheck } from "lucide-react";

const CustomerTable = ({
  customers,
  loading,
  onView,
  onEdit,
  onDelete,
  onSuspend,
}) => {
  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading customers...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
        <p className="text-gray-400 text-lg">No customers found</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {customer.profilePicture ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={customer.profilePicture}
                          alt={customer.fullName}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {(customer.fullName || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {customer.fullName || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-400">
                        ID: {customer.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{customer.email}</div>
                  <div className="text-sm text-gray-400">
                    {customer.phoneNumber || "No phone"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (customer.accountStatus || "active") === "active"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {(customer.accountStatus || "active")
                      .charAt(0)
                      .toUpperCase() +
                      (customer.accountStatus || "active").slice(1)}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {formatDate(customer.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(customer)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                    </button>
                    <button
                      onClick={() => onEdit(customer)}
                      className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors group"
                      title="Edit Customer"
                    >
                      <Edit className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
                    </button>
                    <button
                      onClick={() =>
                        onSuspend(customer.id, customer.accountStatus)
                      }
                      className={`p-2 rounded-lg transition-colors group ${
                        (customer.accountStatus || "active") === "suspended"
                          ? "hover:bg-green-500/20"
                          : "hover:bg-orange-500/20"
                      }`}
                      title={
                        (customer.accountStatus || "active") === "suspended"
                          ? "Activate"
                          : "Suspend"
                      }
                    >
                      {(customer.accountStatus || "active") === "suspended" ? (
                        <UserCheck className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                      ) : (
                        <UserX className="w-4 h-4 text-gray-400 group-hover:text-orange-400" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(customer)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
