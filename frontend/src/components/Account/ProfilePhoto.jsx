import React, { useState } from 'react';
import { Camera, User } from 'lucide-react';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoChange }) => {
  const [preview, setPreview] = useState(currentPhoto);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onPhotoChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
          <User className="w-5 h-5 text-blue-400" />
        </div>
        Profile Photo
      </h3>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <p className="text-sm text-gray-300 mb-2">Upload a clear photo of yourself</p>
          <p className="text-xs text-gray-400">JPG, PNG or GIF (max 5MB)</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;