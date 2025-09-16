import React, { useState, useRef } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Upload, Link, Image, Package } from 'lucide-react';

const ProductModal = ({ product, inventoryProducts = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    price: product?.price || '',
    inventoryId: product?.inventoryId || '',
    subCategory: product?.subCategory || '',
    status: product?.status || 'active',
    approved: product?.approved || false,
    imageUrl: product?.imageUrl || '',
    description: product?.description || ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || '');
  const [useImageUrl, setUseImageUrl] = useState(!!product?.imageUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Get selected inventory item
  const selectedInventoryItem = inventoryProducts.find(item => item.id === formData.inventoryId);

  const subCategories = {
  "digital cameras": ["Mirrorless", "Compact"],
  "dslr cameras": ["Professional", "Mid-Range", "Entry-Level"],
  "instant cameras": ["Mini", "Square", "Wide"],
  "media storage": ["SD Cards", "CFexpress", "Micro SD"],
  "lenses": ["Prime", "Zoom"]
};

const categoryMap = {
  "instant-cameras": "instant cameras",
  "digital-cameras": "digital cameras",
  "dslr-cameras": "dslr cameras",
  "media-storage": "media storage",
  "lenses": "lenses"
};

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'out of stock', label: 'Out of Stock' },
    { value: 'discontinued', label: 'Discontinued' }
  ];

  // Get available inventory items (not already used in products)
  const getAvailableInventoryItems = () => {
    // For edit mode, include the current product's inventory item
    if (product && product.inventoryId) {
      return inventoryProducts;
    }
    // For add mode, show all inventory items
    return inventoryProducts;
  };

  // Group inventory items by category
  const groupedInventoryItems = getAvailableInventoryItems().reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Get available sub-categories for selected inventory item's category
  const getAvailableSubCategories = () => {
  if (!selectedInventoryItem || !selectedInventoryItem.category) return [];
  
  const key = selectedInventoryItem.category.trim().toLowerCase();
  const mappedKey = categoryMap[key] || key;
  
  return subCategories[mappedKey] || [];
};



  // Optimized image compression
  const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      if (file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          let { width, height } = img;
          
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          
          if (ratio < 1) {
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressionRatio = blob.size / file.size;
              resolve(compressionRatio < 0.8 ? blob : file);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
          
        } catch (error) {
          console.warn('Compression failed, using original:', error);
          resolve(file);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(file);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const validateFile = (file) => {
    const maxSize = 25 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Please select a JPG, PNG, or WebP image file');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 25MB');
    }
    
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'inventoryId') {
      const selectedItem = inventoryProducts.find(item => item.id === value);
      setFormData(prev => ({
        ...prev,
        inventoryId: value,
        // Clear sub-category when inventory item changes
        subCategory: '',
        // Auto-set image from inventory if no custom image is set
        ...(selectedItem && !prev.imageUrl && !imageFile ? { imageUrl: selectedItem.image } : {})
      }));
      
      // Update image preview if using inventory item's image
      if (selectedItem && !formData.imageUrl && !imageFile) {
        setImagePreview(selectedItem.image || '');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    try {
      validateFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setTimeout(async () => {
        try {
          const compressedFile = await compressImage(file);
          setImageFile(compressedFile);
          
          const sizeBefore = (file.size / 1024).toFixed(1);
          const sizeAfter = (compressedFile.size / 1024).toFixed(1);
          
          if (compressedFile !== file) {
            console.log(`Image optimized: ${sizeBefore}KB → ${sizeAfter}KB`);
          }
        } catch (error) {
          console.warn('Image processing failed, using original:', error);
          setImageFile(file);
        }
      }, 100);
      
      setUseImageUrl(false);
      setFormData(prev => ({ ...prev, imageUrl: '' }));
      
    } catch (error) {
      alert(error.message);
      setImagePreview('');
      setImageFile(null);
    }
  };

  const uploadImage = async (file) => {
    const storage = getStorage();
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    const filename = `products/${timestamp}_${randomId}.${extension}`;
    
    const storageRef = ref(storage, filename);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Image upload failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Product name is required');
      }
      if (!formData.brand.trim()) {
        throw new Error('Brand is required');
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Valid price is required');
      }
      if (!formData.inventoryId) {
        throw new Error('Please select an inventory item');
      }

      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        setUploadProgress(20);
        
        if (!imageFile.lastModified) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        setUploadProgress(30);
        finalImageUrl = await uploadImage(imageFile);
        setUploadProgress(80);
      }

      // If no custom image, use inventory item's image
      if (!finalImageUrl && selectedInventoryItem?.image) {
        finalImageUrl = selectedInventoryItem.image;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        imageUrl: finalImageUrl,
        // Inherit category from inventory item
        category: selectedInventoryItem?.category || formData.category
      };

      setUploadProgress(90);

      if (product) {
        await onSave(product.firestoreId, productData);
      } else {
        await onSave(productData);
      }

      setUploadProgress(100);
      
      setTimeout(() => {
        onClose();
      }, 300);
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.message || 'Error saving product. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="px-6 py-2">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-white/60 text-sm mt-1 text-center">
              {uploadProgress < 30 ? 'Preparing...' :
               uploadProgress < 80 ? 'Uploading image...' :
               uploadProgress < 90 ? 'Saving product...' :
               'Finalizing...'}
            </p>
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Product Details */}
            <div className="space-y-6">
              
              {/* Inventory Selection */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Select Inventory Item *
                  {selectedInventoryItem && (
                    <span className="text-sm text-white/60 ml-2">
                      (Stock: {selectedInventoryItem.stock})
                    </span>
                  )}
                </label>
                <select
                  name="inventoryId"
                  value={formData.inventoryId}
                  onChange={handleInputChange}
                  required
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="" className="bg-slate-800 text-white">
                    Select inventory item...
                  </option>
                  {Object.entries(groupedInventoryItems).map(([category, items]) => (
                    <optgroup key={category} label={category} className="bg-slate-700 text-white">
                      {items.map(item => (
                        <option key={item.id} value={item.id} className="bg-slate-800 text-white">
                          {item.id} - {item.category} (Stock: {item.stock})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-white font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter product name"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-white font-medium mb-2">Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter brand name"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-white font-medium mb-2">Price per Day (₱) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>

              {/* Category (Read-only from inventory) and Sub-category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={selectedInventoryItem?.category || 'Select inventory item first'}
                    disabled
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Sub-category</label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    disabled={uploading || !selectedInventoryItem}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="" className="bg-slate-800 text-white">
                      {!selectedInventoryItem ? 'Select inventory item first' : 'Select sub-category...'}
                    </option>
                    {getAvailableSubCategories().map(subCategory => (
                      <option key={subCategory} value={subCategory} className="bg-slate-800 text-white">
                        {subCategory}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock Display (Read-only) */}
              {selectedInventoryItem && (
                <div>
                  <label className="block text-white font-medium mb-2">Current Stock</label>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <Package className="w-5 h-5 text-white/60" />
                    <span className="text-white font-medium">{selectedInventoryItem.stock} units</span>
                    <span className="text-xs text-white/60">(Managed by Inventory)</span>
                  </div>
                </div>
              )}

              {/* Status and Approval */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="approved"
                      checked={formData.approved}
                      onChange={handleInputChange}
                      disabled={uploading}
                      className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                    />
                    <span className="text-white font-medium">Display to Users</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                  placeholder="Enter product description (optional)"
                />
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-6">
              
              {/* Image Upload Toggle */}
              <div>
                <label className="block text-white font-medium mb-4">Product Image</label>
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setUseImageUrl(false)}
                    disabled={uploading}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${
                      !useImageUrl 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseImageUrl(true)}
                    disabled={uploading}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${
                      useImageUrl 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    <span>Image URL</span>
                  </button>
                </div>
              </div>

              {/* Image URL Input */}
              {useImageUrl && (
                <div>
                  <label className="block text-white font-medium mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleImageUrlChange}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {/* File Upload Area */}
              {!useImageUrl && (
                <div>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      uploading 
                        ? 'border-white/20 bg-white/5 opacity-50 cursor-not-allowed'
                        : dragActive 
                        ? 'border-blue-400 bg-blue-400/10' 
                        : 'border-white/30 hover:border-white/50 bg-white/5'
                    }`}
                    onDragEnter={!uploading ? handleDrag : undefined}
                    onDragLeave={!uploading ? handleDrag : undefined}
                    onDragOver={!uploading ? handleDrag : undefined}
                    onDrop={!uploading ? handleDrop : undefined}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-white/60" />
                      </div>
                      <div>
                        <p className="text-white font-medium mb-2">
                          {uploading ? 'Upload in progress...' : (
                            <>
                              Drop your image here, or{' '}
                              <span className="text-blue-400 underline cursor-pointer">browse</span>
                            </>
                          )}
                        </p>
                        <p className="text-white/60 text-sm">
                          Supports: JPG, PNG, WebP up to 25MB
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          Leave empty to use inventory item's image
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div>
                  <label className="block text-white font-medium mb-2">Preview</label>
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-white/20"
                      onError={() => setImagePreview('')}
                    />
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {imageFile && (
                    <p className="text-white/60 text-xs mt-2 text-center">
                      Custom image ready for upload
                    </p>
                  )}
                  {!imageFile && formData.imageUrl === selectedInventoryItem?.image && (
                    <p className="text-white/60 text-xs mt-2 text-center">
                      Using inventory item's image
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !formData.inventoryId}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {uploading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <span>{uploading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;