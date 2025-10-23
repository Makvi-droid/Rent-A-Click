import React from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";

const DeleteConfirmationModal = ({ customer, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-red-700/50 rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Delete Customer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium mb-2">
                Are you sure you want to delete this customer?
              </p>
              <p className="text-sm text-gray-400">
                This action cannot be undone. All customer data, including their
                account information, history, and associated records will be
                permanently deleted.
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-4 mb-3">
              {customer.profilePicture ? (
                <img
                  src={customer.profilePicture}
                  alt={customer.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {(customer.fullName || "U")[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white font-semibold">
                  {customer.fullName || "Unknown"}
                </p>
                <p className="text-sm text-gray-400">{customer.email}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">Customer ID</p>
              <p className="text-sm text-white font-mono">{customer.id}</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-sm text-yellow-400 font-medium">
              ⚠️ This will also delete all related data including:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400 ml-4">
              <li>• Order history</li>
              <li>• Rental records</li>
              <li>• Payment information</li>
              <li>• Reviews and ratings</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-medium transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <Trash2 className="w-4 h-4" />
            Delete Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
