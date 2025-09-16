import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path as needed
import { Search, UserPlus, Filter, MoreVertical, Edit2, Trash2, Shield, ShieldOff, Eye, Download } from 'lucide-react';


// UserModal Component (inline to avoid import issues)
const UserModal = ({ user, isOpen, onClose, onSave, mode = 'view' }) => {
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user) {
      setEditData({
        /** 
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        */
        email: user.email || '',
        emailVerified: user.emailVerified || false,
        isAdmin: user.isAdmin || false
      });
    }
  }, [user]);

  const handleSave = () => {
    onSave(user.id, editData);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {mode === 'edit' ? 'Edit User' : 'User Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

        
          <div className="space-y-4">
            {/** 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              {mode === 'edit' ? (
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-md">{user.firstName || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              {mode === 'edit' ? (
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-md">{user.lastName || 'N/A'}</p>
              )}
            </div>
            */}
        

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="px-3 py-2 bg-gray-50 rounded-md">{user.email}</p>
            </div>

            {mode === 'edit' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Verified
                  </label>
                  <input
                    type="checkbox"
                    checked={editData.emailVerified}
                    onChange={(e) => setEditData(prev => ({ ...prev, emailVerified: e.target.checked }))}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Role
                  </label>
                  <input
                    type="checkbox"
                    checked={editData.isAdmin}
                    onChange={(e) => setEditData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <p className="px-3 py-2 bg-gray-50 rounded-md text-sm font-mono">{user.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created At
              </label>
              <p className="px-3 py-2 bg-gray-50 rounded-md">
                {user.createdAt ? (
                  typeof user.createdAt === 'object' && user.createdAt.seconds 
                    ? new Date(user.createdAt.seconds * 1000).toLocaleString()
                    : new Date(user.createdAt).toLocaleString()
                ) : 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Login
              </label>
              <p className="px-3 py-2 bg-gray-50 rounded-md">
                {user.lastLoginAt ? (
                  typeof user.lastLoginAt === 'object' && user.lastLoginAt.seconds 
                    ? new Date(user.lastLoginAt.seconds * 1000).toLocaleString()
                    : new Date(user.lastLoginAt).toLocaleString()
                ) : 'Never'}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {mode === 'edit' && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default UserModal