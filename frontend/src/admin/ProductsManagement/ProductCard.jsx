import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { Edit, Trash2, Eye, EyeOff, Package, AlertCircle } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete, showStock = false, stockReadOnly = false }) => {
  const [updating, setUpdating] = useState(false);

  const [isApproved, setIsApproved] = useState(product.approved);

const toggleApproval = async () => {
  try {
    setUpdating(true);
    setIsApproved(!isApproved); // Optimistic update right away

    const productRef = doc(firestore, 'products', product.firestoreId);
    await updateDoc(productRef, {
      approved: !isApproved,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating approval status:', error);
    alert('Failed to update product status. Please try again.');
    setIsApproved(product.approved); // Rollback if failed
  } finally {
    setUpdating(false);
  }
};


  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'out of stock': return 'bg-red-500';
      case 'discontinued': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'Active';
      case 'out of stock': return 'Out of Stock';
      case 'discontinued': return 'Discontinued';
      default: return status || 'Unknown';
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-red-400', text: 'Out of Stock' };
    if (stock <= 5) return { color: 'text-yellow-400', text: 'Low Stock' };
    return { color: 'text-green-400', text: 'In Stock' };
  };

  const stockStatus = showStock ? getStockStatus(product.stock) : null;

  return (
    <div className="group bg-white/10 backdrop-blur-md rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 hover:border-white/40 overflow-hidden">
      
      {/* Product Image */}
      <div className="h-48 bg-gradient-to-br from-white/10 to-white/5 overflow-hidden relative">
        {product.imageUrl || product.image ? (
          <img 
            src={product.imageUrl || product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div className="flex items-center justify-center h-full" style={{ display: (product.imageUrl || product.image) ? 'none' : 'flex' }}>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2V9z" />
            </svg>
          </div>
        </div>

        {/* Approval Badge */}
        <div className="absolute top-2 right-2">
          <span className={`${product.approved ? 'bg-green-500' : 'bg-yellow-500'} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
            {product.approved ? '✓ Live' : '⏳ Hidden'}
          </span>
        </div>

        {/* Stock Alert Badge */}
        {showStock && product.stock === 0 && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>No Stock</span>
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {/* Brand and Status Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
            {product.brand || 'No Brand'}
          </span>
          <span className={`${getStatusColor(product.status)} text-white text-xs font-bold px-2 py-1 rounded shadow`}>
            {getStatusText(product.status)}
          </span>
        </div>
        
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 leading-tight">
          {product.name || 'Unnamed Product'}
        </h3>

        {/* Category and Subcategory */}
        <div className="text-sm text-white/60 mb-3">
          {product.category}
          {product.subCategory && ` → ${product.subCategory}`}
        </div>

        {/* Stock Information */}
        {showStock && (
          <div className="flex items-center justify-between mb-3 p-2 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/80">Stock:</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${stockStatus.color}`}>
                {product.stock} units
              </span>
              {stockReadOnly && (
                <span className="text-xs text-white/40">(Auto-sync)</span>
              )}
            </div>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-2xl font-bold text-white">
            ₱{product.price?.toLocaleString() || '0'}
          </span>
          <span className="text-sm text-white/60">/day</span>
        </div>

        {/* Inventory ID Reference */}
        {product.inventoryId && (
          <div className="mb-4 p-2 bg-white/5 rounded border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Inventory:</span>
              <span className="text-xs text-white/80 font-mono">{product.inventoryId}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          {/* Display Toggle Button */}
          <button
            onClick={toggleApproval}
            disabled={updating}
            className={`w-full flex items-center justify-center space-x-2 font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              product.approved 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } ${updating ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
          >
            {updating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {isApproved ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hide from Users</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Display to Users</span>
                  </>
                )}
              </>
            )}
          </button>

          {/* Edit and Delete Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              disabled={updating}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(product.firestoreId)}
              disabled={updating}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Product ID for reference */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">Product ID:</span>
            <span className="text-xs text-white/60 font-mono">{product.id}</span>
          </div>
          {product.firestoreId !== product.id && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-white/40">Doc ID:</span>
              <span className="text-xs text-white/40 font-mono">{product.firestoreId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;