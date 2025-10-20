import React from "react";

const FilterTabs = ({ activeFilter, setActiveFilter, counts }) => {
  const filters = [
    { id: "all", label: "All", count: counts.all },
    { id: "orders", label: "Orders", count: counts.orders },
    { id: "promotions", label: "Promotions", count: counts.promotions },
    { id: "billing", label: "Billing", count: counts.billing },
  ];

  const tabClasses = (isActive) => {
    const baseClasses =
      "px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 backdrop-blur-sm border transform hover:scale-105";

    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/30 shadow-lg shadow-purple-500/25`;
    }

    return `${baseClasses} text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/60 border-gray-700/50 hover:border-gray-600/50`;
  };

  const badgeClasses = (isActive) => {
    const baseClasses =
      "px-2 py-1 text-xs rounded-full min-w-[20px] text-center font-semibold";

    if (isActive) {
      return `${baseClasses} bg-white text-purple-600 shadow-md`;
    }

    return `${baseClasses} bg-gray-700/60 text-gray-300 border border-gray-600/50`;
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setActiveFilter(filter.id)}
          className={tabClasses(activeFilter === filter.id)}
        >
          <span>{filter.label}</span>
          {filter.count > 0 && (
            <span className={badgeClasses(activeFilter === filter.id)}>
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
