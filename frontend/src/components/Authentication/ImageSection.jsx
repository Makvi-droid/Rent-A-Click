import React from 'react';
import { Shield, Users, Zap, Star } from 'lucide-react';

export default function ImageSection() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative overflow-hidden">
      <div className="relative z-10 text-center">
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Secure Authentication
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of users who trust our secure platform for their daily needs.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Community Driven</h3>
              <p className="text-gray-400 text-sm">Connect with like-minded individuals</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Optimized for speed and performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Premium Experience</h3>
              <p className="text-gray-400 text-sm">Carefully crafted user experience</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-1000"></div>
    </div>
  );
}