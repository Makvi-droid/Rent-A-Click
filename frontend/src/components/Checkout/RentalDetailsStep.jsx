import React from "react";
import { Calendar, Clock, MapPin, Truck } from "lucide-react";
import DatePickerInput from "./DatePickerInput";

const RentalDetailsStep = ({ 
  formData, 
  errors, 
  rentalDays, 
  formatCurrency, 
  subtotal, 
  onDateChange, 
  onInputChange, 
  getTodayDate 
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
            <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
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
            <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      {rentalDays > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Clock className="text-purple-400" size={20} />
            <span className="text-white font-medium">
              Rental Duration: {rentalDays}{" "}
              {rentalDays === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      )}

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

export default RentalDetailsStep;