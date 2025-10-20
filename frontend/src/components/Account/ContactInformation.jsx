import React from 'react';
import { Phone } from 'lucide-react';

const ContactInformation = ({ data, onChange }) => {
  return (
    <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
          <Phone className="w-5 h-5 text-blue-400" />
        </div>
        Contact Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Primary Phone Number *
          </label>
          <input
            type="tel"
            value={data.primaryPhone}
            onChange={(e) => onChange('primaryPhone', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(+63) 000 000 0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Alternative Phone Number
          </label>
          <input
            type="tel"
            value={data.alternativePhone}
            onChange={(e) => onChange('alternativePhone', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(+63) 000 000 0000"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;