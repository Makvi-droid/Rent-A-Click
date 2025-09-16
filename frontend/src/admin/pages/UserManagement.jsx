import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path as needed
import { Search, UserPlus, Filter, MoreVertical, Edit2, Trash2, Shield, ShieldOff, Eye, Download } from 'lucide-react';
import UserCard from '../UserManagement/UserCard';
import UserModal from '../UserManagement/UserModal';

/// Main UserManagement Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, admin, user, verified, unverified
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // view, edit
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersCollection = collection(db, 'users');
      
      // Try different query approaches
      let usersQuery;
      try {
        // First, try with orderBy
        usersQuery = query(usersCollection, orderBy('createdAt', 'desc'));
      } catch (orderByError) {
        console.warn('OrderBy failed, trying without ordering:', orderByError);
        // If orderBy fails, just query the collection
        usersQuery = usersCollection;
      }
      
      const snapshot = await getDocs(usersQuery);
      
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort manually if orderBy failed
      if (usersData.length > 0 && usersData[0].createdAt) {
        usersData.sort((a, b) => {
          const aDate = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt || 0);
          const bDate = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt || 0);
          return bDate - aDate;
        });
      }
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search users
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'admin':
        filtered = filtered.filter(user => user.isAdmin);
        break;
      case 'user':
        filtered = filtered.filter(user => !user.isAdmin);
        break;
      case 'verified':
        filtered = filtered.filter(user => user.emailVerified);
        break;
      case 'unverified':
        filtered = filtered.filter(user => !user.emailVerified);
        break;
      default:
        break;
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterBy]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user edit
  const handleEditUser = async (userId, updateData) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updateData } : user
      ));
      
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user: ' + error.message);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'users', user.id));
        setUsers(prev => prev.filter(u => u.id !== user.id));
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  // Handle admin role toggle
  const handleToggleAdmin = async (user) => {
    const newAdminStatus = !user.isAdmin;
    const action = newAdminStatus ? 'grant admin access to' : 'remove admin access from';
    
    if (window.confirm(`Are you sure you want to ${action} ${user.email}?`)) {
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { isAdmin: newAdminStatus });
        
        setUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, isAdmin: newAdminStatus } : u
        ));
        
        alert(`User ${newAdminStatus ? 'promoted to admin' : 'admin access removed'} successfully!`);
      } catch (error) {
        console.error('Error updating admin status:', error);
        alert('Error updating admin status: ' + error.message);
      }
    }
  };

  // Export users data
  const handleExportUsers = () => {
    const csvContent = [
      ['ID', 'Email', 'Admin', 'Email Verified', 'Created At'],
      ...users.map(user => [
        user.id,
        user.email,
        user.firstName || '',
        user.lastName || '',
        user.isAdmin ? 'Yes' : 'No',
        user.emailVerified ? 'Yes' : 'No',
        user.createdAt ? (
          typeof user.createdAt === 'object' && user.createdAt.seconds 
            ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
            : new Date(user.createdAt).toLocaleDateString()
        ) : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <Shield className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            This usually means you don't have permission to access user data, or your Firestore security rules need to be updated.
          </p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage and monitor all users in your system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.isAdmin).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.emailVerified).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Regular Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => !user.isAdmin).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                >
                  <option value="all">All Users</option>
                  <option value="admin">Admins Only</option>
                  <option value="user">Regular Users</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              <button
                onClick={handleExportUsers}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                <span>Export</span>
              </button>

              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No users have been registered yet.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={(user) => {
                  setSelectedUser(user);
                  setModalMode('edit');
                  setIsModalOpen(true);
                }}
                onView={(user) => {
                  setSelectedUser(user);
                  setModalMode('view');
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteUser}
                onToggleAdmin={handleToggleAdmin}
              />
            ))}
          </div>
        )}

        {/* User Modal */}
        <UserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleEditUser}
          mode={modalMode}
        />
      </div>
    </div>
  );
};

export default UserManagement;