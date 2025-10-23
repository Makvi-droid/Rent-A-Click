import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  isWithinInterval,
} from "date-fns";

const Analytics = () => {
  const [dateRange, setDateRange] = useState("last30days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [analyticsData, setAnalyticsData] = useState({
    // Sales Data
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,

    // Product Performance
    topProducts: [],
    productsByCategory: [],
    lowStockProducts: [],

    // Customer Insights
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    customerGrowth: 0,
    topCustomers: [],

    // Time-based Analytics
    dailySales: [],
    monthlySales: [],
    hourlyDistribution: [],

    // Order Analytics
    ordersByStatus: [],
    paymentMethods: [],
    averageDeliveryTime: 0,

    // Trends
    revenueTrend: [],
    ordersTrend: [],
  });

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get date range
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        startDate = new Date(now.setDate(now.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "last7days":
        startDate = subDays(now, 7);
        endDate = now;
        break;
      case "last30days":
        startDate = subDays(now, 30);
        endDate = now;
        break;
      case "thisMonth":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "lastMonth":
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "thisYear":
        startDate = startOfYear(now);
        endDate = now;
        break;
      case "custom":
        startDate = customStartDate
          ? new Date(customStartDate)
          : subDays(now, 30);
        endDate = customEndDate ? new Date(customEndDate) : now;
        break;
      default:
        startDate = subDays(now, 30);
        endDate = now;
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    const unsubscribes = [];
    const { startDate, endDate } = getDateRange();

    // Listen to checkouts
    const checkoutsUnsubscribe = onSnapshot(
      collection(db, "checkouts"),
      (snapshot) => {
        const allCheckouts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Filter by date range
        const checkouts = allCheckouts.filter((checkout) =>
          isWithinInterval(checkout.createdAt, {
            start: startDate,
            end: endDate,
          })
        );

        // Calculate sales metrics
        const paidCheckouts = checkouts.filter(
          (c) => c.paymentStatus === "paid"
        );
        const totalRevenue = paidCheckouts.reduce(
          (sum, c) => sum + (c.pricing?.total || c.amount || 0),
          0
        );
        const totalOrders = checkouts.length;
        const averageOrderValue =
          totalOrders > 0 ? totalRevenue / paidCheckouts.length : 0;

        // Calculate growth (compare with previous period)
        const periodLength = Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        );
        const previousStart = subDays(startDate, periodLength);
        const previousCheckouts = allCheckouts.filter((c) =>
          isWithinInterval(c.createdAt, {
            start: previousStart,
            end: startDate,
          })
        );
        const previousRevenue = previousCheckouts
          .filter((c) => c.paymentStatus === "paid")
          .reduce((sum, c) => sum + (c.pricing?.total || c.amount || 0), 0);
        const revenueGrowth =
          previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        // Daily sales data
        const dailySalesMap = {};
        checkouts.forEach((checkout) => {
          const date = format(checkout.createdAt, "MMM dd");
          if (!dailySalesMap[date]) {
            dailySalesMap[date] = { date, revenue: 0, orders: 0 };
          }
          if (checkout.paymentStatus === "paid") {
            dailySalesMap[date].revenue +=
              checkout.pricing?.total || checkout.amount || 0;
          }
          dailySalesMap[date].orders += 1;
        });
        const dailySales = Object.values(dailySalesMap).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        // Orders by status
        const statusMap = {};
        checkouts.forEach((checkout) => {
          const status = checkout.status || "unknown";
          statusMap[status] = (statusMap[status] || 0) + 1;
        });
        const ordersByStatus = Object.entries(statusMap).map(
          ([status, count]) => ({
            status: status.charAt(0).toUpperCase() + status.slice(1),
            count,
            percentage: ((count / totalOrders) * 100).toFixed(1),
          })
        );

        // Payment methods
        const paymentMap = {};
        checkouts.forEach((checkout) => {
          const method = checkout.paymentMethod || "unknown";
          paymentMap[method] = (paymentMap[method] || 0) + 1;
        });
        const paymentMethods = Object.entries(paymentMap).map(
          ([method, count]) => ({
            method: method.charAt(0).toUpperCase() + method.slice(1),
            count,
            percentage: ((count / totalOrders) * 100).toFixed(1),
          })
        );

        // Top customers by spending
        const customerSpending = {};
        checkouts.forEach((checkout) => {
          if (checkout.paymentStatus === "paid") {
            const email =
              checkout.userEmail || checkout.customerInfo?.email || "Unknown";
            const amount = checkout.pricing?.total || checkout.amount || 0;
            customerSpending[email] = (customerSpending[email] || 0) + amount;
          }
        });
        const topCustomers = Object.entries(customerSpending)
          .map(([email, totalSpent]) => ({ email, totalSpent }))
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10);

        // Product performance from checkout items
        const productPerformance = {};
        checkouts.forEach((checkout) => {
          if (checkout.items && Array.isArray(checkout.items)) {
            checkout.items.forEach((item) => {
              const productName = item.name || item.productName || "Unknown";
              if (!productPerformance[productName]) {
                productPerformance[productName] = {
                  name: productName,
                  quantity: 0,
                  revenue: 0,
                };
              }
              productPerformance[productName].quantity += item.quantity || 1;
              if (checkout.paymentStatus === "paid") {
                productPerformance[productName].revenue +=
                  (item.price || 0) * (item.quantity || 1);
              }
            });
          }
        });
        const topProducts = Object.values(productPerformance)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        setAnalyticsData((prev) => ({
          ...prev,
          totalRevenue,
          totalOrders,
          averageOrderValue,
          revenueGrowth,
          dailySales,
          ordersByStatus,
          paymentMethods,
          topCustomers,
          topProducts,
        }));
      }
    );

    // Listen to customers
    const customersUnsubscribe = onSnapshot(
      collection(db, "customers"),
      (snapshot) => {
        const allCustomers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        const totalCustomers = allCustomers.length;
        const { startDate, endDate } = getDateRange();

        const newCustomers = allCustomers.filter((customer) =>
          isWithinInterval(customer.createdAt, {
            start: startDate,
            end: endDate,
          })
        ).length;

        // Calculate customer growth
        const periodLength = Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        );
        const previousStart = subDays(startDate, periodLength);
        const previousNewCustomers = allCustomers.filter((c) =>
          isWithinInterval(c.createdAt, {
            start: previousStart,
            end: startDate,
          })
        ).length;
        const customerGrowth =
          previousNewCustomers > 0
            ? ((newCustomers - previousNewCustomers) / previousNewCustomers) *
              100
            : 0;

        setAnalyticsData((prev) => ({
          ...prev,
          totalCustomers,
          newCustomers,
          customerGrowth,
        }));
      }
    );

    // Listen to products
    const productsUnsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Low stock products
        const lowStockProducts = products
          .filter((p) => p.stock <= 5 && p.stock > 0)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 10);

        // Products by category
        const categoryMap = {};
        products.forEach((product) => {
          const category = product.category || "Uncategorized";
          categoryMap[category] = (categoryMap[category] || 0) + 1;
        });
        const productsByCategory = Object.entries(categoryMap).map(
          ([category, count]) => ({
            category,
            count,
            percentage: ((count / products.length) * 100).toFixed(1),
          })
        );

        setAnalyticsData((prev) => ({
          ...prev,
          lowStockProducts,
          productsByCategory,
        }));
      }
    );

    unsubscribes.push(
      checkoutsUnsubscribe,
      customersUnsubscribe,
      productsUnsubscribe
    );
    setLoading(false);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [dateRange, customStartDate, customEndDate]);

  // Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const { startDate, endDate } = getDateRange();

    // Title
    doc.setFontSize(20);
    doc.text("Sales & Analytics Report", 14, 22);

    // Date range
    doc.setFontSize(12);
    doc.text(
      `Period: ${format(startDate, "MMM dd, yyyy")} - ${format(
        endDate,
        "MMM dd, yyyy"
      )}`,
      14,
      32
    );
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 40);

    let yPos = 50;

    // Summary Section
    doc.setFontSize(16);
    doc.text("Executive Summary", 14, yPos);
    yPos += 10;

    doc.autoTable({
      startY: yPos,
      head: [["Metric", "Value", "Growth"]],
      body: [
        [
          "Total Revenue",
          formatCurrency(analyticsData.totalRevenue),
          `${
            analyticsData.revenueGrowth > 0 ? "+" : ""
          }${analyticsData.revenueGrowth.toFixed(1)}%`,
        ],
        ["Total Orders", analyticsData.totalOrders.toString(), "-"],
        [
          "Average Order Value",
          formatCurrency(analyticsData.averageOrderValue),
          "-",
        ],
        ["Total Customers", analyticsData.totalCustomers.toString(), "-"],
        [
          "New Customers",
          analyticsData.newCustomers.toString(),
          `${
            analyticsData.customerGrowth > 0 ? "+" : ""
          }${analyticsData.customerGrowth.toFixed(1)}%`,
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Top Products
    doc.addPage();
    yPos = 20;
    doc.setFontSize(16);
    doc.text("Top 10 Products", 14, yPos);
    yPos += 10;

    doc.autoTable({
      startY: yPos,
      head: [["Product", "Quantity Sold", "Revenue"]],
      body: analyticsData.topProducts.map((p) => [
        p.name,
        p.quantity.toString(),
        formatCurrency(p.revenue),
      ]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Top Customers
    yPos = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text("Top 10 Customers", 14, yPos);
    yPos += 10;

    doc.autoTable({
      startY: yPos,
      head: [["Customer Email", "Total Spent"]],
      body: analyticsData.topCustomers.map((c) => [
        c.email,
        formatCurrency(c.totalSpent),
      ]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Order Status Distribution
    doc.addPage();
    yPos = 20;
    doc.setFontSize(16);
    doc.text("Order Status Distribution", 14, yPos);
    yPos += 10;

    doc.autoTable({
      startY: yPos,
      head: [["Status", "Count", "Percentage"]],
      body: analyticsData.ordersByStatus.map((s) => [
        s.status,
        s.count.toString(),
        `${s.percentage}%`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Low Stock Alert
    if (analyticsData.lowStockProducts.length > 0) {
      yPos = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.setTextColor(239, 68, 68); // Red color
      doc.text("Low Stock Alert", 14, yPos);
      doc.setTextColor(0, 0, 0); // Reset to black
      yPos += 10;

      doc.autoTable({
        startY: yPos,
        head: [["Product", "Stock Remaining"]],
        body: analyticsData.lowStockProducts.map((p) => [
          p.name,
          p.stock.toString(),
        ]),
        theme: "striped",
        headStyles: { fillColor: [239, 68, 68] },
      });
    }

    // Save PDF
    doc.save(`analytics-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const COLORS = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sales & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive business insights and reports
          </p>
        </div>
        <button
          onClick={generatePDFReport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Date Range:
            </span>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === "custom" && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analyticsData.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                {analyticsData.revenueGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    analyticsData.revenueGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {analyticsData.revenueGrowth >= 0 ? "+" : ""}
                  {analyticsData.revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analyticsData.totalOrders}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Avg: {formatCurrency(analyticsData.averageOrderValue)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analyticsData.totalCustomers}
              </p>
              <p className="text-sm text-green-600 mt-2">
                +{analyticsData.newCustomers} new
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Customer Growth
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analyticsData.customerGrowth >= 0 ? "+" : ""}
                {analyticsData.customerGrowth.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-2">vs previous period</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-4">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "products", label: "Products", icon: Package },
              { id: "customers", label: "Customers", icon: Users },
              { id: "orders", label: "Orders", icon: ShoppingCart },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Revenue Trend */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Revenue Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Orders Trend */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Orders Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Order Status & Payment Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Status
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analyticsData.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) =>
                          `${status} (${percentage}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.ordersByStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Methods
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analyticsData.paymentMethods}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="method" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Top Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Performing Products
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity Sold
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.topProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {product.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                      {analyticsData.topProducts.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No product data available for this period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Products by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.productsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) =>
                        `${category} (${percentage}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.productsByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Low Stock Alert */}
              {analyticsData.lowStockProducts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">
                      Low Stock Alert
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {analyticsData.lowStockProducts.map((product, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border border-red-200"
                      >
                        <p className="font-medium text-gray-900 text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Only {product.stock} remaining
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              {/* Customer Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    Total Customers
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {analyticsData.totalCustomers}
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900">
                    New Customers
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {analyticsData.newCustomers}
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-900">
                    Customer Growth
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {analyticsData.customerGrowth >= 0 ? "+" : ""}
                    {analyticsData.customerGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Top Customers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Customers by Spending
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Spent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.topCustomers.map((customer, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatCurrency(customer.totalSpent)}
                          </td>
                        </tr>
                      ))}
                      {analyticsData.topCustomers.length === 0 && (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No customer data available for this period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Insights */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Average Customer Value
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {analyticsData.totalCustomers > 0
                        ? formatCurrency(
                            analyticsData.totalRevenue /
                              analyticsData.totalCustomers
                          )
                        : formatCurrency(0)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Orders per Customer</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {analyticsData.totalCustomers > 0
                        ? (
                            analyticsData.totalOrders /
                            analyticsData.totalCustomers
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Order Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analyticsData.totalOrders}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">
                    Completed Orders
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {analyticsData.ordersByStatus.find(
                      (s) => s.status === "Completed"
                    )?.count || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">
                    Pending Orders
                  </p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {analyticsData.ordersByStatus.find(
                      (s) => s.status === "Pending"
                    )?.count || 0}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Order Value
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {formatCurrency(analyticsData.averageOrderValue)}
                  </p>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.ordersByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Methods Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analyticsData.paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percentage }) =>
                          `${method} (${percentage}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.paymentMethods.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="flex items-center justify-center">
                    <div className="space-y-3 w-full">
                      {analyticsData.paymentMethods.map((method, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">
                              {method.method}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {method.count}
                            </p>
                            <p className="text-xs text-gray-500">
                              {method.percentage}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Orders */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Daily Orders
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Revenue Summary</h3>
            <DollarSign className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {formatCurrency(analyticsData.totalRevenue)}
          </p>
          <p className="text-blue-100 text-sm">
            {analyticsData.totalOrders} orders •{" "}
            {formatCurrency(analyticsData.averageOrderValue)} avg
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Customer Summary</h3>
            <Users className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {analyticsData.totalCustomers}
          </p>
          <p className="text-green-100 text-sm">
            +{analyticsData.newCustomers} new •{" "}
            {analyticsData.customerGrowth.toFixed(1)}% growth
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Product Summary</h3>
            <Package className="h-8 w-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-2">
            {analyticsData.topProducts.length}
          </p>
          <p className="text-purple-100 text-sm">
            {analyticsData.lowStockProducts.length} low stock alerts
          </p>
        </div>
      </div>

      {/* Export Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Export Your Report
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Click the "Export PDF" button above to download a comprehensive
              report including all analytics data, top products, top customers,
              order statistics, and low stock alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
