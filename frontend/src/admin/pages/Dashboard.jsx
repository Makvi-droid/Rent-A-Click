import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

// Import new real-time components
import RealtimeStats from "../Dashboard/RealtimeStats";
import RealtimeActivity from "../Dashboard/RealtimeActivity";
import RealtimeCharts from "../Dashboard/RealtimeCharts";
import RealtimeNotifications from "../Dashboard/RealtimeNotifications";

const Dashboard = () => {
  const [user, loading, error] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please sign in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <RealtimeStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RealtimeActivity />
              <RealtimeCharts />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <RealtimeStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RealtimeActivity />
              <RealtimeCharts />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="flex-1">
          {/* Real-time notifications */}
          <RealtimeNotifications />

          <main className="p-6">{renderActiveComponent()}</main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
