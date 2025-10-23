import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../firebase";
import CustomerStats from "../CustomerManagement/CustomerStats";
import SearchAndFilter from "../CustomerManagement/SearchAndFilter";
import CustomerTable from "../CustomerManagement/CustomerTable";
import DeleteConfirmationModal from "../CustomerManagement/DeleteConfirmationModal";
import EditCustomerModal from "../CustomerManagement/EditCustomerModal";
import ViewCustomerModal from "../CustomerManagement/EditCustomerModal";
import AddCustomerModal from "../CustomerManagement/AddCustomerModal";
import { UserPlus } from "lucide-react";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterAndSortCustomers();
  }, [customers, searchTerm, statusFilter, sortBy]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const customersRef = collection(db, "customers");
      const q = query(customersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const customersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers:", error);
      showNotification("error", "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phoneNumber?.includes(searchTerm) ||
          customer.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (customer) => (customer.accountStatus || "active") === statusFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.fullName || "").localeCompare(b.fullName || "");
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        case "createdAt":
          return (
            new Date(b.createdAt?.toDate() || 0) -
            new Date(a.createdAt?.toDate() || 0)
          );
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleAddCustomer = async (customerData) => {
    try {
      // Create Firebase auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        customerData.email,
        customerData.password || "TempPassword123!"
      );

      // Create customer document
      const customersRef = collection(db, "customers");
      const newCustomer = {
        firebaseUid: userCredential.user.uid,
        fullName: customerData.fullName,
        email: customerData.email,
        phoneNumber: customerData.phoneNumber || "",
        alternativePhone: customerData.alternativePhone || "",
        dateOfBirth: customerData.dateOfBirth || "",
        address: {
          street: customerData.streetAddress || "",
          barangay: customerData.barangay || "",
          city: customerData.city || "",
          state: customerData.state || "",
          zipCode: customerData.zipCode || "",
        },
        idVerification: {
          type: customerData.idType || "",
          number: customerData.idNumber || "",
          documentUrl: "",
          documentUploaded: false,
          verified: false,
        },
        profilePicture: "",
        accountStatus: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(customersRef, newCustomer);
      await fetchCustomers();
      setShowAddModal(false);
      showNotification("success", "Customer added successfully");
    } catch (error) {
      console.error("Error adding customer:", error);
      showNotification("error", error.message || "Failed to add customer");
    }
  };

  const handleEditCustomer = async (customerId, updates) => {
    try {
      const customerRef = doc(db, "customers", customerId);
      await updateDoc(customerRef, {
        ...updates,
        updatedAt: new Date(),
      });
      await fetchCustomers();
      setShowEditModal(false);
      showNotification("success", "Customer updated successfully");
    } catch (error) {
      console.error("Error updating customer:", error);
      showNotification("error", "Failed to update customer");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const customerRef = doc(db, "customers", selectedCustomer.id);
      await deleteDoc(customerRef);
      await fetchCustomers();
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      showNotification("success", "Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      showNotification("error", "Failed to delete customer");
    }
  };

  const handleSuspendCustomer = async (customerId, currentStatus) => {
    try {
      const customerRef = doc(db, "customers", customerId);
      const newStatus = currentStatus === "suspended" ? "active" : "suspended";
      await updateDoc(customerRef, {
        accountStatus: newStatus,
        updatedAt: new Date(),
      });
      await fetchCustomers();
      showNotification(
        "success",
        `Customer ${
          newStatus === "suspended" ? "suspended" : "activated"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating customer status:", error);
      showNotification("error", "Failed to update customer status");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background effects - FIXED: Added pointer-events-none */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-pink-900/10 pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Customer Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage and monitor customer accounts
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Customer
          </button>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
              notification.type === "success"
                ? "bg-green-900/20 border-green-500/30 text-green-400"
                : "bg-red-900/20 border-red-500/30 text-red-400"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Stats */}
        <CustomerStats customers={customers} />

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Customer Table */}
        <CustomerTable
          customers={filteredCustomers}
          loading={loading}
          onView={(customer) => {
            setSelectedCustomer(customer);
            setShowViewModal(true);
          }}
          onEdit={(customer) => {
            setSelectedCustomer(customer);
            setShowEditModal(true);
          }}
          onDelete={(customer) => {
            setSelectedCustomer(customer);
            setShowDeleteModal(true);
          }}
          onSuspend={handleSuspendCustomer}
        />

        {/* Modals */}
        {showAddModal && (
          <AddCustomerModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddCustomer}
          />
        )}

        {showEditModal && selectedCustomer && (
          <EditCustomerModal
            customer={selectedCustomer}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCustomer(null);
            }}
            onSave={handleEditCustomer}
          />
        )}

        {showViewModal && selectedCustomer && (
          <ViewCustomerModal
            customer={selectedCustomer}
            onClose={() => {
              setShowViewModal(false);
              setSelectedCustomer(null);
            }}
          />
        )}

        {showDeleteModal && selectedCustomer && (
          <DeleteConfirmationModal
            customer={selectedCustomer}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCustomer(null);
            }}
            onConfirm={handleDeleteCustomer}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
