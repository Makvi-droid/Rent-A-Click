// ========================================
// components/Admin/Contact/ContactStats.jsx
// ========================================
import React from "react";
import { Inbox, Clock, CheckCircle, MessageSquare } from "lucide-react";

const ContactStats = ({ stats }) => {
  const statCards = [
    {
      label: "Total Inquiries",
      value: stats.total,
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Inbox,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-xl rounded-xl p-6 transition-all duration-300 hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ContactStats;
