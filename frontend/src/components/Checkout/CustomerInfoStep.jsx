import React from "react";
import { User } from "lucide-react";

const CustomerInfoStep = ({ formData, errors, onInputChange }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <User className="text-white" size={20} />
        </div>
        <h2 className="text-3xl font-bold text-white">
          Customer Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
              errors.firstName ? 'border-red-500' : 'border-gray-600'
            }`}
            required
          />
          {errors.firstName && (
            <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
              errors.lastName ? 'border-red-500' : 'border-gray-600'
            }`}
            required
          />
          {errors.lastName && (
            <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
              errors.email ? 'border-red-500' : 'border-gray-600'
            }`}
            required
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
              errors.phone ? 'border-red-500' : 'border-gray-600'
            }`}
            required
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {formData.deliveryMethod === "delivery" && (
        <div className="space-y-6 border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold text-white">
            Delivery Address
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Street Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={onInputChange}
              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                errors.address ? 'border-red-500' : 'border-gray-600'
              }`}
              required
            />
            {errors.address && (
              <p className="text-red-400 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Apartment, Suite, etc. (optional)
            </label>
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={onInputChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={onInputChange}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  errors.city ? 'border-red-500' : 'border-gray-600'
                }`}
                required
              />
              {errors.city && (
                <p className="text-red-400 text-sm mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Province <span className="text-red-400">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={onInputChange}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  errors.state ? 'border-red-500' : 'border-gray-600'
                }`}
                required
              >
                <option value="">Select Province</option>
                <option value="Metro Manila">Metro Manila</option>
                <option value="Cebu">Cebu</option>
                <option value="Davao">Davao</option>
                <option value="Laguna">Laguna</option>
                <option value="Cavite">Cavite</option>
                <option value="Rizal">Rizal</option>
              </select>
              {errors.state && (
                <p className="text-red-400 text-sm mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ZIP Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={onInputChange}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-600'
                }`}
                required
              />
              {errors.zipCode && (
                <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInfoStep;