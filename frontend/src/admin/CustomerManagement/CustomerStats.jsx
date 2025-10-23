import React from "react";
import { Users, UserCheck, UserX, Activity } from "lucide-react";

const CustomerStats = ({ customers }) => {
  const stats = {
    total: customers.length,
    active: customers.filter((c) => (c.accountStatus || "active") === "active")
      .length,
    suspended: customers.filter((c) => c.accountStatus === "suspended").length,
  };

  const statCards = [
    {
      label: "Total Customers",
      value: stats.total,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
    },
    {
      label: "Active",
      value: stats.active,
      icon: UserCheck,
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
    },
    {
      label: "Suspended",
      value: stats.suspended,
      icon: UserX,
      gradient: "from-red-500 to-rose-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bg} ${stat.border} border backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default CustomerStats;
