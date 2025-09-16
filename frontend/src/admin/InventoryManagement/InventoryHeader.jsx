// components/InventoryHeader.jsx
import React from 'react';
import { Package } from 'lucide-react';

const InventoryHeader = ({ totalProducts, totalStock, lowStockItems, outOfStockItems }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
      <div className="relative px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Package className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Inventory
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent block">
                Management
              </span>
            </h1>
            <p className="text-xl text-white/80">
              Professional equipment tracking at your fingertips. Manage your rental inventory with ease.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{totalProducts}</div>
              <div className="text-white/70">Total Products</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{totalStock}</div>
              <div className="text-white/70">Total Stock</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{lowStockItems}</div>
              <div className="text-white/70">Low Stock</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">{outOfStockItems}</div>
              <div className="text-white/70">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader;