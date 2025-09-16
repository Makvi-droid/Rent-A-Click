// components/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const ProductForm = ({ isOpen, onClose, onSubmit, editingProduct, loading }) => {
  const [formData, setFormData] = useState({
    stock: '',
    category: '',
    image: '📦'
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'digital-cameras', label: 'Digital Cameras' },
    { value: 'dslr-cameras', label: 'DSLR Cameras' },
    { value: 'instant-cameras', label: 'Instant Cameras' },
    { value: 'media-storage', label: 'Media Storage' },
    { value: 'lenses', label: 'Lenses' }
  ];

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          stock: editingProduct.stock?.toString() || '',
          category: editingProduct.category || '',
          image: editingProduct.image || '📦'
        });
      } else {
        setFormData({
          stock: '',
          category: '',
          image: '📦'
        });
      }
      // Clear errors when opening/changing product
      setErrors({});
      setSubmitError('');
    }
  }, [editingProduct, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Stock validation
    const stockValue = parseInt(formData.stock);
    if (!formData.stock.trim()) {
      newErrors.stock = 'Stock quantity is required';
    } else if (isNaN(stockValue) || stockValue < 0) {
      newErrors.stock = 'Stock must be a valid number (0 or greater)';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Image validation (basic check for emoji or text)
    if (!formData.image.trim()) {
      newErrors.image = 'Product image/emoji is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare clean data for submission (no name or price)
      const cleanFormData = {
        stock: parseInt(formData.stock) || 0,
        category: formData.category,
        image: formData.image.trim()
      };

      console.log('Submitting form data:', cleanFormData);
      
      const result = await onSubmit(cleanFormData);
      
      if (result && result.success) {
        // Success - form will be closed by parent component
        setFormData({ stock: '', category: '', image: '📦' });
        setErrors({});
        setSubmitError('');
      } else {
        // Handle submission error
        const errorMsg = result?.error || 'Failed to save product. Please try again.';
        setSubmitError(errorMsg);
        console.error('Form submission error:', errorMsg);
      }
    } catch (err) {
      console.error('Form submission exception:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ stock: '', category: '', image: '📦' });
      setErrors({});
      setSubmitError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-bold text-white mb-6">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h3>

        {/* General error message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Error</p>
              <p className="text-red-200 text-sm">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stock Quantity */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              placeholder="Enter stock quantity"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              disabled={loading}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                errors.stock 
                  ? 'border-red-500/50 focus:ring-red-400' 
                  : 'border-white/30 focus:ring-purple-400'
              }`}
            />
            {errors.stock && (
              <p className="mt-2 text-red-300 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.stock}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                errors.category 
                  ? 'border-red-500/50 focus:ring-red-400' 
                  : 'border-white/30 focus:ring-purple-400'
              }`}
            >
              {categories.map((category) => (
                <option 
                  key={category.value} 
                  value={category.value}
                  className="bg-gray-800 text-white"
                >
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-2 text-red-300 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Product Image/Emoji */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Product Image/Emoji *
            </label>
            <input
              type="text"
              name="image"
              placeholder="(Enter emoji)"
              value={formData.image}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 ${
                errors.image 
                  ? 'border-red-500/50 focus:ring-red-400' 
                  : 'border-white/30 focus:ring-purple-400'
              }`}
            />
            {errors.image && (
              <p className="mt-2 text-red-300 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.image}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.stock.trim() || !formData.category}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;