import React, { useState } from 'react';
import { Shield, CreditCard } from 'lucide-react';

const IDVerification = ({ data, onChange }) => {
  const [preview, setPreview] = useState(data.idDocument);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange('idDocument', file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        ID Verification
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ID Type *
          </label>
          <select
            value={data.idType}
            onChange={(e) => onChange('idType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
          >
            <option value="">Select ID type</option>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver's License</option>
            <option value="national_id">National ID Card</option>
            <option value="state_id">State ID Card</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ID Number *
          </label>
          <input
            type="text"
            value={data.idNumber}
            onChange={(e) => onChange('idNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
            placeholder="Enter your ID number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload ID Document *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-blue-400 transition-colors bg-gray-800/50 backdrop-blur-sm">
            <div className="space-y-1 text-center">
              {preview ? (
                <div className="mb-4">
                  <img src={preview} alt="ID Preview" className="mx-auto h-32 w-auto rounded-md" />
                </div>
              ) : (
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-300 justify-center space-x-1">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>{preview ? 'Change document' : 'Upload a file'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="text-gray-400">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDVerification;