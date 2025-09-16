import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CustomCalendar = ({ selected, onSelect, onClose, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = new Date(year, month - 1, 0);
      const day = prevMonth.getDate() - i;
      days.push({ day, isCurrentMonth: false, date: new Date(year, month - 1, day) });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true, date: new Date(year, month, day) });
    }
    
    // Next month's leading days
    const remainingSlots = 42 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({ day, isCurrentMonth: false, date: new Date(year, month + 1, day) });
    }
    
    return days;
  };

  const isDateDisabled = (date) => {
    if (!minDate) return false;
    return date < minDate;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (date) => {
    if (!isDateDisabled(date)) {
      onSelect(date);
      onClose();
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-2xl w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-300" />
        </button>
        <h3 className="text-white font-semibold">{monthYear}</h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-xs text-gray-400 font-medium p-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayObj, index) => {
          const isSelected = selected && dayObj.date.toDateString() === selected.toDateString();
          const isToday = dayObj.date.toDateString() === new Date().toDateString();
          const isDisabled = isDateDisabled(dayObj.date);
          
          return (
            <button
              key={index}
              onClick={() => handleDateSelect(dayObj.date)}
              disabled={isDisabled}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200
                ${dayObj.isCurrentMonth ? "text-white" : "text-gray-500"}
                ${isSelected ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : ""}
                ${isToday && !isSelected ? "bg-gray-700 text-purple-400" : ""}
                ${!isSelected && dayObj.isCurrentMonth && !isDisabled ? "hover:bg-gray-700" : ""}
                ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {dayObj.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;