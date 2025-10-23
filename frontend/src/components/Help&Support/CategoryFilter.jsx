// ========================================
// components/HelpSupport/CategoryFilter.jsx
// ========================================
export const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            selectedCategory === category.id
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
              : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white border border-white/20"
          }`}
        >
          <category.icon className="h-4 w-4" />
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
};
