// Inventory.jsx
import React, { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import InventoryHeader from '../InventoryManagement/InventoryHeader';
import InventoryControls from '../InventoryManagement/InventoryControls';
import ProductForm from '../InventoryManagement/ProductForm';
import ProductCard from '../InventoryManagement/ProductCard';
import LoadingSpinner from '../InventoryManagement/LoadingSpinner';

const Inventory = () => {
  const { 
    products, 
    loading, 
    error, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateStock 
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Filtered products based on search
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStockItems = products.filter(p => p.stock <= 3 && p.stock > 0).length;
    const outOfStockItems = products.filter(p => p.stock === 0).length;

    return { totalProducts, totalStock, lowStockItems, outOfStockItems };
  }, [products]);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct.firestoreId, formData);
      } else {
        result = await addProduct(formData);
      }
      
      if (result.success) {
        setShowAddForm(false);
        setEditingProduct(null);
        return true;
      } else {
        console.error('Error:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  // Handle delete
  const handleDelete = async (firestoreId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(firestoreId);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  // Show loading spinner during initial load
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header with stats */}
      <InventoryHeader {...stats} />

      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6">
              Error: {error}
            </div>
          )}

          {/* Controls */}
          <InventoryControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddProduct={() => setShowAddForm(true)}
          />

          {/* Add/Edit Form */}
          <ProductForm
            isOpen={showAddForm}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
            editingProduct={editingProduct}
            loading={formLoading}
          />

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.firestoreId}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateStock={updateStock}
                loading={formLoading}
              />
            ))}
          </div>

          {/* No products message */}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white/70 mb-2">
                {products.length === 0 ? 'No Products Yet' : 'No Products Found'}
              </h3>
              <p className="text-white/50">
                {products.length === 0 
                  ? 'Add your first product to get started' 
                  : 'Try adjusting your search terms'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;