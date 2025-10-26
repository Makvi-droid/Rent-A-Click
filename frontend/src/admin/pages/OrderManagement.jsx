// OrderManagement.jsx - FIXED VERSION WITH EMPLOYEE ACCESS
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  where,
  getDocs,
} from "firebase/firestore";

// Component imports
import OrdersHeader from "../OrderManagement/OrdersHeader";
import OrdersFilters from "../OrderManagement/OrdersFilters";
import OrdersTable from "../OrderManagement/OrdersTable";
import OrderDetailsModal from "../OrderManagement/OrderDetailsModal";
import OrdersStats from "../OrderManagement/OrdersStats";
import OrdersLoadingState from "../OrderManagement/OrdersLoadingState";
import OrdersErrorState from "../OrderManagement/OrdersErrorState";

const OrderManagement = () => {
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    paymentStatus: "all",
    paymentMethod: "all",
    deliveryMethod: "all",
    dateRange: "all",
    searchQuery: "",
    customDateStart: "",
    customDateEnd: "",
    returnStatus: "all",
    physicalIdShown: "all",
    idVerification: "all",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    itemsReturned: 0,
    itemsPending: 0,
    overdueItems: 0,
    idVerified: 0,
    idMissing: 0,
    physicalIdShown: 0,
    physicalIdNotShown: 0,
    totalPenalties: 0,
  });

  const LATE_RETURN_PENALTY = 150;

  // Date conversion function
  const convertFirebaseTimestamp = (timestamp) => {
    try {
      if (!timestamp) return new Date();
      if (timestamp instanceof Date)
        return isNaN(timestamp.getTime()) ? new Date() : timestamp;
      if (timestamp && typeof timestamp.toDate === "function") {
        const date = timestamp.toDate();
        return isNaN(date.getTime()) ? new Date() : date;
      }
      if (typeof timestamp === "number") {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? new Date() : date;
      }
      if (typeof timestamp === "string") {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? new Date() : date;
      }
      if (timestamp && timestamp.seconds) {
        const date = new Date(
          timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
        );
        return isNaN(date.getTime()) ? new Date() : date;
      }
      return new Date();
    } catch (error) {
      console.error("Error converting timestamp:", error);
      return new Date();
    }
  };

  // Date formatting function
  const formatDate = (date, options = {}) => {
    try {
      const validDate = convertFirebaseTimestamp(date);
      const defaultOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
      };
      return new Intl.DateTimeFormat("en-PH", {
        ...defaultOptions,
        ...options,
      }).format(validDate);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Check if user is admin or employee with permissions
  useEffect(() => {
    const checkUserAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsEmployee(false);
        setAuthCheckLoading(false);
        return;
      }

      try {
        console.log("Checking access for user:", user.uid, user.email);

        // Check if user is admin
        const adminDocRef = doc(db, "admin", user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
          console.log("User is admin");
          setIsAdmin(true);
          setIsEmployee(false);
          setUserPermissions(["all"]); // Admin has all permissions
          setAuthCheckLoading(false);
          return;
        }

        // Check if user is employee
        // First try by firebaseUid
        let employeeDoc = await getDoc(doc(db, "employees", user.uid));

        // If not found by UID, try by email
        if (!employeeDoc.exists()) {
          console.log("Checking employee by email:", user.email);
          const employeesQuery = query(
            collection(db, "employees"),
            where("email", "==", user.email)
          );
          const employeeSnapshot = await getDocs(employeesQuery);

          if (!employeeSnapshot.empty) {
            employeeDoc = employeeSnapshot.docs[0];
            console.log("Found employee by email");
          }
        }

        if (employeeDoc.exists()) {
          const empData = employeeDoc.data();
          console.log("Employee found:", empData);
          setEmployeeData({ id: employeeDoc.id, ...empData });
          setIsEmployee(true);

          // Get employee's role permissions
          if (empData.roleId) {
            const roleDoc = await getDoc(doc(db, "roles", empData.roleId));
            if (roleDoc.exists()) {
              const roleData = roleDoc.data();
              console.log("Employee role permissions:", roleData.permissions);
              setUserPermissions(roleData.permissions || []);
            } else {
              console.log("Role not found for roleId:", empData.roleId);
              setUserPermissions([]);
            }
          } else {
            console.log("Employee has no roleId");
            setUserPermissions([]);
          }
        } else {
          console.log("User is neither admin nor employee");
          setIsAdmin(false);
          setIsEmployee(false);
          setUserPermissions([]);
        }
      } catch (error) {
        console.error("Error checking user access:", error);
        setIsAdmin(false);
        setIsEmployee(false);
        setError("Failed to verify access privileges");
      } finally {
        setAuthCheckLoading(false);
      }
    };

    checkUserAccess();
  }, [user]);

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (isAdmin) return true;
    return userPermissions.includes(permission);
  };

  // Currency formatter
  const formatCurrency = (amount) => {
    try {
      const numAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return "₱0.00";

      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(numAmount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return "₱0.00";
    }
  };

  // Check if return is overdue
  const isReturnOverdue = (order) => {
    if (order.itemReturned) return false;

    try {
      const endDate = order.rentalDetails?.endDate;
      if (!endDate) return false;

      let returnDate;
      if (typeof endDate === "string") {
        returnDate = new Date(endDate);
      } else if (endDate && endDate.seconds) {
        returnDate = new Date(endDate.seconds * 1000);
      } else if (endDate instanceof Date) {
        returnDate = endDate;
      } else if (endDate && typeof endDate.toDate === "function") {
        returnDate = endDate.toDate();
      } else {
        returnDate = new Date(endDate);
      }

      if (isNaN(returnDate.getTime())) {
        console.warn("Invalid return date for order:", order.id, endDate);
        return false;
      }

      const now = new Date();
      const isOverdue = now > returnDate;

      if (isOverdue && !order.itemReturned) {
        console.log("Overdue order found:", {
          orderId: order.id,
          returnDate: returnDate.toISOString(),
          now: now.toISOString(),
          daysOverdue: Math.floor((now - returnDate) / (1000 * 60 * 60 * 24)),
        });
      }

      return isOverdue;
    } catch (error) {
      console.error(
        "Error checking overdue status for order:",
        order.id,
        error
      );
      return false;
    }
  };

  // Calculate penalty for overdue items
  const calculatePenalty = (order) => {
    const penalty =
      isReturnOverdue(order) && !order.itemReturned ? LATE_RETURN_PENALTY : 0;
    return penalty;
  };

  // Fetch orders from Firebase
  useEffect(() => {
    // Allow access if user is admin OR employee with view_orders permission
    const canViewOrders =
      isAdmin || hasPermission("view_orders") || hasPermission("manage_orders");

    if (!user || authCheckLoading || (!canViewOrders && !isEmployee)) {
      console.log("Cannot view orders:", {
        user: !!user,
        authCheckLoading,
        canViewOrders,
        isEmployee,
      });
      return;
    }

    console.log("Fetching orders for user:", {
      isAdmin,
      isEmployee,
      permissions: userPermissions,
    });

    const ordersRef = collection(db, "checkouts");
    const ordersQuery = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        try {
          console.log(
            "Orders snapshot received:",
            snapshot.docs.length,
            "orders"
          );
          const ordersData = snapshot.docs.map((doc) => {
            const data = doc.data();

            const orderData = {
              id: doc.id,
              ...data,
              // Date conversion
              createdAt: convertFirebaseTimestamp(data.createdAt),
              updatedAt: convertFirebaseTimestamp(data.updatedAt),
              returnedAt: data.returnedAt
                ? convertFirebaseTimestamp(data.returnedAt)
                : null,
              // Formatted dates
              formattedCreatedAt: formatDate(data.createdAt),
              formattedUpdatedAt: formatDate(data.updatedAt),
              formattedReturnedAt: data.returnedAt
                ? formatDate(data.returnedAt)
                : null,
              // Handle rental dates
              rentalDetails: data.rentalDetails
                ? {
                    ...data.rentalDetails,
                    rentalDate: convertFirebaseTimestamp(
                      data.rentalDetails?.rentalDate
                    ),
                    returnDate: convertFirebaseTimestamp(
                      data.rentalDetails?.returnDate
                    ),
                    endDate: data.rentalDetails?.endDate,
                    formattedRentalDate: formatDate(
                      data.rentalDetails?.rentalDate,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    ),
                    formattedReturnDate: formatDate(
                      data.rentalDetails?.returnDate,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    ),
                  }
                : null,
            };

            const isOverdue = !data.itemReturned && isReturnOverdue(orderData);
            const penalty = calculatePenalty(orderData);

            return {
              ...orderData,
              isOverdue,
              hasIdVerification: Boolean(data.idSubmitted),
              physicalIdShown: Boolean(data.physicalIdShown),
              physicalIdShownAt: data.physicalIdShownAt
                ? convertFirebaseTimestamp(data.physicalIdShownAt)
                : null,
              penalty,
            };
          });

          setOrders(ordersData);
          calculateStats(ordersData);
          setLoading(false);
        } catch (err) {
          console.error("Error processing orders:", err);
          setError("Failed to load orders");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching orders:", err);
        setError(
          "Failed to connect to database. Please check your access privileges."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAdmin, isEmployee, authCheckLoading, userPermissions]);

  // Calculate statistics
  const calculateStats = (ordersData) => {
    const totalPenalties = ordersData.reduce(
      (sum, order) => sum + calculatePenalty(order),
      0
    );

    const newStats = {
      total: ordersData.length,
      pending: ordersData.filter((order) => order.status === "pending").length,
      confirmed: ordersData.filter((order) => order.status === "confirmed")
        .length,
      completed: ordersData.filter((order) => order.status === "completed")
        .length,
      cancelled: ordersData.filter((order) => order.status === "cancelled")
        .length,
      totalRevenue: ordersData
        .filter((order) => order.paymentStatus === "paid")
        .reduce(
          (sum, order) => sum + (parseFloat(order.pricing?.total) || 0),
          0
        ),
      pendingRevenue: ordersData
        .filter((order) => order.paymentStatus === "pending")
        .reduce(
          (sum, order) => sum + (parseFloat(order.pricing?.total) || 0),
          0
        ),
      itemsReturned: ordersData.filter((order) => order.itemReturned).length,
      itemsPending: ordersData.filter(
        (order) => !order.itemReturned && !isReturnOverdue(order)
      ).length,
      overdueItems: ordersData.filter(
        (order) => isReturnOverdue(order) && !order.itemReturned
      ).length,
      idVerified: ordersData.filter((order) => order.idSubmitted).length,
      idMissing: ordersData.filter((order) => !order.idSubmitted).length,
      physicalIdShown: ordersData.filter(
        (order) => order.physicalIdShown === true
      ).length,
      physicalIdNotShown: ordersData.filter(
        (order) => order.physicalIdShown !== true
      ).length,
      totalPenalties,
    };

    setStats(newStats);
  };

  // Date filtering
  const isDateInRange = (orderDate, startDate, endDate) => {
    try {
      const date = convertFirebaseTimestamp(orderDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return date >= start && date <= end;
    } catch (error) {
      console.error("Error in date range comparison:", error);
      return false;
    }
  };

  // Filter application
  useEffect(() => {
    let filtered = [...orders];

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    // Payment status filter
    if (filters.paymentStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.paymentStatus === filters.paymentStatus
      );
    }

    // Payment method filter
    if (filters.paymentMethod !== "all") {
      filtered = filtered.filter(
        (order) => order.paymentInfo?.method === filters.paymentMethod
      );
    }

    // Delivery method filter
    if (filters.deliveryMethod !== "all") {
      filtered = filtered.filter(
        (order) =>
          order.rentalDetails?.deliveryMethod === filters.deliveryMethod
      );
    }

    // Return status filter
    if (filters.returnStatus !== "all") {
      switch (filters.returnStatus) {
        case "returned":
          filtered = filtered.filter((order) => order.itemReturned);
          break;
        case "pending":
          filtered = filtered.filter(
            (order) => !order.itemReturned && !isReturnOverdue(order)
          );
          break;
        case "overdue":
          filtered = filtered.filter(
            (order) => !order.itemReturned && isReturnOverdue(order)
          );
          break;
        default:
          break;
      }
    }

    // ID verification filter
    if (filters.idVerification !== "all") {
      switch (filters.idVerification) {
        case "submitted":
          filtered = filtered.filter((order) => order.idSubmitted);
          break;
        case "physically-verified":
          filtered = filtered.filter(
            (order) => order.idSubmitted && order.physicalIdShown
          );
          break;
        case "missing":
          filtered = filtered.filter((order) => !order.idSubmitted);
          break;
        default:
          break;
      }
    }

    // Physical ID filter
    if (filters.physicalIdShown !== "all") {
      switch (filters.physicalIdShown) {
        case "shown":
          filtered = filtered.filter((order) => order.physicalIdShown === true);
          break;
        case "not-shown":
          filtered = filtered.filter((order) => order.physicalIdShown !== true);
          break;
        default:
          break;
      }
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          filtered = filtered.filter((order) => {
            const orderDate = convertFirebaseTimestamp(order.createdAt);
            return orderDate >= startDate;
          });
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((order) => {
            const orderDate = convertFirebaseTimestamp(order.createdAt);
            return orderDate >= startDate;
          });
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter((order) => {
            const orderDate = convertFirebaseTimestamp(order.createdAt);
            return orderDate >= startDate;
          });
          break;
        case "custom":
          if (filters.customDateStart && filters.customDateEnd) {
            filtered = filtered.filter((order) =>
              isDateInRange(
                order.createdAt,
                filters.customDateStart,
                filters.customDateEnd
              )
            );
          }
          break;
        default:
          break;
      }
    }

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(query) ||
          order.orderNumber?.toLowerCase().includes(query) ||
          order.customerInfo?.firstName?.toLowerCase().includes(query) ||
          order.customerInfo?.lastName?.toLowerCase().includes(query) ||
          order.customerInfo?.email?.toLowerCase().includes(query) ||
          order.customerInfo?.phone?.includes(query)
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, filters]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!hasPermission("manage_orders")) {
      alert("You do not have permission to update orders");
      return;
    }

    try {
      const orderRef = doc(db, "checkouts", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error.code === "permission-denied") {
        alert("Permission denied. Please check your access privileges.");
      } else {
        alert("Failed to update order status: " + error.message);
      }
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    if (!hasPermission("manage_orders")) {
      alert("You do not have permission to update payment status");
      return;
    }

    try {
      const orderRef = doc(db, "checkouts", orderId);
      await updateDoc(orderRef, {
        paymentStatus: newPaymentStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      if (error.code === "permission-denied") {
        alert("Permission denied. Please check your access privileges.");
      } else {
        alert("Failed to update payment status: " + error.message);
      }
    }
  };

  // Update return status
  const updateReturnStatus = async (orderId, isReturned, returnedAt = null) => {
    if (!hasPermission("manage_orders")) {
      alert("You do not have permission to update return status");
      return;
    }

    try {
      const orderRef = doc(db, "checkouts", orderId);
      const updateData = {
        itemReturned: isReturned,
        updatedAt: new Date(),
      };

      if (isReturned && returnedAt) {
        updateData.returnedAt = returnedAt;
      } else if (!isReturned) {
        updateData.returnedAt = null;
      }

      await updateDoc(orderRef, updateData);
    } catch (error) {
      console.error("Error updating return status:", error);
      if (error.code === "permission-denied") {
        alert("Permission denied. Please check your access privileges.");
      } else {
        alert("Failed to update return status: " + error.message);
      }
    }
  };

  // Update physical ID verification status
  const updatePhysicalIdStatus = async (orderId, physicalIdShown) => {
    if (!hasPermission("manage_orders")) {
      alert("You do not have permission to update ID status");
      return;
    }

    if (!orderId) {
      console.error("Order ID is required");
      return;
    }

    const isPhysicalIdShown = Boolean(physicalIdShown);

    try {
      const orderRef = doc(db, "checkouts", orderId);

      const updateData = {
        physicalIdShown: isPhysicalIdShown,
        updatedAt: new Date(),
      };

      if (isPhysicalIdShown) {
        updateData.physicalIdShownAt = new Date();
      } else {
        updateData.physicalIdShownAt = null;
      }

      await updateDoc(orderRef, updateData);
    } catch (error) {
      console.error("Error updating physical ID status:", error);
      if (error.code === "permission-denied") {
        alert("Permission denied. Please check your access privileges.");
      } else {
        alert("Failed to update physical ID status: " + error.message);
      }
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!hasPermission("manage_orders")) {
      alert("You do not have permission to delete orders");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "checkouts", orderId));
      alert("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);

      if (error.code === "permission-denied") {
        alert(
          "Permission denied. You may not have the required privileges or the Firestore security rules need to be updated."
        );
      } else if (error.code === "not-found") {
        alert("Order not found. It may have already been deleted.");
      } else {
        alert("Failed to delete order: " + error.message);
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Loading state
  if (authLoading || authCheckLoading || loading) {
    return <OrdersLoadingState />;
  }

  // Error state
  if (error) {
    return (
      <OrdersErrorState
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">You need to be logged in to access this page.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Not authorized - check both admin and employee status
  const canViewOrders =
    isAdmin || hasPermission("view_orders") || hasPermission("manage_orders");

  if (!canViewOrders) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">
            You need proper permissions to access the order management system.
          </p>
          <p className="mb-2 text-gray-400">User: {user.email}</p>
          <p className="mb-4 text-gray-400">
            Status: {isAdmin ? "Admin" : isEmployee ? "Employee" : "No Access"}
          </p>
          {isEmployee && (
            <p className="mb-4 text-yellow-400">
              Your role does not have "view_orders" or "manage_orders"
              permission. Please contact your administrator.
            </p>
          )}
          <div className="space-x-4">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrdersHeader
          totalOrders={filteredOrders.length}
          user={user}
          isAdmin={isAdmin}
          isEmployee={isEmployee}
          employeeData={employeeData}
        />

        <OrdersStats
          stats={stats}
          formatCurrency={formatCurrency}
          latePenaltyAmount={LATE_RETURN_PENALTY}
        />

        <OrdersFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          totalResults={filteredOrders.length}
        />

        <OrdersTable
          orders={currentOrders}
          currentPage={currentPage}
          totalPages={totalPages}
          ordersPerPage={ordersPerPage}
          onPageChange={setCurrentPage}
          onViewDetails={viewOrderDetails}
          onUpdateStatus={updateOrderStatus}
          onUpdatePaymentStatus={updatePaymentStatus}
          onUpdateReturnStatus={updateReturnStatus}
          onUpdatePhysicalIdStatus={updatePhysicalIdStatus}
          onDeleteOrder={deleteOrder}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          latePenaltyAmount={LATE_RETURN_PENALTY}
          canManageOrders={hasPermission("manage_orders")}
          isAdmin={isAdmin}
        />

        {showModal && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedOrder(null);
            }}
            onUpdateStatus={updateOrderStatus}
            onUpdatePaymentStatus={updatePaymentStatus}
            onUpdateReturnStatus={updateReturnStatus}
            onUpdatePhysicalIdStatus={updatePhysicalIdStatus}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            latePenaltyAmount={LATE_RETURN_PENALTY}
            canManageOrders={hasPermission("manage_orders")}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
