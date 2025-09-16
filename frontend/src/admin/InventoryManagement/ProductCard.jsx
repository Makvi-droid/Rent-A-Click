// components/ProductCard.jsx
import React from 'react';
import { Plus, Minus, Edit2, Trash2, AlertCircle, Tag } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete, onUpdateStock, loading }) => {
  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-400 bg-red-500/20';
    if (stock <= 3) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 3) return 'Low Stock';
    return 'In Stock';
  };

  const getCategoryDisplayName = (category) => {
    const categories = {
      'digital-cameras': 'Digital Cameras',
      'dslr-cameras': 'DSLR Cameras',
      'instant-cameras': 'Instant Cameras',
      'media-storage': 'Media Storage',
      'lenses': 'Lenses'
    };
    return categories[category] || category;
  };

  const handleStockUpdate = (increment) => {
    onUpdateStock(product.firestoreId, increment);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl mb-2">{product.image}</div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(product)}
            disabled={loading}
            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.firestoreId)}
            disabled={loading}
            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Product ID - Now the main identifier */}
      <h3 className="text-xl font-bold text-white mb-2">{product.id}</h3>
      
      {/* Category */}
      {product.category && (
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm">
            {getCategoryDisplayName(product.category)}
          </span>
        </div>
      )}
      
      {/* Stock Status */}
      <div className="flex items-center justify-between mb-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStockColor(product.stock)}`}>
          {getStockStatus(product.stock)}
        </div>
      </div>
      
      {/* Stock Controls */}
      <div className="flex items-center justify-between">
        <div className="text-white/70">
          Stock: <span className="text-white font-semibold text-xl">{product.stock}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStockUpdate(-1)}
            disabled={product.stock === 0 || loading}
            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Decrease Stock"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStockUpdate(1)}
            disabled={loading}
            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
            title="Increase Stock"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Alerts */}
      {product.stock <= 3 && product.stock > 0 && (
        <div className="mt-4 flex items-center gap-2 text-yellow-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          Low stock alert
        </div>
      )}
      
      {product.stock === 0 && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          Out of stock
        </div>
      )}
    </div>
  );
};

export default ProductCard;