import React from 'react';
import { Shield, Camera, Zap } from 'lucide-react';
import signUpPic from '../../assets/signUp.svg';

const ImageSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-8 flex flex-col justify-center items-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center">
        {/* Image Container */}
        <div className="w-48 h-48 mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center backdrop-blur-sm">
            <img 
              src={signUpPic} 
              alt="Camera Equipment" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          RENT-N-CLICK
        </h1>
        <p className="text-xl text-purple-100 mb-8 max-w-md">
          Professional camera equipment rental for creators and professionals
        </p>

        {/* Features */}
        <div className="space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-green-300" />
            <span className="text-purple-100">Secure & Trusted Platform</span>
          </div>
          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-blue-300" />
            <span className="text-purple-100">Premium Equipment</span>
          </div>
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-purple-100">Lightning Fast Delivery</span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-20 h-20 border-2 border-white/20 rounded-full animate-spin-slow"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 border-2 border-white/20 rounded-lg rotate-45 animate-pulse"></div>
    </div>
  );
};

export default ImageSection