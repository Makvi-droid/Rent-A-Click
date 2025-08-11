import React, { useState, useEffect } from 'react';
import { Camera, Play, Star, Shield, Clock, Zap, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';

function Footer(){

    return (
    <footer className="bg-black py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Camera className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Rent-a-Click
            </span>
          </div>
          <p className="text-gray-400 mb-8">
            Professional camera equipment rental made simple.
          </p>
          <div className="flex justify-center space-x-8 mb-8">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Support</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</a>
          </div>
          <p className="text-gray-600">
            © 2025 Rent-a-Click. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );


}

export default Footer