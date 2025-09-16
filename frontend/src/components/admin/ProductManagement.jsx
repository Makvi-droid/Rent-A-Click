import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { firestore } from '../../firebase';
import ProductCard from '../../admin/ProductsManagement/ProductCard';
import ProductModal from '../../admin/ProductsManagement/ProductModal';
import FilterControls from '../../admin/ProductsManagement/FilterControls';
import { Plus, Package, AlertCircle } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, selectedSubCategory, selectedStatus, selectedApproval, searchTerm]);

  // Generate incremental ID for products
  const generateProductId = async () => {
    try {
      const productsRef = collection(firestore, 'products');
      const q = query(productsRef, orderBy('id', 'desc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return 'RACPM0001';
      }
      
      const lastDoc = snapshot.docs[0];
      const lastId = lastDoc.data().id;
      
      // Extract numeric part and increment
      const match = lastId.match(/RACPM(\d+)/);
      if (match) {
        const numericPart = parseInt(match[1]) + 1;
        return `RACPM${numericPart.toString().padStart(4, '0')}`;
      } else {
        // Fallback if format doesn't match
        return 'RACPM0001';
      }
    } catch (err) {
      console.error('Error generating product ID:', err);
      // Fallback ID generation
      const timestamp = Date.now().toString().slice(-4);
      return `RACPM${timestamp}`;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsCollection = collection(firestore, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
      }));
      
      // Fetch inventory
      const inventoryCollection = collection(firestore, 'inventory');
      const inventorySnapshot = await getDocs(inventoryCollection);
      const inventoryList = inventorySnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsList);
      setInventoryProducts(inventoryList);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSubCategory = selectedSubCategory === 'All' || product.subCategory === selectedSubCategory;
      const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;
      
      const matchesApproval = selectedApproval === 'All' || 
        (selectedApproval === 'approved' && product.approved) ||
        (selectedApproval === 'pending' && !product.approved);
      
      const matchesSearch = searchTerm === '' || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSubCategory && matchesStatus && matchesApproval && matchesSearch;
    });
    setFilteredProducts(filtered);
  };

  const handleAddProduct = async (productData) => {
    try {
      setError('');
      
      // Validate required fields
      if (!productData.inventoryId) {
        throw new Error('Please select an inventory item');
      }
      
      const inventoryItem = inventoryProducts.find(item => item.id === productData.inventoryId);
      if (!inventoryItem) {
        throw new Error('Selected inventory item not found');
      }

      const productId = await generateProductId();
      
      // Create new product with data from inventory
      const newProduct = {
        id: productId,
        inventoryId: inventoryItem.id,
        name: productData.name || `Product ${productId}`,
        brand: productData.brand || 'No Brand',
        category: inventoryItem.category,
        subCategory: productData.subCategory || '',
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        status: productData.status || 'active',
        approved: productData.approved || false,
        image: productData.image || inventoryItem.image || '📦',
        stock: inventoryItem.stock, // Read-only from inventory
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Adding product to Firestore:', newProduct);
      
      // Use setDoc with custom document ID
      const docRef = doc(collection(firestore, 'products'), productId);
      await setDoc(docRef, newProduct);
      console.log('Product added successfully with custom ID:', productId);
      
      // Refresh data
      await fetchData();
      
      return { success: true, id: productId };
    } catch (err) {
      console.error('Error adding product:', err);
      const errorMessage = err.message || 'Failed to add product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleUpdateProduct = async (firestoreId, updates) => {
    try {
      setError('');
      
      if (!firestoreId) {
        throw new Error('Product ID is required for update');
      }

      const productRef = doc(firestore, 'products', firestoreId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Don't allow stock updates (read-only from inventory)
      delete updateData.stock;
      
      // Ensure price is a number
      if (updateData.price !== undefined) {
        updateData.price = parseFloat(updateData.price) || 0;
      }

      console.log('Updating product:', firestoreId, updateData);
      
      await updateDoc(productRef, updateData);
      console.log('Product updated successfully');
      
      // Refresh data
      await fetchData();
      
      return { success: true };
    } catch (err) {
      console.error('Error updating product:', err);
      const errorMessage = err.message || 'Failed to update product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleDeleteProduct = async (firestoreId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setError('');
        
        if (!firestoreId) {
          throw new Error('Product ID is required for deletion');
        }

        console.log('Deleting product:', firestoreId);
        
        await deleteDoc(doc(firestore, 'products', firestoreId));
        console.log('Product deleted successfully');
        
        // Refresh data
        await fetchData();
        
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product. Please try again.');
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    fetchData(); // Refresh products after modal closes
  };

  // Get updated stock from inventory for products
  const getProductsWithUpdatedStock = () => {
    return filteredProducts.map(product => {
      const inventoryItem = inventoryProducts.find(item => item.id === product.inventoryId);
      return {
        ...product,
        stock: inventoryItem ? inventoryItem.stock : product.stock || 0
      };
    });
  };

  const productsWithStock = getProductsWithUpdatedStock();
  const totalProducts = products.length;
  const approvedProducts = products.filter(p => p.approved).length;
  const outOfStockProducts = productsWithStock.filter(p => p.stock === 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Product Management</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Products</p>
                  <p className="text-2xl font-bold text-white">{totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Live Products</p>
                  <p className="text-2xl font-bold text-white">{approvedProducts}</p>
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Out of Stock</p>
                  <p className="text-2xl font-bold text-white">{outOfStockProducts}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Controls */}
        <FilterControls
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedApproval={selectedApproval}
          setSelectedApproval={setSelectedApproval}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Products Grid */}
        {productsWithStock.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-white/60" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {products.length === 0 ? 'No products yet' : 'No products found'}
            </h3>
            <p className="text-white/60 mb-4">
              {products.length === 0 
                ? 'Start by adding your first product from inventory' 
                : 'Try adjusting your filters or search terms'
              }
            </p>
            {products.length === 0 && inventoryProducts.length > 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Add Your First Product
              </button>
            )}
            {inventoryProducts.length === 0 && (
              <p className="text-white/60 text-sm mt-2">
                Add items to inventory first before creating products
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsWithStock.map((product) => (
              <ProductCard
                key={product.firestoreId}
                product={product}
                onEdit={handleEditProduct}
                onDelete={() => handleDeleteProduct(product.firestoreId)}
                showStock={true} // New prop to show stock
                stockReadOnly={true} // New prop to make stock read-only
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          inventoryProducts={inventoryProducts}
          onClose={handleModalClose}
          onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
        />
      )}
    </div>
  );
};

export default ProductManagement;