import React from 'react';
import { ShoppingCart, Grid, List, Trash2, Check, Minus } from 'lucide-react';

const CartHeader = ({ 
  itemCount, 
  totalItems, 
  selectedCount = 0,
  viewMode, 
  setViewMode, 
  onClearCart, 
  onRemoveSelected,
  onSelectAll,
  isAllSelected = false,
  isPartiallySelected = false
}) => {
  
  const handleSelectAllChange = () => {
    onSelectAll(!isAllSelected);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex flex-col gap-4">
        {/* Title and Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Shopping Cart</h1>
              <p className="text-gray-300">
                {itemCount === 0 ? (
                  'Your cart is empty'
                ) : (
                  <>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} • {totalItems} total {totalItems === 1 ? 'piece' : 'pieces'}
                    {selectedCount > 0 && (
                      <span className="text-purple-300"> • {selectedCount} selected</span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          {itemCount > 0 && (
            <div className="flex items-center bg-white/20 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Selection and Action Controls */}
        {itemCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
            {/* Select All Checkbox */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAllChange}
                className={`relative w-6 h-6 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                  isAllSelected
                    ? 'bg-purple-600 border-purple-600'
                    : isPartiallySelected
                    ? 'bg-purple-600/50 border-purple-600'
                    : 'border-white/30 hover:border-purple-400'
                }`}
              >
                {isAllSelected && <Check className="w-4 h-4 text-white" />}
                {isPartiallySelected && !isAllSelected && <Minus className="w-4 h-4 text-white" />}
              </button>
              <label 
                onClick={handleSelectAllChange}
                className="text-white cursor-pointer select-none"
              >
                {isAllSelected ? 'Deselect All' : 'Select All'}
                <span className="text-gray-300 ml-1">
                  ({selectedCount}/{itemCount})
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Remove Selected Button */}
              {selectedCount > 0 && (
                <button
                  onClick={onRemoveSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-500/30 hover:text-red-200 transition-all duration-300"
                  title={`Remove ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Remove ({selectedCount})
                  </span>
                  <span className="sm:hidden">Remove</span>
                </button>
              )}

              {/* Clear Cart Button */}
              <button
                onClick={onClearCart}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-500/30 hover:text-red-200 transition-all duration-300"
                title="Clear entire cart"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartHeader;