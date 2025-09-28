// components/MyRentals/MyRentalsList.jsx - UPDATED WITH WriteReviewButton
import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Truck,
  Shield,
  Users,
  XCircle,
} from "lucide-react";

const MyRentalsList = ({
  rentals,
  formatCurrency,
  isVisible,
  WriteReviewButton,
  onWriteReview,
  createCustomerFromRental,
}) => {
  const [expandedRentals, setExpandedRentals] = useState(new Set());

  const toggleExpanded = (rentalId) => {
    const newExpanded = new Set(expandedRentals);
    if (newExpanded.has(rentalId)) {
      newExpanded.delete(rentalId);
    } else {
      newExpanded.add(rentalId);
    }
    setExpandedRentals(newExpanded);
  };

  // FIXED: Use the same logic as MyRentals.jsx main component
  const getStatusInfo = (rental) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const startDate = rental.startDate;
    const endDate = rental.endDate;

    // Handle cancelled status
    if (rental.status === "cancelled") {
      return {
        status: "cancelled",
        label: "Cancelled",
        icon: XCircle,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
      };
    }

    // Handle pending status
    if (rental.status === "pending") {
      return {
        status: "pending",
        label: "Pending",
        icon: AlertCircle,
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
        borderColor: "border-orange-500/30",
      };
    }

    // Handle completed status - ONLY admin-marked completed
    if (rental.status === "completed") {
      return {
        status: "completed",
        label: "Completed",
        icon: CheckCircle,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
      };
    }

    // Handle confirmed status with date logic
    if (rental.status === "confirmed" && startDate && endDate) {
      const startDateOnly = new Date(startDate);
      const endDateOnly = new Date(endDate);
      startDateOnly.setHours(0, 0, 0, 0);
      endDateOnly.setHours(23, 59, 59, 999);

      // Active: confirmed AND within rental period
      if (currentDate >= startDateOnly && currentDate <= endDateOnly) {
        return {
          status: "active",
          label: "Active",
          icon: Clock,
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          borderColor: "border-green-500/30",
        };
      }

      // Upcoming: confirmed AND start date is in future
      if (currentDate < startDateOnly) {
        return {
          status: "upcoming",
          label: "Upcoming",
          icon: Calendar,
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20",
          borderColor: "border-yellow-500/30",
        };
      }

      // Past end date but confirmed (should be completed)
      if (currentDate > endDateOnly) {
        return {
          status: "completed",
          label: "Completed",
          icon: CheckCircle,
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          borderColor: "border-blue-500/30",
        };
      }
    }

    // Fallback to confirmed if status is confirmed but no proper dates
    if (rental.status === "confirmed") {
      return {
        status: "confirmed",
        label: "Confirmed",
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
      };
    }

    // Final fallback
    return {
      status: "pending",
      label: "Pending",
      icon: AlertCircle,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
    };
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (rentals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-md mx-auto">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No rentals found
          </h3>
          <p className="text-gray-400">
            Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: "800ms" }}
    >
      {rentals.map((rental, index) => {
        const statusInfo = getStatusInfo(rental);
        const StatusIcon = statusInfo.icon;
        const isExpanded = expandedRentals.has(rental.id);
        const remainingDays = getRemainingDays(rental.endDate);

        return (
          <div
            key={rental.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 group"
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {/* Main Rental Info */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left Side - Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Status Badge */}
                    <div
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.color} border`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusInfo.label}</span>
                    </div>

                    {/* Order ID */}
                    <div className="text-sm text-gray-400">
                      Order{" "}
                      <span className="text-white font-mono">{rental.id}</span>
                    </div>

                    {/* Remaining Days for Active Rentals */}
                    {statusInfo.status === "active" &&
                      remainingDays !== null &&
                      remainingDays > 0 && (
                        <div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-1 rounded text-xs">
                          {remainingDays} day{remainingDays > 1 ? "s" : ""} left
                        </div>
                      )}

                    {/* Item Return Status for Active/Completed */}
                    {(statusInfo.status === "active" ||
                      statusInfo.status === "completed") && (
                      <div
                        className={`px-2 py-1 rounded text-xs ${
                          rental.itemReturned
                            ? "bg-green-500/20 border border-green-500/30 text-green-400"
                            : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                        }`}
                      >
                        {rental.itemReturned
                          ? "Item Returned"
                          : "Item Pending Return"}
                      </div>
                    )}
                  </div>

                  {/* Customer Info */}
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {rental.customerInfo?.fullName || "Rental Order"}
                  </h3>

                  {/* Rental Dates */}
                  <div className="flex items-center text-sm text-gray-300 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {formatDate(rental.startDate)} →{" "}
                      {formatDate(rental.endDate)}
                    </span>
                    {rental.rentalDetails?.rentalDays && (
                      <span className="ml-2 text-gray-400">
                        ({rental.rentalDetails.rentalDays} day
                        {rental.rentalDetails.rentalDays > 1 ? "s" : ""})
                      </span>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center text-sm text-gray-400">
                    <Package className="w-4 h-4 mr-2" />
                    <span>
                      {rental.items?.length || 0} item
                      {(rental.items?.length || 0) !== 1 ? "s" : ""}
                      {rental.items && rental.items.length > 0 && (
                        <span className="ml-1">
                          • {rental.items[0].name}
                          {rental.items.length > 1 &&
                            ` +${rental.items.length - 1} more`}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right Side - Amount and Actions */}
                <div className="flex flex-col lg:items-end gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white mb-1">
                      {formatCurrency(rental.pricing?.total || 0)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {rental.paymentInfo?.method === "paypal"
                        ? "Paid via PayPal"
                        : "Cash Payment"}
                    </div>
                    <div
                      className={`text-sm ${
                        rental.paymentStatus === "paid"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      Payment:{" "}
                      {rental.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </div>
                  </div>

                  {/* Action Buttons Container */}
                  <div className="flex flex-col gap-2">
                    {/* Write Review Button - Only for admin-completed rentals */}
                    {WriteReviewButton && rental.status === "completed" && (
                      <WriteReviewButton
                        rental={rental}
                        customer={createCustomerFromRental(rental)}
                        onWriteReview={onWriteReview}
                      />
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => toggleExpanded(rental.id)}
                      className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>
                        {isExpanded ? "Hide Details" : "View Details"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-white/10 bg-white/5">
                <div className="p-6 space-y-6">
                  {/* Status and Return Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Status */}
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Order Status
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className={`${statusInfo.color} font-medium`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Payment:</span>
                          <span
                            className={`${
                              rental.paymentStatus === "paid"
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {rental.paymentStatus === "paid"
                              ? "Paid"
                              : "Pending"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Item Status:</span>
                          <span
                            className={`${
                              rental.itemReturned
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {rental.itemReturned ? "Returned" : "Not Returned"}
                          </span>
                        </div>
                        {rental.returnedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Returned At:</span>
                            <span className="text-white">
                              {new Date(rental.returnedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center">
                        <Truck className="w-4 h-4 mr-2" />
                        Delivery Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Method:</span>
                          <span className="text-white capitalize">
                            {rental.rentalDetails?.deliveryMethod || "Pickup"}
                          </span>
                        </div>
                        {rental.deliveryAddress && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Address:</span>
                            <span className="text-white text-right max-w-xs">
                              {rental.deliveryAddress.fullAddress}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Method:</span>
                          <span className="text-white capitalize">
                            {rental.paymentInfo?.method === "paypal"
                              ? "PayPal"
                              : "Cash"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span
                            className={`${
                              rental.paymentStatus === "paid"
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {rental.paymentStatus === "paid"
                              ? "Paid"
                              : "Pending"}
                          </span>
                        </div>
                      </div>
                      {rental.paymentInfo?.paypal?.paymentId && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Transaction:</span>
                            <span className="text-white font-mono text-xs">
                              {rental.paymentInfo.paypal.paymentId.slice(-8)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Rental Items ({rental.items?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rental.items?.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="bg-white/5 border border-white/10 rounded-lg p-4"
                        >
                          <div className="flex items-center space-x-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="text-white font-medium truncate">
                                {item.name}
                              </h5>
                              <div className="text-sm text-gray-400">
                                Qty: {item.quantity} •{" "}
                                {formatCurrency(item.dailyRate)}/day
                              </div>
                              <div className="text-sm font-medium text-blue-400">
                                Total: {formatCurrency(item.totalItemCost)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">
                      Pricing Breakdown
                    </h4>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Subtotal:</span>
                          <span className="text-white">
                            {formatCurrency(rental.pricing?.subtotal || 0)}
                          </span>
                        </div>
                        {rental.pricing?.deliveryFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Delivery Fee:</span>
                            <span className="text-white">
                              {formatCurrency(rental.pricing.deliveryFee)}
                            </span>
                          </div>
                        )}
                        {rental.pricing?.insuranceFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Insurance:</span>
                            <span className="text-white">
                              {formatCurrency(rental.pricing.insuranceFee)}
                            </span>
                          </div>
                        )}
                        {rental.pricing?.tax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tax (12%):</span>
                            <span className="text-white">
                              {formatCurrency(rental.pricing.tax)}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-white/10 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-white">Total:</span>
                            <span className="text-white">
                              {formatCurrency(rental.pricing?.total || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Options */}
                  {(rental.options?.insurance ||
                    rental.options?.specialInstructions) && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">
                        Additional Options
                      </h4>
                      <div className="space-y-2 text-sm">
                        {rental.options.insurance && (
                          <div className="flex items-center text-green-400">
                            <Shield className="w-4 h-4 mr-2" />
                            <span>Insurance Coverage Included</span>
                          </div>
                        )}
                        {rental.options.specialInstructions && (
                          <div>
                            <span className="text-gray-400">
                              Special Instructions:
                            </span>
                            <p className="text-white mt-1">
                              {rental.options.specialInstructions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Timeline */}
                  <div className="text-xs text-gray-500">
                    <div>
                      Order placed:{" "}
                      {new Date(rental.createdAt).toLocaleString()}
                    </div>
                    {rental.updatedAt &&
                      rental.updatedAt !== rental.createdAt && (
                        <div>
                          Last updated:{" "}
                          {new Date(rental.updatedAt).toLocaleString()}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MyRentalsList;
