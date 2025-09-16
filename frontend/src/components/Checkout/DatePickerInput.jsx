import React, { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import CustomCalendar from "./CustomCalendar";

const DatePickerInput = ({ value, onChange, label, placeholder, minDate, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long", 
      year: "numeric",
    });
  };

  useEffect(() => {
    setInputValue(formatDate(value));
  }, [value]);

  const handleInputChange = (e) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    
    // Try to parse the input as a date
    const parsedDate = new Date(inputVal);
    if (!isNaN(parsedDate.getTime())) {
      onChange(parsedDate);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          required={required}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded-md transition-colors"
        >
          <CalendarIcon className="text-purple-400" size={18} />
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-2 z-50">
          <CustomCalendar
            selected={value}
            onSelect={onChange}
            onClose={() => setIsOpen(false)}
            minDate={minDate}
          />
        </div>
      )}
      
      {/* Backdrop to close calendar when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DatePickerInput;