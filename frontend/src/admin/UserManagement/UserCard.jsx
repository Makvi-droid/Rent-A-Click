// UserCard Component (inline to avoid import issues)
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path as needed
import { Search, UserPlus, Filter, MoreVertical, Edit2, Trash2, Shield, ShieldOff, Eye, Download } from 'lucide-react';

const UserCard = ({ user, onEdit, onDelete, onToggleAdmin, onView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div>
            {/** 
            <h3 className="font-semibold text-gray-900">
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'No Name'}
            </h3>
            */}
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onView(user);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye size={16} />
                <span>View Details</span>
              </button>
              <button
                onClick={() => {
                  onEdit(user);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit2 size={16} />
                <span>Edit User</span>
              </button>
              <button
                onClick={() => {
                  onToggleAdmin(user);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
              >
                {user.isAdmin ? <ShieldOff size={16} /> : <Shield size={16} />}
                <span>{user.isAdmin ? 'Remove Admin' : 'Make Admin'}</span>
              </button>
              <button
                onClick={() => {
                  onDelete(user);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete User</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {/** 
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {user.emailVerified ? 'Verified' : 'Unverified'}
          </span>
        </div>
        */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Role:</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {user.isAdmin ? 'Admin' : 'User'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Created:</span>
          <span className="text-gray-800">
            {user.createdAt ? (
              typeof user.createdAt === 'object' && user.createdAt.seconds 
                ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                : new Date(user.createdAt).toLocaleDateString()
            ) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserCard