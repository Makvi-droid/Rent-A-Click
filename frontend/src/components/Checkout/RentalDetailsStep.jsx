// Updated RentalDetailsStep.jsx - Now with mandatory ID verification for all rentals
import React from "react";
import { Calendar, Clock, MapPin, Truck, AlertCircle } from "lucide-react";
import DatePickerInput from "./DatePickerInput";
import MandatoryIDVerification from "./MandatoryIDVerification";

const RentalDetailsStep = ({ 
  formData, 
  errors, 
  rentalDays, 
  formatCurrency, 
  subtotal, 
  onDateChange, 
  onInputChange, 
  getTodayDate,
  // Updated: No longer camera-specific, mandatory for all rentals
  onGoogleFormSubmission
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <Calendar className="text-white" size={20} />
        </div>
        <h2 className="text-3xl font-bold text-white">
          Rental Details
        </h2>
      </div>

      {/* MANDATORY ID VERIFICATION SECTION - Now for all rentals */}
      <MandatoryIDVerification
        formData={formData}
        errors={errors}
        onGoogleFormSubmission={onGoogleFormSubmission}
      />

      {/* RENTAL DATES SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DatePickerInput
            value={formData.startDate}
            onChange={(date) => onDateChange("startDate", date)}
            label="Start Date"
            placeholder="Select start date"
            minDate={getTodayDate()}
            required
          />
          {errors.startDate && (
            <div className="flex items-center space-x-2 mt-2">
              <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
              <p className="text-red-400 text-sm">{errors.startDate}</p>
            </div>
          )}
        </div>
        <div>
          <DatePickerInput
            value={formData.endDate}
            onChange={(date) => onDateChange("endDate", date)}
            label="End Date"
            placeholder="Select end date"
            minDate={formData.startDate || getTodayDate()}
            required
          />
          {errors.endDate && (
            <div className="flex items-center space-x-2 mt-2">
              <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
              <p className="text-red-400 text-sm">{errors.endDate}</p>
            </div>
          )}
        </div>
      </div>

      {/* TIME SELECTION SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pickup Time <span className="text-red-400">*</span>
          </label>
          <select
            name="pickupTime"
            value={formData.pickupTime}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
              errors.pickupTime ? 'border-red-500' : 'border-gray-600'
            }`}
            required
          >
            <option value="">Select pickup time</option>
            <option value="08:00">8:00 AM</option>
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
          </select>
          {errors.pickupTime && (
            <div className="flex items-center space-x-2 mt-2">
              <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
              <p className="text-red-400 text-sm">{errors.pickupTime}</p>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Return Time <span className="text-red-400">*</span>
          </label>
          <select
            name="returnTime"
            value={formData.returnTime}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
              errors.returnTime ? 'border-red-500' : 'border-gray-600'
            }`}
            required
          >
            <option value="">Select return time</option>
            <option value="08:00">8:00 AM</option>
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
          </select>
          {errors.returnTime && (
            <div className="flex items-center space-x-2 mt-2">
              <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
              <p className="text-red-400 text-sm">{errors.returnTime}</p>
            </div>
          )}
        </div>
      </div>

      {/* RENTAL DURATION DISPLAY */}
      {rentalDays > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Clock className="text-purple-400" size={20} />
            <span className="text-white font-medium">
              Rental Duration: {rentalDays}{" "}
              {rentalDays === 1 ? "day" : "days"}
            </span>
            {formData.pickupTime && formData.returnTime && (
              <span className="text-gray-300 text-sm">
                ({formatTime(formData.pickupTime)} - {formatTime(formData.returnTime)})
              </span>
            )}
          </div>
        </div>
      )}

      {/* DELIVERY METHOD SECTION */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">
          Delivery Method
        </h3>
        <div className="space-y-3">
          <label className="flex items-center p-4 bg-gray-800/30 border border-gray-600 rounded-xl cursor-pointer hover:border-purple-500/50 transition-all duration-300">
            <input
              type="radio"
              name="deliveryMethod"
              value="pickup"
              checked={formData.deliveryMethod === "pickup"}
              onChange={onInputChange}
              className="mr-4 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex items-center flex-1">
              <MapPin className="text-purple-400 mr-3" size={20} />
              <div>
                <span className="text-white font-medium">
                  Store Pickup
                </span>
                <p className="text-gray-400 text-sm">
                  Pick up from our location - FREE
                </p>
              </div>
            </div>
          </label>
          <label className="flex items-center p-4 bg-gray-800/30 border border-gray-600 rounded-xl cursor-pointer hover:border-purple-500/50 transition-all duration-300">
            <input
              type="radio"
              name="deliveryMethod"
              value="delivery"
              checked={formData.deliveryMethod === "delivery"}
              onChange={onInputChange}
              className="mr-4 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex items-center flex-1">
              <Truck className="text-purple-400 mr-3" size={20} />
              <div>
                <span className="text-white font-medium">
                  Home Delivery
                </span>
                <p className="text-gray-400 text-sm">
                  {subtotal >= 5000 ? (
                    <span className="text-green-400">FREE for orders ₱5,000+</span>
                  ) : (
                    `10% of order total - ${formatCurrency(subtotal * 0.10)}`
                  )}
                </p>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time for display
const formatTime = (time24) => {
  if (!time24) return '';
  try {
    const [hour, minute] = time24.split(':');
    const hour12 = parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);
    const ampm = parseInt(hour) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute} ${ampm}`;
  } catch (error) {
    return time24;
  }
};

export default RentalDetailsStep;