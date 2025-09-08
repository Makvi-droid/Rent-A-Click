import React from 'react';

import { Camera, Shield, Lock, Key } from 'lucide-react';

export default function ImageSection() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="relative z-10 text-center max-w-lg">
        {/* Main authentication visual */}
        <div className="mb-8">
          <div className="relative mb-6">
            {/* Main camera icon */}
            <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center shadow-2xl">
              <Camera className="w-14 h-14 text-white" />
            </div>
            {/* Security badge overlay */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center border-4 border-slate-900">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Admin Access
          </h2>
          <p className="text-slate-300 text-lg mb-2">
            Secure portal for camera rental management
          </p>
          <p className="text-slate-400 text-sm">
            Protected environment for administrative operations
          </p>
        </div>

        {/* Security features */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium text-sm">Encrypted Authentication</h3>
              <p className="text-slate-400 text-xs">Multi-layer security protection</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium text-sm">Role-Based Access</h3>
              <p className="text-slate-400 text-xs">Authorized personnel only</p>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-slate-400">System Online & Secured</span>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-2/3 left-1/6 w-1 h-1 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}