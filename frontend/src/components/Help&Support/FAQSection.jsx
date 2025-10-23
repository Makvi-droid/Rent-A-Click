// ========================================
// components/HelpSupport/FAQSection.jsx
// ========================================
import { FAQItem } from "./FAQItem";
import { CategoryFilter } from "./CategoryFilter";
export const FAQSection = ({
  faqs,
  categories,
  selectedCategory,
  onSelectCategory,
  openFAQ,
  onToggleFAQ,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          Find quick answers to common questions about our camera rental service
        </p>
      </div>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openFAQ === index}
            onToggle={() => onToggleFAQ(index)}
          />
        ))}
      </div>

      {faqs.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white/70 mb-2">
            No FAQs Found
          </h3>
          <p className="text-white/50">
            Try adjusting your search or category filter
          </p>
        </div>
      )}
    </div>
  );
};
