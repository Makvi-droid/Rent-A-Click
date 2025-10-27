import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function MiniCalendar({ selectedDates, onDateSelect, blockedDates }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = new Date(year, month - 1, 0);
      const day = prevMonth.getDate() - i;
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month - 1, day),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
      });
    }

    // Next month days to fill grid
    const remainingSlots = 42 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day),
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const formatDateKey = (date) => {
    return date.toISOString().split("T")[0];
  };

  const isDateBlocked = (date) => {
    const dateKey = formatDateKey(date);
    return blockedDates.some((blocked) => blocked.date === dateKey);
  };

  const isDateSelected = (date) => {
    const dateKey = formatDateKey(date);
    return selectedDates.includes(dateKey);
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-300" />
        </button>
        <h3 className="text-white font-semibold">{monthYear}</h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-gray-300" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-xs text-gray-400 font-medium p-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayObj, index) => {
          const dateKey = formatDateKey(dayObj.date);
          const isBlocked = isDateBlocked(dayObj.date);
          const isSelected = isDateSelected(dayObj.date);
          const isPast =
            dayObj.date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <button
              key={index}
              onClick={() =>
                dayObj.isCurrentMonth && !isPast && onDateSelect(dateKey)
              }
              disabled={!dayObj.isCurrentMonth || isPast}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200
                ${dayObj.isCurrentMonth ? "text-white" : "text-gray-600"}
                ${
                  isSelected
                    ? "bg-purple-600 text-white ring-2 ring-purple-400"
                    : ""
                }
                ${isBlocked && !isSelected ? "bg-red-900/50 text-red-300" : ""}
                ${
                  !isSelected && !isBlocked && dayObj.isCurrentMonth && !isPast
                    ? "hover:bg-gray-700"
                    : ""
                }
                ${isPast ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {dayObj.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MiniCalendar;
