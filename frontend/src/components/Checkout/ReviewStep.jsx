import React from "react";
import { Check, DollarSign, Shield, AlertTriangle, Clock } from "lucide-react";

const ReviewStep = ({ 
  formData, 
  errors, 
  rentalDays, 
  onInputChange,
  // NEW: Additional props for camera rental verification
  hasCameraRental = false,
  rentalItems = [],
  formatCurrency
}) => {
  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Not selected";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  // Helper function to safely format times
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const date = new Date(`2000-01-01T${timeString}`);
      return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString; // Return original string if parsing fails
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <Check className="text-white" size={20} />
        </div>
        <h2 className="text-3xl font-bold text-white">
          Review Your Rental
        </h2>
      </div>

      <div className="grid gap-6">
        {/* Camera Rental ID Verification Status - PROMINENT DISPLAY */}
        {hasCameraRental && (
          <div className={`border rounded-xl p-6 ${
            formData.googleFormCompleted 
              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40'
              : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/40'
          }`}>
            <div className="flex items-start space-x-4">
              {formData.googleFormCompleted ? (
                <Shield className="text-green-400 mt-1" size={24} />
              ) : (
                <AlertTriangle className="text-red-400 mt-1" size={24} />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold text-lg mb-2 ${
                  formData.googleFormCompleted ? 'text-green-300' : 'text-red-300'
                }`}>
                  Camera Equipment ID Verification
                </h3>
                
                {formData.googleFormCompleted ? (
                  <div className="space-y-2">
                    <p className="text-green-200">
                      ✅ ID verification completed successfully
                    </p>
                    <p className="text-green-100 text-sm">
                      Your government-issued ID has been verified for camera equipment rental security.
                    </p>
                    {formData.idVerificationTimestamp && (
                      <p className="text-green-100/80 text-xs">
                        Completed: {new Date(formData.idVerificationTimestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-red-200">
                      ⚠️ ID verification required but not completed
                    </p>
                    <p className="text-red-100 text-sm">
                      Camera equipment rental requires valid ID verification. 
                      Please complete this before proceeding with your order.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.open('https://forms.gle/UWnmgsHZ1KKWzDLb6', '_blank')}
                      className="text-red-300 hover:text-red-200 underline text-sm font-medium"
                    >
                      Complete ID verification now →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Show validation error for ID verification if exists */}
        {errors.googleFormCompleted && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="text-red-400" size={20} />
              <p className="text-red-300 text-sm font-medium">
                {errors.googleFormCompleted}
              </p>
            </div>
          </div>
        )}

        {/* Rental Summary */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Rental Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Start Date:</span>
              <span className="text-white">
                {formatDate(formData.startDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">End Date:</span>
              <span className="text-white">
                {formatDate(formData.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration:</span>
              <span className="text-white">
                {rentalDays} {rentalDays === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Method:</span>
              <span className="text-white capitalize">
                {formData.deliveryMethod}
              </span>
            </div>

            {/* Time Information */}
            {formData.deliveryMethod === "pickup" && formData.pickupTime && (
              <div className="flex justify-between">
                <span className="text-gray-400">Pickup Time:</span>
                <span className="text-white">
                  {formatTime(formData.pickupTime)}
                </span>
              </div>
            )}
            
            {formData.returnTime && (
              <div className="flex justify-between">
                <span className="text-gray-400">Return Time:</span>
                <span className="text-white">
                  {formatTime(formData.returnTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Equipment Summary */}
        {rentalItems && rentalItems.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Equipment Summary
            </h3>
            <div className="space-y-3">
              {rentalItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-white font-medium">{item.name}</span>
                    {hasCameraRental && (item.name.toLowerCase().includes('camera') || 
                     item.category?.toLowerCase().includes('camera') ||
                     item.type?.toLowerCase().includes('camera')) && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Shield className="text-amber-400" size={12} />
                        <span className="text-amber-300 text-xs">ID Required</span>
                      </div>
                    )}
                    <p className="text-gray-400 text-sm">
                      Qty: {item.quantity || 1} × {rentalDays} days
                    </p>
                  </div>
                  {formatCurrency && (
                    <span className="text-white font-medium">
                      {formatCurrency((item.price || item.dailyRate || 0) * (item.quantity || 1) * rentalDays)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Customer Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-white">
                {formData.firstName} {formData.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phone:</span>
              <span className="text-white">{formData.phone}</span>
            </div>
            {formData.deliveryMethod === "delivery" && (
              <div className="pt-2 border-t border-gray-700">
                <span className="text-gray-400">
                  Delivery Address:
                </span>
                <p className="text-white text-sm mt-1">
                  {formData.address} {formData.apartment}
                  <br />
                  {formData.city}, {formData.state}{" "}
                  {formData.zipCode}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Payment Method
          </h3>
          <div className="flex items-center space-x-3">
            {formData.paymentMethod === "cash" ? (
              <>
                <DollarSign className="text-green-400" size={20} />
                <span className="text-white">
                  Cash Payment on{" "}
                  {formData.deliveryMethod === "pickup"
                    ? "Pickup"
                    : "Delivery"}
                </span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
                  PP
                </div>
                <span className="text-white">
                  PayPal ({formData.paypalEmail})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={onInputChange}
            placeholder="Any special delivery instructions or equipment preferences..."
            rows="3"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
          />
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={onInputChange}
              className="mt-1 text-purple-600 focus:ring-purple-500 rounded"
            />
            <div>
              <span className="text-white text-sm">
                I agree to the Terms of Service, Rental Agreement, and Privacy Policy
                <span className="text-red-400"> *</span>
              </span>
              {errors.termsAccepted && (
                <p className="text-red-400 text-sm mt-1">{errors.termsAccepted}</p>
              )}
            </div>
          </label>

          {/* Camera Rental Specific Terms */}
          {hasCameraRental && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="text-amber-400 mt-1" size={18} />
                <div>
                  <h4 className="text-amber-300 font-medium text-sm mb-2">
                    Camera Equipment Special Terms
                  </h4>
                  <ul className="text-amber-100 text-sm space-y-1">
                    <li>• ID verification is mandatory and has been {formData.googleFormCompleted ? 'completed' : 'required'}</li>
                    <li>• Camera equipment requires extra care and handling</li>
                    <li>• Any damage will be assessed based on replacement cost</li>
                    <li>• Equipment must be returned in original case/bag if provided</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* General Terms */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Clock className="text-green-400 mt-1" size={18} />
              <div>
                <h4 className="text-green-300 font-medium text-sm mb-2">
                  Important Rental Terms
                </h4>
                <p className="text-green-200 text-sm">
                  Equipment must be returned in the same condition as received. 
                  Late returns may incur additional fees. Insurance is recommended for high-value equipment.
                  {formData.returnTime && ` Return by ${formatTime(formData.returnTime)} on your end date.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;