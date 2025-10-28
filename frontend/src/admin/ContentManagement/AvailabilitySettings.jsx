import React, { useState, useEffect } from "react";
import {
  Plus,
  Save,
  Trash2,
  Edit2,
  AlertCircle,
  Calendar,
  Clock,
  X,
} from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useToast } from "../../components/Authentication/Toast";
import MiniCalendar from "./MiniCalendar";

// Time slots available (8 AM - 6 PM)
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Format time to 12-hour
const formatTime = (time24) => {
  const [hour, minute] = time24.split(":");
  const hour12 = parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);
  const ampm = parseInt(hour) >= 12 ? "PM" : "AM";
  return `${hour12}:${minute || "00"} ${ampm}`;
};

function AvailabilitySettings() {
  const [blackouts, setBlackouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlackout, setEditingBlackout] = useState(null);
  const { showSuccess, showError } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    type: "full_day",
    selectedDates: [],
    startDate: "",
    endDate: "",
    blockedSlots: [],
    reason: "",
    recurringType: "weekly",
    recurringDay: 0,
  });

  useEffect(() => {
    fetchBlackouts();
  }, []);

  const fetchBlackouts = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "businessSettings"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBlackouts(data);
    } catch (error) {
      console.error("Error fetching blackouts:", error);
      showError("Failed to load availability settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (dateKey) => {
    setFormData((prev) => {
      const isSelected = prev.selectedDates.includes(dateKey);
      return {
        ...prev,
        selectedDates: isSelected
          ? prev.selectedDates.filter((d) => d !== dateKey)
          : [...prev.selectedDates, dateKey],
      };
    });
  };

  const handleTimeSlotToggle = (timeSlot) => {
    setFormData((prev) => {
      const isSelected = prev.blockedSlots.includes(timeSlot);
      return {
        ...prev,
        blockedSlots: isSelected
          ? prev.blockedSlots.filter((t) => t !== timeSlot)
          : [...prev.blockedSlots, timeSlot],
      };
    });
  };

  const resetForm = () => {
    setFormData({
      type: "full_day",
      selectedDates: [],
      startDate: "",
      endDate: "",
      blockedSlots: [],
      reason: "",
      recurringType: "weekly",
      recurringDay: 0,
    });
    setEditingBlackout(null);
    setShowAddModal(false);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (formData.type === "full_day" && formData.selectedDates.length === 0) {
        showError("Please select at least one date");
        return;
      }
      if (
        formData.type === "time_slots" &&
        (formData.selectedDates.length === 0 ||
          formData.blockedSlots.length === 0)
      ) {
        showError("Please select dates and time slots");
        return;
      }
      if (
        formData.type === "date_range" &&
        (!formData.startDate || !formData.endDate)
      ) {
        showError("Please select start and end dates");
        return;
      }
      if (!formData.reason.trim()) {
        showError("Please provide a reason");
        return;
      }

      const blackoutData = {
        type: formData.type,
        reason: formData.reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add type-specific data
      if (formData.type === "full_day") {
        blackoutData.dates = formData.selectedDates;
      } else if (formData.type === "time_slots") {
        blackoutData.dates = formData.selectedDates;
        blackoutData.blockedSlots = formData.blockedSlots;
      } else if (formData.type === "date_range") {
        blackoutData.startDate = formData.startDate;
        blackoutData.endDate = formData.endDate;
      } else if (formData.type === "recurring") {
        blackoutData.recurringType = formData.recurringType;
        blackoutData.recurringDay = formData.recurringDay;
      }

      if (editingBlackout) {
        await updateDoc(
          doc(db, "businessSettings", editingBlackout.id),
          blackoutData
        );
        showSuccess("Blackout updated successfully");
      } else {
        await addDoc(collection(db, "businessSettings"), blackoutData);
        showSuccess("Blackout added successfully");
      }

      fetchBlackouts();
      resetForm();
    } catch (error) {
      console.error("Error saving blackout:", error);
      showError("Failed to save blackout");
    }
  };

  const handleEdit = (blackout) => {
    setEditingBlackout(blackout);
    setFormData({
      type: blackout.type,
      selectedDates: blackout.dates || [],
      startDate: blackout.startDate || "",
      endDate: blackout.endDate || "",
      blockedSlots: blackout.blockedSlots || [],
      reason: blackout.reason,
      recurringType: blackout.recurringType || "weekly",
      recurringDay: blackout.recurringDay || 0,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blackout?"))
      return;

    try {
      await deleteDoc(doc(db, "businessSettings", id));
      showSuccess("Blackout deleted successfully");
      fetchBlackouts();
    } catch (error) {
      console.error("Error deleting blackout:", error);
      showError("Failed to delete blackout");
    }
  };

  const formatDateDisplay = (dateKey) => {
    const [year, month, day] = dateKey.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderBlackoutItem = (blackout) => {
    let displayText = "";
    let datesList = [];

    if (blackout.type === "full_day") {
      displayText = `Full Day - ${blackout.dates?.length || 0} date(s)`;
      datesList = blackout.dates || [];
    } else if (blackout.type === "time_slots") {
      displayText = `Time Slots - ${blackout.dates?.length || 0} date(s), ${
        blackout.blockedSlots?.length || 0
      } slot(s)`;
      datesList = blackout.dates || [];
    } else if (blackout.type === "date_range") {
      displayText = `Range: ${formatDateDisplay(
        blackout.startDate
      )} to ${formatDateDisplay(blackout.endDate)}`;
    } else if (blackout.type === "recurring") {
      displayText = `Every ${DAYS_OF_WEEK[blackout.recurringDay]}`;
    }

    return (
      <div
        key={blackout.id}
        className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  blackout.type === "full_day"
                    ? "bg-red-900/50 text-red-300"
                    : blackout.type === "time_slots"
                    ? "bg-yellow-900/50 text-yellow-300"
                    : blackout.type === "date_range"
                    ? "bg-orange-900/50 text-orange-300"
                    : "bg-purple-900/50 text-purple-300"
                }`}
              >
                {blackout.type.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <p className="text-white font-medium mb-1">{displayText}</p>
            <p className="text-gray-400 text-sm mb-2">{blackout.reason}</p>

            {/* Display selected dates for full_day and time_slots */}
            {(blackout.type === "full_day" || blackout.type === "time_slots") &&
              datesList.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 mb-2">
                  {datesList.slice(0, 5).map((dateKey) => (
                    <span
                      key={dateKey}
                      className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                    >
                      {formatDateDisplay(dateKey)}
                    </span>
                  ))}
                  {datesList.length > 5 && (
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
                      +{datesList.length - 5} more
                    </span>
                  )}
                </div>
              )}

            {blackout.type === "time_slots" && blackout.blockedSlots && (
              <div className="flex flex-wrap gap-1 mt-2">
                {blackout.blockedSlots.map((slot) => (
                  <span
                    key={slot}
                    className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                  >
                    {formatTime(slot)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(blackout)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit2 size={16} className="text-blue-400" />
            </button>
            <button
              onClick={() => handleDelete(blackout.id)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Trash2 size={16} className="text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Date & Time Blackouts</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={20} />
          Add Blackout
        </button>
      </div>

      {/* Blackouts List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : blackouts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
            <AlertCircle className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="text-gray-400">No blackouts configured yet</p>
          </div>
        ) : (
          blackouts.map(renderBlackoutItem)
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingBlackout ? "Edit Blackout" : "Add Blackout"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Blackout Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "full_day", label: "Full Day", icon: Calendar },
                    { value: "time_slots", label: "Time Slots", icon: Clock },
                    {
                      value: "date_range",
                      label: "Date Range",
                      icon: Calendar,
                    },
                    { value: "recurring", label: "Recurring", icon: Clock },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.type === value
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <Icon className="mx-auto mb-2" size={24} />
                      <div className="text-sm font-medium">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Day / Time Slots - Calendar Selection */}
              {(formData.type === "full_day" ||
                formData.type === "time_slots") && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Dates{" "}
                    {formData.selectedDates.length > 0 &&
                      `(${formData.selectedDates.length} selected)`}
                  </label>
                  <MiniCalendar
                    selectedDates={formData.selectedDates}
                    onDateSelect={handleDateSelect}
                    blockedDates={blackouts.filter(
                      (b) => b.type === "full_day" || b.type === "time_slots"
                    )}
                  />
                </div>
              )}

              {/* Time Slots Selection */}
              {formData.type === "time_slots" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Time Slots to Block{" "}
                    {formData.blockedSlots.length > 0 &&
                      `(${formData.blockedSlots.length} selected)`}
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleTimeSlotToggle(slot)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.blockedSlots.includes(slot)
                            ? "border-red-500 bg-red-500/20 text-red-300"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range */}
              {formData.type === "date_range" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Recurring */}
              {formData.type === "recurring" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Recurring Pattern
                  </label>
                  <select
                    value={formData.recurringDay}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        recurringDay: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={index} value={index}>
                        Every {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  placeholder="e.g., Company Holiday, Maintenance, Staff Training"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Save className="inline mr-2" size={20} />
                  {editingBlackout ? "Update" : "Save"} Blackout
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-800 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailabilitySettings;
