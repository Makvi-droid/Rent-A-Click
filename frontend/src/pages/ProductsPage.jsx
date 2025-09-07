import React, { useState, useMemo } from 'react';

const ProductsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    // DIGITAL CAMERAS
    { id: 1, brand: "Fujifilm", name: "X-A3 Mirrorless Camera", price: 8999, category: "Digital Cameras", subCategory: "Mirrorless", status: "active" },
    { id: 2, brand: "Fujifilm", name: "X-T4 Mirrorless Camera", price: 12999, category: "Digital Cameras", subCategory: "Mirrorless", status: "active" },
    { id: 3, brand: "Fujifilm", name: "X-A7 Mirrorless Camera", price: 7999, category: "Digital Cameras", subCategory: "Mirrorless", status: "active" },
    { id: 4, brand: "Fujifilm", name: "X-T3 Mirrorless Camera", price: 10999, category: "Digital Cameras", subCategory: "Mirrorless", status: "out of stock" },
    { id: 5, brand: "Fujifilm", name: "X-A10 Mirrorless Camera", price: 6999, category: "Digital Cameras", subCategory: "Mirrorless", status: "active" },
    { id: 6, brand: "Canon", name: "EOS R50 V", price: 14999, category: "Digital Cameras", subCategory: "Mirrorless", status: "active" },
    { id: 7, brand: "Canon", name: "EOS M3", price: 8999, category: "Digital Cameras", subCategory: "Mirrorless", status: "active" },
    { id: 8, brand: "Canon", name: "EOS M50", price: 11999, category: "Digital Cameras", subCategory: "Mirrorless", status: "active" },
    { id: 9, brand: "Canon", name: "EOS M100", price: 7999, category: "Digital Cameras", subCategory: "Mirrorless", status: "out of stock" },
    { id: 10, brand: "Canon", name: "IXY 430F IXUS 245 HS", price: 5999, category: "Digital Cameras", subCategory: "Compact", status: "active" },
    { id: 11, brand: "Canon", name: "IXY 620F", price: 6499, category: "Digital Cameras", subCategory: "Compact", status: "active" },
    { id: 12, brand: "Canon", name: "PowerShot SX730 HS", price: 8999, category: "Digital Cameras", subCategory: "Compact", status: "active" },
    { id: 13, brand: "Canon", name: "PowerShot SX530 HS", price: 7999, category: "Digital Cameras", subCategory: "Compact", status: "active" },
    { id: 14, brand: "Canon", name: "PowerShot G5 X", price: 12999, category: "Digital Cameras", subCategory: "Compact", status: "active" },

    // DSLR CAMERAS
    { id: 15, brand: "Canon", name: "EOS 90D", price: 18999, category: "DSLR Cameras", subCategory: "Professional", status: "active" },
    { id: 16, brand: "Canon", name: "EOS 80D", price: 15999, category: "DSLR Cameras", subCategory: "Professional", status: "active" },
    { id: 17, brand: "Canon", name: "EOS Rebel T7 EF-S", price: 12999, category: "DSLR Cameras", subCategory: "Entry-Level", status: "active" },
    { id: 18, brand: "Canon", name: "EOS 250D", price: 13999, category: "DSLR Cameras", subCategory: "Entry-Level", status: "out of stock" },
    { id: 19, brand: "Canon", name: "EOS 5D Mark IV", price: 29999, category: "DSLR Cameras", subCategory: "Professional", status: "active" },
    { id: 20, brand: "Canon", name: "EOS-1D X Mark III", price: 49999, category: "DSLR Cameras", subCategory: "Professional", status: "active" },
    { id: 21, brand: "Canon", name: "EOS 5DS R", price: 34999, category: "DSLR Cameras", subCategory: "Professional", status: "active" },
    { id: 22, brand: "Nikon", name: "D850 + AF-S 24-120mm f/4G ED VR", price: 38999, category: "DSLR Cameras", subCategory: "Professional", status: "active" },
    { id: 23, brand: "Nikon", name: "D780 + AF-S 24-120mm f/4G ED VR", price: 32999, category: "DSLR Cameras", subCategory: "Professional", status: "active" },
    { id: 24, brand: "Nikon", name: "D7500 + AF-S DX 18-140mm f/3.5-5.6G ED VR", price: 23999, category: "DSLR Cameras", subCategory: "Mid-Range", status: "active" },
    { id: 25, brand: "Nikon", name: "D5600 + AF-P DX 18-55mm f/3.5-5.6G VR", price: 17999, category: "DSLR Cameras", subCategory: "Entry-Level", status: "active" },
    { id: 26, brand: "Nikon", name: "D3500 + AF-P DX 18-55mm f/3.5-5.6G VR", price: 14999, category: "DSLR Cameras", subCategory: "Entry-Level", status: "active" },
    { id: 27, brand: "Pentax", name: "K-1 Mark II", price: 28999, category: "DSLR Cameras", subCategory: "Professional", status: "active" },
    { id: 28, brand: "Pentax", name: "K-3 Mark III", price: 24999, category: "DSLR Cameras", subCategory: "Professional", status: "active" },
    { id: 29, brand: "Pentax", name: "K-70", price: 19999, category: "DSLR Cameras", subCategory: "Mid-Range", status: "active" },
    { id: 30, brand: "Pentax", name: "KP", price: 21999, category: "DSLR Cameras", subCategory: "Mid-Range", status: "active" },
    { id: 31, brand: "Pentax", name: "K-S2", price: 16999, category: "DSLR Cameras", subCategory: "Entry-Level", status: "out of stock" },

    // INSTANT CAMERAS
    { id: 32, brand: "Fujifilm", name: "Instax Mini 12", price: 2999, category: "Instant Cameras", subCategory: "Mini", status: "active" },
    { id: 33, brand: "Fujifilm", name: "Instax Mini Evo", price: 5999, category: "Instant Cameras", subCategory: "Mini", status: "active" },
    { id: 34, brand: "Fujifilm", name: "Instax Mini Wide Evo Hybrid", price: 6999, category: "Instant Cameras", subCategory: "Wide", status: "active" },
    { id: 35, brand: "Fujifilm", name: "Instax Mini Liplay Hybrid", price: 5499, category: "Instant Cameras", subCategory: "Mini", status: "active" },
    { id: 36, brand: "Fujifilm", name: "Instax Mini Link 2", price: 3999, category: "Instant Cameras", subCategory: "Mini", status: "active" },
    { id: 37, brand: "Fujifilm", name: "Instax Mini Link 3", price: 4499, category: "Instant Cameras", subCategory: "Mini", status: "active" },
    { id: 38, brand: "Fujifilm", name: "Instax Square SQ1", price: 4999, category: "Instant Cameras", subCategory: "Square", status: "out of stock" },
    { id: 39, brand: "Fujifilm", name: "Instax Square SQ6", price: 5499, category: "Instant Cameras", subCategory: "Square", status: "active" },
    { id: 40, brand: "Fujifilm", name: "Instax Wide 400", price: 7999, category: "Instant Cameras", subCategory: "Wide", status: "active" },
    { id: 41, brand: "Polaroid", name: "Go Generation 2", price: 3999, category: "Instant Cameras", subCategory: "Mini", status: "active" },

    // MEDIA STORAGE
    { id: 42, brand: "Kingston", name: "V90 SD Card – 128GB", price: 1999, category: "Media Storage", subCategory: "SD Cards", status: "active" },
    { id: 43, brand: "SanDisk", name: "V30 SD Card – 128GB", price: 1499, category: "Media Storage", subCategory: "SD Cards", status: "active" },
    { id: 44, brand: "Sony", name: "V60 SD Card – 128GB", price: 1799, category: "Media Storage", subCategory: "SD Cards", status: "active" },
    { id: 45, brand: "Sony", name: "CFexpress Type A – 160GB", price: 3999, category: "Media Storage", subCategory: "CFexpress", status: "out of stock" },
    { id: 46, brand: "Various", name: "256GB Micro SD Card (V30)", price: 1299, category: "Media Storage", subCategory: "Micro SD", status: "active" },

    // LENSES
    { id: 47, brand: "Canon", name: "EF 50mm f/1.8 STM", price: 4999, category: "Lenses", subCategory: "Prime", status: "active" },
    { id: 48, brand: "Canon", name: "EF-S 24mm f/2.8 STM", price: 3999, category: "Lenses", subCategory: "Prime", status: "active" },
    { id: 49, brand: "Canon", name: "EF-M 22mm f/2 STM", price: 4499, category: "Lenses", subCategory: "Prime", status: "active" },
    { id: 50, brand: "Canon", name: "EF-M 11-22mm f/4-5.6", price: 5999, category: "Lenses", subCategory: "Zoom", status: "active" },
    { id: 51, brand: "Canon", name: "EF-S 10-18mm f/4.5-5.6 IS STM", price: 5499, category: "Lenses", subCategory: "Zoom", status: "out of stock" }
  ];

  const categories = ["All", "Digital Cameras", "DSLR Cameras", "Instant Cameras", "Media Storage", "Lenses"];
  const subCategories = {
    "Digital Cameras": ["All", "Mirrorless", "Compact"],
    "DSLR Cameras": ["All", "Professional", "Mid-Range", "Entry-Level"],
    "Instant Cameras": ["All", "Mini", "Square", "Wide"],
    "Media Storage": ["All", "SD Cards", "CFexpress", "Micro SD"],
    "Lenses": ["All", "Prime", "Zoom"]
  };

  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "price", label: "Price (Low to High)" },
    { value: "price-desc", label: "Price (High to Low)" },
    { value: "brand", label: "Brand" }
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSubCategory = selectedSubCategory === 'All' || product.subCategory === selectedSubCategory;
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSubCategory && matchesSearch;
    });

    // Sorting
    return filtered.sort((a, b) => {
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
  }, [selectedCategory, selectedSubCategory, sortBy, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'out of stock': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Rent-a-Click</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-white/80 hover:text-white font-medium transition-colors">Home</a>
              <a href="#" className="text-white font-medium border-b-2 border-white">Products</a>
              <a href="#" className="text-white/80 hover:text-white font-medium transition-colors">Features</a>
              <a href="#" className="text-white/80 hover:text-white font-medium transition-colors">About</a>
              <a href="#" className="text-white/80 hover:text-white font-medium transition-colors">Contact</a>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="text-white/80 hover:text-white font-medium transition-colors">
                Sign In
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Professional Photography Equipment
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Rent high-quality gear from top brands for your next photoshoot
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-12">
            <input
              type="text"
              placeholder="Search cameras, lenses, brands..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 focus:border-white/40 transition-all duration-200"
            />
            <button className="absolute right-2 top-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-md transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40">
              🔍 Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Category Navigation */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Browse Equipment</h2>
          <p className="text-white/80 text-center mb-8 max-w-2xl mx-auto">
            Discover our extensive collection of professional photography equipment
          </p>
          
          {/* Main Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedSubCategory('All');
                }}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-white/20 text-white border border-white/40 shadow-lg'
                    : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sub Categories */}
          {selectedCategory !== 'All' && subCategories[selectedCategory] && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {subCategories[selectedCategory].map(subCategory => (
                <button
                  key={subCategory}
                  onClick={() => setSelectedSubCategory(subCategory)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedSubCategory === subCategory
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {subCategory}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Minimal Sort Filter */}
        <div className="flex justify-end mb-6">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <div key={product.id} className="group bg-white/10 backdrop-blur-md rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 hover:border-white/40 overflow-hidden">
              
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                    {product.brand}
                  </span>
                  {/* Status Indicator */}
                  <span className={`${getStatusColor(product.status)} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {product.status.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-bold text-white">P{product.price.toLocaleString()}</span>
                  <span className="text-sm text-white/60">/day</span>
                </div>
                
                <button 
                  disabled={product.status === 'out of stock'}
                  className={`w-full ${
                    product.status === 'out of stock' 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  {product.status === 'out of stock' ? 'Out of Stock' : 'Rent Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-white/60">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;