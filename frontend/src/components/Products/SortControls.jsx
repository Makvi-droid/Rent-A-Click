import React from 'react';

const SortControls = ({ sortBy, onSortChange }) => {
  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "price", label: "Price (Low to High)" },
    { value: "price-desc", label: "Price (High to Low)" },
    { value: "brand", label: "Brand" }
  ];

  return (
    <div className="flex justify-end mb-6">
      <select 
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
      >
        {sortOptions.map(option => (
          <option 
            key={option.value} 
            value={option.value}
            className="bg-slate-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortControls;