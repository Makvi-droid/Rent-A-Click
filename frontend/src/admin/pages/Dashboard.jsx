import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";

// Import components
import RealtimeStats from "../Dashboard/RealtimeStats";
import RealtimeActivity from "../Dashboard/RealtimeActivity";
import RealtimeCharts from "../Dashboard/RealtimeCharts";
import RealtimeNotifications from "../Dashboard/RealtimeNotifications";
import NotificationsTab from "./NotificationsTab";
import { NotificationsProvider } from "./NotificationsContext";

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
      case "notifications":
        return <NotificationsTab />;
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
    <NotificationsProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <div className="flex-1">
            {/* Real-time notifications bell */}
            <RealtimeNotifications />

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "overview"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "notifications"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Notifications
                </button>
              </div>
            </div>

            <main className="p-6">{renderActiveComponent()}</main>
          </div>
        </div>
      </div>
    </NotificationsProvider>
  );
};

export default Dashboard;
