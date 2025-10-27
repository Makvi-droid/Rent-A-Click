// CustomCalendar.jsx - IMPROVED version with better debugging
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const CustomCalendar = ({ selected, onSelect, onClose, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "businessSettings"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBlockedDates(data);

        console.log("=== BLOCKED DATES DEBUG ===");
        console.log("Total blackouts:", data.length);
        data.forEach((blackout, index) => {
          console.log(`Blackout ${index + 1}:`, {
            type: blackout.type,
            startDate: blackout.startDate,
            endDate: blackout.endDate,
            dates: blackout.dates,
            recurringDay: blackout.recurringDay,
          });
        });
        console.log("=========================");
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlockedDates();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const checkIfDateBlocked = (date) => {
    const dateKey = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();

    // Check full day blocks
    const hasFullDayBlock = blockedDates.some(
      (b) =>
        b.type === "full_day" &&
        Array.isArray(b.dates) &&
        b.dates.includes(dateKey)
    );

    // FIXED: Check date range blocks with proper date comparison
    const hasRangeBlock = blockedDates.some((b) => {
      if (b.type !== "date_range") return false;

      // Ensure dates exist and are strings
      if (!b.startDate || !b.endDate) {
        console.warn("Date range blackout missing dates:", b);
        return false;
      }

      // Direct string comparison (YYYY-MM-DD format)
      const isInRange = dateKey >= b.startDate && dateKey <= b.endDate;

      if (isInRange) {
        console.log(
          `Date ${dateKey} is in range ${b.startDate} to ${b.endDate}`
        );
      }

      return isInRange;
    });

    // Check recurring blocks
    const hasRecurringBlock = blockedDates.some(
      (b) => b.type === "recurring" && b.recurringDay === dayOfWeek
    );

    const isBlocked = hasFullDayBlock || hasRangeBlock || hasRecurringBlock;

    return isBlocked;
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

    // Next month's leading days
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

  const isDateDisabled = (date) => {
    if (!minDate) return false;

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const minDateNormalized = new Date(minDate);
    minDateNormalized.setHours(0, 0, 0, 0);

    const isPast = compareDate < minDateNormalized;
    const isBlocked = checkIfDateBlocked(date);

    return isPast || isBlocked;
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1
    );
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1
    );
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (date) => {
    const isBlocked = checkIfDateBlocked(date);
    console.log(
      `Attempting to select date ${
        date.toISOString().split("T")[0]
      }, blocked: ${isBlocked}`
    );

    if (!isDateDisabled(date)) {
      onSelect(date);
      onClose();
    } else {
      console.warn("Cannot select disabled date");
    }
  };

  const canNavigateToPrevMonth = () => {
    if (!minDate) return true;

    const prevMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1
    );
    const lastDayOfPrevMonth = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
      0
    );

    const minDateNormalized = new Date(minDate);
    minDateNormalized.setHours(0, 0, 0, 0);

    return lastDayOfPrevMonth >= minDateNormalized;
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-2xl w-80">
        <div className="text-center text-gray-400 py-8">
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-2xl w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          disabled={!canNavigateToPrevMonth()}
          className={`p-2 rounded-lg transition-colors ${
            canNavigateToPrevMonth()
              ? "hover:bg-gray-700 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <ChevronLeft size={16} className="text-gray-300" />
        </button>
        <h3 className="text-white font-semibold">{monthYear}</h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      </div>

      {/* Days of week header */}
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

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayObj, index) => {
          const isSelected =
            selected && dayObj.date.toDateString() === selected.toDateString();
          const isToday =
            dayObj.date.toDateString() === new Date().toDateString();
          const isDisabled = isDateDisabled(dayObj.date);
          const isBlocked = checkIfDateBlocked(dayObj.date);

          return (
            <button
              key={index}
              onClick={() => handleDateSelect(dayObj.date)}
              disabled={isDisabled}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200
                ${dayObj.isCurrentMonth ? "text-white" : "text-gray-500"}
                ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : ""
                }
                ${isToday && !isSelected ? "bg-gray-700 text-purple-400" : ""}
                ${
                  isBlocked && !isSelected
                    ? "bg-red-900/50 text-red-300 font-bold"
                    : ""
                }
                ${
                  !isSelected &&
                  !isBlocked &&
                  dayObj.isCurrentMonth &&
                  !isDisabled
                    ? "hover:bg-gray-700"
                    : ""
                }
                ${
                  isDisabled
                    ? "opacity-30 cursor-not-allowed line-through"
                    : "cursor-pointer"
                }
              `}
            >
              {dayObj.day}
            </button>
          );
        })}
      </div>

      {/* Show helpful message for disabled dates */}
      {minDate && (
        <div className="mt-3 text-xs text-gray-400 text-center">
          Dates before {formatDate(minDate)} are not available
        </div>
      )}

      {/* Show blocked dates indicator */}
      {blockedDates.length > 0 && (
        <div className="mt-2 text-xs text-red-400 text-center">
          Red/crossed dates are unavailable ({blockedDates.length} rule
          {blockedDates.length !== 1 ? "s" : ""})
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
