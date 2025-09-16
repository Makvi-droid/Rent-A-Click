import React from "react";
import { Check, DollarSign } from "lucide-react";

const ReviewStep = ({ formData, errors, rentalDays, onInputChange }) => {
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
        {/* Rental Summary */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Rental Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Start Date:</span>
              <span className="text-white">
                {formData.startDate ? formData.startDate.toLocaleDateString() : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">End Date:</span>
              <span className="text-white">
                {formData.endDate ? formData.endDate.toLocaleDateString() : "Not selected"}
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
          </div>
        </div>

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
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="newsletter"
              checked={formData.newsletter}
              onChange={onInputChange}
              className="text-purple-600 focus:ring-purple-500 rounded"
            />
            <span className="text-white text-sm">
              Subscribe to our newsletter for equipment updates and
              exclusive offers
            </span>
          </label>

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

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-200 text-sm">
              Equipment must be returned in the same condition as received. 
              Late returns may incur additional fees. Insurance is recommended for high-value equipment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;