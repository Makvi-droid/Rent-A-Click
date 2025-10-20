import React from 'react';
import { MapPin } from 'lucide-react';

const Address = ({ data, onChange }) => {
  return (
    <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
          <MapPin className="w-5 h-5 text-blue-400" />
        </div>
        Address Information
      </h3>

      <div className="space-y-6">
        {/* Street Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            value={data.streetAddress}
            onChange={(e) => onChange('streetAddress', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your Street Address"
          />
        </div>

        {/* Barangay */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Barangay *
          </label>
          <input
            type="text"
            value={data.barangay}
            onChange={(e) => onChange('barangay', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your Barangay"
          />
        </div>

        {/* City, State, Zip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange('city', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your City"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              State/Province *
            </label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => onChange('state', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your Province"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ZIP/Postal Code *
            </label>
            <input
              type="text"
              value={data.zipCode}
              onChange={(e) => onChange('zipCode', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0000"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
