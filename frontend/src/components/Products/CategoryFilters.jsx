import React, { useMemo } from 'react';

const CategoryFilters = ({ 
  products, 
  selectedCategory, 
  selectedSubCategory, 
  onCategoryChange, 
  onSubCategoryChange 
}) => {
  
  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = ['All', ...new Set(products.map(product => product.category))];
    return uniqueCategories;
  }, [products]);

  // Extract unique subcategories based on selected category
  const subCategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    
    const categoryProducts = products.filter(product => product.category === selectedCategory);
    const uniqueSubCategories = ['All', ...new Set(categoryProducts.map(product => product.subCategory))];
    return uniqueSubCategories;
  }, [products, selectedCategory]);

  return (
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
            onClick={() => onCategoryChange(category)}
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
      {selectedCategory !== 'All' && subCategories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {subCategories.map(subCategory => (
            <button
              key={subCategory}
              onClick={() => onSubCategoryChange(subCategory)}
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
  );
};

export default CategoryFilters;