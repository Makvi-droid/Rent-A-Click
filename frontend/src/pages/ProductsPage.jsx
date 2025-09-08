import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase'; // Adjust path as needed
import ProductGrid from '../components/Products/ProductGrid';
import CategoryFilters from '../components/Products/CategoryFilters';
import SearchBar from '../components/Products/SearchBar';
import SortControls from '../components/Products/SortControls';
import HeroSection from '../components/Products/HeroSection';
import Navbar from '../components/Navbar'

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, selectedSubCategory, sortBy, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsCollection = collection(firestore, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Only show approved products with active status
      const approvedProducts = productsList.filter(product => 
        product.approved === true && product.status === 'active'
      );
      
      setProducts(approvedProducts);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSubCategory = selectedSubCategory === 'All' || product.subCategory === selectedSubCategory;
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSubCategory && matchesSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'brand':
          return a.brand.localeCompare(b.brand);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory('All');
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar Area - Replace this comment with your navbar component */}
      {/* <YourNavbarComponent /> */}
      <Navbar/>

      {/* Hero Section */}
      <HeroSection 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Category Navigation */}
        <CategoryFilters
          products={products}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          onCategoryChange={handleCategoryChange}
          onSubCategoryChange={setSelectedSubCategory}
        />

        {/* Sort Controls */}
        <SortControls
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Products Grid */}
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;