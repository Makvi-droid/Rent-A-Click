// ========================================
// components/HelpSupport/FAQItem.jsx
// ========================================
import { ChevronDown, ChevronUp } from "lucide-react";

export const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center"
        onClick={onToggle}
      >
        <span className="font-medium text-white pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-white/70 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-white/70 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4 border-t border-white/10">
          <p className="text-white/80 leading-relaxed mt-4">{answer}</p>
        </div>
      )}
    </div>
  );
};
