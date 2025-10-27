import React from "react";
import { Calendar } from "lucide-react";
import AvailabilitySettings from "./AvailabilitySettings";

function CheckoutSettings({ activeSubTab, setActiveSubTab }) {
  return (
    <div>
      {/* Sub Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSubTab("availability")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSubTab === "availability"
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Calendar className="inline mr-2" size={16} />
          Availability Settings
        </button>
        {/* Add more sub-tab buttons here as needed */}
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === "availability" && <AvailabilitySettings />}
      {/* Add more sub-tab content components here as needed */}
    </div>
  );
}

export default CheckoutSettings;
