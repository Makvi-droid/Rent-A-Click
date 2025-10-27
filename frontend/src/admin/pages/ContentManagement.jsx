import React, { useState } from "react";
import CheckoutSettings from "../ContentManagement/CheckoutSettings";

function ContentManagement() {
  const [activeTab, setActiveTab] = useState("checkout");
  const [checkoutSubTab, setCheckoutSubTab] = useState("availability");

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Content Management</h1>
          <p className="text-gray-400">
            Manage your website content and settings
          </p>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("checkout")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "checkout"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Checkout Settings
          </button>
          <button
            onClick={() => setActiveTab("website")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "website"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Website Content
          </button>
          <button
            onClick={() => setActiveTab("other")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "other"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Other Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "checkout" && (
          <CheckoutSettings
            activeSubTab={checkoutSubTab}
            setActiveSubTab={setCheckoutSubTab}
          />
        )}

        {activeTab === "website" && (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-gray-400">
              Website content management features coming soon...
            </p>
          </div>
        )}

        {activeTab === "other" && (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-gray-400">Other settings coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentManagement;
