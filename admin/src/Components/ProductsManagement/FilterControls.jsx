import React from 'react';
import { Search, Filter } from 'lucide-react';

const FilterControls = ({
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  selectedStatus,
  setSelectedStatus,
  searchTerm,
  setSearchTerm,
  // Add these new props
  selectedApproval,
  setSelectedApproval
}) => {
  const categories = ["All", "Digital Cameras", "DSLR Cameras", "Instant Cameras", "Media Storage", "Lenses"];
  
  const subCategories = {
    "Digital Cameras": ["All", "Mirrorless", "Compact"],
    "DSLR Cameras": ["All", "Professional", "Mid-Range", "Entry-Level"],
    "Instant Cameras": ["All", "Mini", "Square", "Wide"],
    "Media Storage": ["All", "SD Cards", "CFexpress", "Micro SD"],
    "Lenses": ["All", "Prime", "Zoom"]
  };

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "out of stock", label: "Out of Stock" },
    { value: "discontinued", label: "Discontinued" }
  ];

  const approvalOptions = [
    { value: "All", label: "All Products" },
    { value: "approved", label: "Live Products" },
    { value: "pending", label: "Hidden Products" }
  ];

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/60" />
        </div>
        <input
          type="text"
          placeholder="Search products, brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200"
        />
      </div>

      {/* Filter Section Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Filters</h3>
      </div>

      {/* Main Categories */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedSubCategory('All');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white hover:border-white/40'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Categories */}
      {selectedCategory !== 'All' && subCategories[selectedCategory] && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-white/80 mb-2">Sub-category</label>
          <div className="flex flex-wrap gap-2">
            {subCategories[selectedCategory].map(subCategory => (
              <button
                key={subCategory}
                onClick={() => setSelectedSubCategory(subCategory)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedSubCategory === subCategory
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {subCategory}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status and Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* NEW: Approval/Visibility Filter */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Visibility</label>
          <select
            value={selectedApproval || 'All'}
            onChange={(e) => setSelectedApproval && setSelectedApproval(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200"
          >
            {approvalOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedSubCategory('All');
              setSelectedStatus('All');
              setSelectedApproval && setSelectedApproval('All');
              setSearchTerm('');
            }}
            className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 font-medium rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="mt-4">
        {(selectedCategory !== 'All' || selectedSubCategory !== 'All' || selectedStatus !== 'All' || (selectedApproval && selectedApproval !== 'All') || searchTerm) && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-white/60">Active filters:</span>
            
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Category: {selectedCategory}
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSubCategory('All');
                  }}
                  className="ml-1 hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            )}
            
            {selectedSubCategory !== 'All' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Sub: {selectedSubCategory}
                <button
                  onClick={() => setSelectedSubCategory('All')}
                  className="ml-1 hover:text-purple-200"
                >
                  ×
                </button>
              </span>
            )}
            
            {selectedStatus !== 'All' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                Status: {selectedStatus}
                <button
                  onClick={() => setSelectedStatus('All')}
                  className="ml-1 hover:text-green-200"
                >
                  ×
                </button>
              </span>
            )}
            
            {selectedApproval && selectedApproval !== 'All' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Visibility: {approvalOptions.find(opt => opt.value === selectedApproval)?.label}
                <button
                  onClick={() => setSelectedApproval && setSelectedApproval('All')}
                  className="ml-1 hover:text-orange-200"
                >
                  ×
                </button>
              </span>
            )}
            
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-yellow-200"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;