import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Truck,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit3,
  Save,
  Loader,
  Copy,
  ExternalLink,
  Eye,
  FileImage,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

const OrderDetailsModal = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onUpdateReturnStatus,
  onUpdatePhysicalIdStatus,
  formatCurrency,
  formatDate,
  latePenaltyAmount = 150,
}) => {
  const [isEditing, setIsEditing] = useState({
    status: false,
    payment: false,
    returned: false,
    physicalId: false,
  });

  const [tempValues, setTempValues] = useState({
    status: "",
    paymentStatus: "",
    itemReturned: false,
    returnedAt: null,
    physicalIdShown: false,
  });

  const [isUpdating, setIsUpdating] = useState({
    status: false,
    payment: false,
    returned: false,
    physicalId: false,
  });

  const [showCopied, setShowCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (order) {
      setTempValues({
        status: order.status || "",
        paymentStatus: order.paymentStatus || "",
        itemReturned: Boolean(order.itemReturned),
        returnedAt: order.returnedAt || null,
        physicalIdShown: Boolean(order.physicalIdShown),
      });
    }
  }, [order]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", icon: Clock, text: "Pending" },
      confirmed: { color: "bg-blue-500", icon: CheckCircle, text: "Confirmed" },
      completed: {
        color: "bg-green-500",
        icon: CheckCircle,
        text: "Completed",
      },
      cancelled: { color: "bg-red-500", icon: XCircle, text: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${config.color} shadow-lg`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const handlePhysicalIdToggle = (checked) => {
    setTempValues({ ...tempValues, physicalIdShown: checked });
  };

  const handleUpdatePhysicalId = async () => {
    setIsUpdating({ ...isUpdating, physicalId: true });

    try {
      await onUpdatePhysicalIdStatus(order.id, tempValues.physicalIdShown);
      setIsEditing({ ...isEditing, physicalId: false });
    } catch (error) {
      console.error("Error updating physical ID status:", error);
    } finally {
      setIsUpdating({ ...isUpdating, physicalId: false });
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: "bg-green-500", icon: CheckCircle, text: "Paid" },
      pending: { color: "bg-yellow-500", icon: AlertCircle, text: "Pending" },
      failed: { color: "bg-red-500", icon: XCircle, text: "Failed" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${config.color} shadow-lg`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getReturnStatusBadge = (returned, isOverdue = false) => {
    if (returned) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-green-500 shadow-lg">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Returned
        </span>
      );
    } else if (isOverdue) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-red-500 shadow-lg">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-orange-500 shadow-lg">
          <RotateCcw className="w-3 h-3 mr-1" />
          Pending Return
        </span>
      );
    }
  };

  // FIXED: Check if return is overdue
  const isReturnOverdue = () => {
    if (order.itemReturned) return false;

    try {
      const endDate = order.rentalDetails?.endDate;
      if (!endDate) return false;

      // Handle both string dates and Firebase timestamps
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

      // Check if date is valid
      if (isNaN(returnDate.getTime())) {
        console.warn("Invalid return date:", endDate);
        return false;
      }

      return new Date() > returnDate;
    } catch (error) {
      console.error("Error checking overdue status:", error);
      return false;
    }
  };

  // FIXED: Calculate penalty if overdue
  const calculatePenalty = () => {
    return isReturnOverdue() && !order.itemReturned ? latePenaltyAmount : 0;
  };

  const handleUpdateStatus = async (type) => {
    setIsUpdating({ ...isUpdating, [type]: true });

    try {
      if (type === "status") {
        await onUpdateStatus(order.id, tempValues.status);
      } else if (type === "payment") {
        await onUpdatePaymentStatus(order.id, tempValues.paymentStatus);
      } else if (type === "returned") {
        await onUpdateReturnStatus(
          order.id,
          tempValues.itemReturned,
          tempValues.itemReturned ? new Date() : null
        );
      } else if (type === "physicalId") {
        await onUpdatePhysicalIdStatus(order.id, tempValues.physicalIdShown);
      }
      setIsEditing({ ...isEditing, [type]: false });
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    } finally {
      setIsUpdating({ ...isUpdating, [type]: false });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const openImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const renderRentalItems = () => {
    const items = order.items || order.rentalItems || [];
    if (items.length === 0)
      return <p className="text-gray-400">No items found</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-gray-700/30 rounded-lg p-4 border border-gray-600"
          >
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                {item.imageUrl || item.image ? (
                  <img
                    src={item.imageUrl || item.image}
                    alt={item.name || "Item"}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImage(item.imageUrl || item.image)}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full ${
                    item.imageUrl || item.image ? "hidden" : "flex"
                  } items-center justify-center`}
                >
                  <FileImage className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium mb-1">
                  {item.name || item.title || "Unnamed Item"}
                </h4>
                {item.brand && (
                  <p className="text-gray-400 text-sm mb-1">{item.brand}</p>
                )}
                {item.category && (
                  <span className="inline-block bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded mb-1">
                    {item.category}
                  </span>
                )}
                {item.subCategory && (
                  <span className="inline-block bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded ml-1 mb-1">
                    {item.subCategory}
                  </span>
                )}
                <div className="flex items-center justify-between mt-2">
                  {item.price && (
                    <span className="text-green-400 font-medium">
                      {formatCurrency(item.price)}/day
                    </span>
                  )}
                  {item.quantity && (
                    <span className="text-gray-400 text-sm">
                      Qty: {item.quantity}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const safeFormatDate = (date) => {
    if (!date) return "N/A";

    try {
      let parsedDate;

      if (date instanceof Date) {
        parsedDate = date;
      } else if (typeof date === "object" && date !== null) {
        if (date.seconds !== undefined) {
          parsedDate = new Date(
            date.seconds * 1000 + (date.nanoseconds || 0) / 1000000
          );
        } else if (typeof date.toDate === "function") {
          parsedDate = date.toDate();
        } else {
          return "Invalid Date Format";
        }
      } else if (typeof date === "string" || typeof date === "number") {
        parsedDate = new Date(date);
      } else {
        return "Unknown Date Format";
      }

      if (!parsedDate || isNaN(parsedDate.getTime())) {
        return "Invalid Date";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(parsedDate);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date Error";
    }
  };

  const formatRentalDate = (dateValue) => {
    if (!dateValue) return "N/A";

    try {
      let dateToFormat;

      if (typeof dateValue === "object" && dateValue !== null) {
        if (dateValue.seconds !== undefined) {
          dateToFormat = new Date(dateValue.seconds * 1000);
        } else if (typeof dateValue.toDate === "function") {
          dateToFormat = dateValue.toDate();
        } else {
          dateToFormat = dateValue;
        }
      } else {
        dateToFormat = dateValue;
      }

      if (
        typeof dateToFormat === "string" &&
        (dateToFormat.includes("/") ||
          dateToFormat.includes("-") ||
          dateToFormat.match(/^\w+\s+\d{1,2},\s+\d{4}$/))
      ) {
        return dateToFormat;
      }

      const parsedDate = new Date(dateToFormat);

      if (isNaN(parsedDate.getTime())) {
        return String(dateToFormat);
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(parsedDate);
    } catch (error) {
      console.error("Error formatting rental date:", error);
      return String(dateValue);
    }
  };

  const safeRender = (value, fallback = "N/A") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") {
      if (value.seconds !== undefined || typeof value.toDate === "function") {
        return safeFormatDate(value);
      }
      try {
        return JSON.stringify(value);
      } catch {
        return "[Object]";
      }
    }
    return String(value);
  };

  // Image Modal Component
  const ImageModal = ({ imageUrl, isOpen, onClose }) => {
    if (!isOpen || !imageUrl) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative max-w-4xl max-h-[90vh] p-4">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={imageUrl}
            alt="Item or ID Verification"
            className="max-w-full max-h-full object-contain rounded-lg"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          <div className="hidden text-white text-center p-8 bg-gray-800 rounded-lg">
            <FileImage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Image could not be loaded</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-7xl bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl border border-gray-700/50 transform transition-all duration-300 scale-100 animate-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-gray-400">
                    #{safeRender(order.id?.slice(-8), "Unknown")}
                  </p>
                  <button
                    onClick={() => copyToClipboard(order.id)}
                    className="p-1 text-gray-400 hover:text-white transition-colors rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {showCopied && (
                    <span className="text-green-400 text-sm animate-fade-in">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Order Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Order Status */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-300">
                        Order Status
                      </h3>
                      <button
                        onClick={() =>
                          setIsEditing({
                            ...isEditing,
                            status: !isEditing.status,
                          })
                        }
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {isEditing.status ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={tempValues.status}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues,
                              status: e.target.value,
                            })
                          }
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleUpdateStatus("status")}
                          disabled={isUpdating.status}
                          className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {isUpdating.status ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      getStatusBadge(order.status)
                    )}
                  </div>

                  {/* Payment Status */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-300">
                        Payment
                      </h3>
                      <button
                        onClick={() =>
                          setIsEditing({
                            ...isEditing,
                            payment: !isEditing.payment,
                          })
                        }
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {isEditing.payment ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={tempValues.paymentStatus}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues,
                              paymentStatus: e.target.value,
                            })
                          }
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                        <button
                          onClick={() => handleUpdateStatus("payment")}
                          disabled={isUpdating.payment}
                          className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {isUpdating.payment ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      getPaymentStatusBadge(order.paymentStatus)
                    )}
                  </div>

                  {/* Return Status */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-300">
                        Return
                      </h3>
                      <button
                        onClick={() =>
                          setIsEditing({
                            ...isEditing,
                            returned: !isEditing.returned,
                          })
                        }
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {isEditing.returned ? (
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2 text-sm text-white">
                          <input
                            type="checkbox"
                            checked={tempValues.itemReturned}
                            onChange={(e) =>
                              setTempValues({
                                ...tempValues,
                                itemReturned: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span>Returned</span>
                        </label>
                        <button
                          onClick={() => handleUpdateStatus("returned")}
                          disabled={isUpdating.returned}
                          className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {isUpdating.returned ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      getReturnStatusBadge(
                        order.itemReturned,
                        isReturnOverdue()
                      )
                    )}
                  </div>

                  {/* Physical ID Status */}
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-300">
                        Physical ID
                      </h3>
                      <button
                        onClick={() =>
                          setIsEditing({
                            ...isEditing,
                            physicalId: !isEditing.physicalId,
                          })
                        }
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {isEditing.physicalId ? (
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2 text-sm text-white">
                          <input
                            type="checkbox"
                            checked={tempValues.physicalIdShown}
                            onChange={(e) =>
                              handlePhysicalIdToggle(e.target.checked)
                            }
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span>ID Shown</span>
                        </label>
                        <button
                          onClick={handleUpdatePhysicalId}
                          disabled={isUpdating.physicalId}
                          className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {isUpdating.physicalId ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          order.physicalIdShown
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {order.physicalIdShown ? (
                          <>
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            ID Shown
                          </>
                        ) : (
                          <>
                            <ShieldX className="w-3 h-3 mr-1" />
                            Not Shown
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Penalty Alert */}
                {calculatePenalty() > 0 && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="text-red-400 font-semibold">
                        Overdue Return
                      </h3>
                    </div>
                    <p className="text-red-300 text-sm mb-2">
                      This item was not returned on time. A fixed penalty has
                      been applied.
                    </p>
                    <p className="text-red-400 font-medium">
                      Late Return Penalty: {formatCurrency(calculatePenalty())}
                    </p>
                  </div>
                )}

                {/* Rental Items Section */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-green-400" />
                    Rental Items (
                    {(order.items || order.rentalItems || []).length})
                  </h3>
                  {renderRentalItems()}
                </div>

                {/* Customer Information */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">
                          Full Name
                        </label>
                        <p className="text-white font-medium">
                          {safeRender(order.customerInfo?.firstName)}{" "}
                          {safeRender(order.customerInfo?.lastName)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-white">
                            {safeRender(order.customerInfo?.email)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Phone</label>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-white">
                            {safeRender(order.customerInfo?.phone)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Address</label>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-white">
                            {order.customerInfo?.address
                              ? `${safeRender(
                                  order.customerInfo.address
                                )}, ${safeRender(order.customerInfo.city)}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rental Details */}
                {order.rentalDetails && (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-green-400" />
                      Rental Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">
                          Start Date
                        </label>
                        <p className="text-white">
                          {formatRentalDate(order.rentalDetails.startDate)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">
                          End Date
                        </label>
                        <p className="text-white">
                          {formatRentalDate(order.rentalDetails.endDate)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">
                          Pickup Time
                        </label>
                        <p className="text-white">
                          {safeRender(
                            order.rentalDetails.pickupTime,
                            "9:00 AM"
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">
                          Return Time
                        </label>
                        <p className="text-white">
                          {safeRender(
                            order.rentalDetails.returnTime,
                            "5:00 PM"
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">
                          Duration
                        </label>
                        <p className="text-white">
                          {safeRender(
                            order.rentalDetails.duration ||
                              order.rentalDetails.rentalDays
                          )}{" "}
                          days
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">
                          Delivery Method
                        </label>
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <p className="text-white capitalize">
                            {safeRender(order.rentalDetails.deliveryMethod)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Return Information */}
                    {order.itemReturned && order.returnedAt && (
                      <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium">
                            Item Returned
                          </span>
                        </div>
                        <p className="text-green-300 text-sm mt-1">
                          Returned on: {formatDate(order.returnedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Payment, ID Images & Summary */}
              <div className="lg:col-span-1 space-y-6">
                {/* Enhanced ID Verification Section */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-400" />
                    ID Verification
                  </h3>

                  {order.idSubmitted ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">
                          ID Verification Submitted
                        </span>
                      </div>

                      {/* Physical Verification Status */}
                      <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm font-medium">
                            Physical Verification:
                          </span>
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              order.physicalIdShown
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {order.physicalIdShown ? "Verified" : "Pending"}
                          </span>
                        </div>
                        {order.physicalIdShownAt && (
                          <p className="text-gray-400 text-xs mt-1">
                            Verified: {formatDate(order.physicalIdShownAt)}
                          </p>
                        )}
                      </div>

                      {/* Display ID images if available */}
                      {order.idImages && order.idImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {order.idImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`ID Verification ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-600 cursor-pointer hover:border-purple-400 transition-colors"
                                onClick={() => openImage(imageUrl)}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              <div className="hidden w-full h-32 bg-gray-700 rounded-lg border border-gray-600 flex-col items-center justify-center">
                                <FileImage className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-gray-400 text-xs">
                                  Failed to load
                                </span>
                              </div>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-orange-400">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">
                            ID submitted but images not accessible
                          </span>
                        </div>
                      )}

                      {/* Google Form link if needed */}
                      <div className="text-xs text-gray-400">
                        <a
                          href="https://forms.gle/na7LxwpUkZznek7i8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View submission form</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">
                        ID Verification Required
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Method</label>
                      <p className="text-white capitalize">
                        {safeRender(order.paymentInfo?.method)}
                      </p>
                    </div>
                    {order.paymentInfo?.reference && (
                      <div>
                        <label className="text-sm text-gray-400">
                          Reference
                        </label>
                        <p className="text-white font-mono text-sm">
                          {safeRender(order.paymentInfo.reference)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Order Summary with Fixed Penalty */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    {order.pricing?.subtotal !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">
                          {formatCurrency(order.pricing.subtotal)}
                        </span>
                      </div>
                    )}
                    {order.pricing?.deliveryFee !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delivery Fee</span>
                        <span className="text-white">
                          {formatCurrency(order.pricing.deliveryFee)}
                        </span>
                      </div>
                    )}
                    {order.pricing?.tax !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tax</span>
                        <span className="text-white">
                          {formatCurrency(order.pricing.tax)}
                        </span>
                      </div>
                    )}

                    {/* Show fixed penalty if applicable */}
                    {calculatePenalty() > 0 && (
                      <div className="flex justify-between text-red-400 bg-red-900/20 px-3 py-2 rounded-lg border border-red-500/30">
                        <span className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Late Return Penalty
                        </span>
                        <span className="font-medium">
                          {formatCurrency(calculatePenalty())}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-white">
                          Total
                        </span>
                        <span className="text-xl font-bold text-green-400">
                          {formatCurrency(
                            (order.pricing?.total || 0) + calculatePenalty()
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-400" />
                    Timeline
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created</span>
                      <span className="text-white">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-white">
                        {formatDate(order.updatedAt)}
                      </span>
                    </div>
                    {order.returnedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Returned</span>
                        <span className="text-green-400">
                          {formatDate(order.returnedAt)}
                        </span>
                      </div>
                    )}
                    {order.physicalIdShownAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          ID Physically Verified
                        </span>
                        <span className="text-green-400">
                          {formatDate(order.physicalIdShownAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/50">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage}
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setSelectedImage(null);
        }}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .animate-in {
          animation: modalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-in-out;
        }
        @keyframes modalIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailsModal;
