import React from "react";
import { Camera, Wrench, Clock } from "lucide-react";

export default function DevSection({
  sectionName = "This Section",
  estimatedCompletion = "Coming Soon",
  features = [],
  showAnimation = true,
}) {
  return (
    <div className="min-h-[400px] w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-lg border-2 border-dashed border-slate-700">
      <div className="text-center max-w-2xl">
        {/* Icon */}
        <div className="relative inline-block mb-6">
          <div
            className={`bg-blue-600 rounded-full p-6 ${
              showAnimation ? "animate-pulse" : ""
            }`}
          >
            <Wrench className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-2">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-3">
          {sectionName} In Development
        </h2>

        {/* Subtitle */}
        <p className="text-slate-300 text-lg mb-6">
          We're working hard to bring you this feature for Rent-A-Click
        </p>

        {/* Estimated Completion */}
        {estimatedCompletion && (
          <div className="inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-700 mb-8">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-200">
              Expected: {estimatedCompletion}
            </span>
          </div>
        )}

        {/* Features List */}
        {features.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700 mt-8">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
              Planned Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-left p-2 rounded hover:bg-slate-700 transition-colors"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  <span className="text-sm text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <p className="text-xs text-slate-500 mt-8 italic">
          This is a placeholder component for development purposes
        </p>
      </div>
    </div>
  );
}
