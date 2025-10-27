import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Clock,
  Gift,
  Tag,
  Calendar,
  Zap,
  AlertCircle,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function PromotionsManagement() {
  const [promotions, setPromotions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    description: "",
    code: "",
    isActive: true,
    priority: 1,
    startDate: "",
    endDate: "",
    showTimer: true,
  });

  useEffect(() => {
    const q = query(collection(db, "promotions"), orderBy("priority", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const promoData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPromotions(promoData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching promotions:", err);
        setError("Failed to load promotions");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (
      !formData.title ||
      !formData.discount ||
      !formData.description ||
      !formData.code
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate dates if both are provided
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        setError("End date must be after start date");
        return;
      }
    }

    try {
      if (editingPromotion) {
        await updateDoc(doc(db, "promotions", editingPromotion.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "promotions"), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving promotion:", err);
      setError("Failed to save promotion");
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      discount: promotion.discount,
      description: promotion.description,
      code: promotion.code,
      isActive: promotion.isActive === true,
      priority: promotion.priority,
      startDate: promotion.startDate || "",
      endDate: promotion.endDate || "",
      showTimer: promotion.showTimer !== false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      await deleteDoc(doc(db, "promotions", id));
    } catch (err) {
      console.error("Error deleting promotion:", err);
      setError("Failed to delete promotion");
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === true ? false : true;
      await updateDoc(doc(db, "promotions", id), {
        isActive: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error toggling promotion status:", err);
      setError("Failed to update promotion status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      discount: "",
      description: "",
      code: "",
      isActive: true,
      priority: 1,
      startDate: "",
      endDate: "",
      showTimer: true,
    });
    setEditingPromotion(null);
    setError("");
  };

  // Get status for display in management interface
  const getPromotionStatus = (promo) => {
    // Manually disabled
    if (promo.isActive !== true) {
      return { label: "Inactive", color: "gray" };
    }

    // No dates set - active
    if (!promo.startDate || !promo.endDate) {
      return { label: "Active", color: "green" };
    }

    const now = new Date();
    const start = new Date(promo.startDate + "T00:00:00");
    const end = new Date(promo.endDate + "T23:59:59");

    // Check if currently live
    if (now >= start && now <= end) {
      return { label: "Active", color: "green" };
    }

    // Scheduled for future
    if (now < start) {
      return { label: "Scheduled", color: "blue" };
    }

    // Expired
    if (now > end) {
      return { label: "Expired", color: "yellow" };
    }

    return { label: "Inactive", color: "gray" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-600" />
                Promotions Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage promotional offers for customers
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Promotion
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => {
            const status = getPromotionStatus(promo);
            const statusColors = {
              green: "border-green-200 bg-green-50/30",
              blue: "border-blue-200 bg-blue-50/30",
              yellow: "border-yellow-200 bg-yellow-50/30",
              gray: "border-gray-200",
            };
            const badgeColors = {
              green: "bg-green-100 text-green-800",
              blue: "bg-blue-100 text-blue-800",
              yellow: "bg-yellow-100 text-yellow-800",
              gray: "bg-gray-100 text-gray-800",
            };

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                  statusColors[status.color]
                }`}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-5 h-5 text-purple-600" />
                        <h3 className="text-xl font-bold text-gray-900">
                          {promo.title}
                        </h3>
                      </div>
                      <div className="text-3xl font-black text-purple-600 mb-2">
                        {promo.discount}
                      </div>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        badgeColors[status.color]
                      }`}
                    >
                      {status.label}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {promo.description}
                  </p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Code:</span>
                      <span className="font-mono font-bold text-purple-600">
                        {promo.code}
                      </span>
                    </div>
                  </div>

                  {promo.startDate && promo.endDate && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(promo.startDate).toLocaleDateString()} -{" "}
                          {new Date(promo.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {status.label === "Scheduled" && (
                        <p className="text-xs text-blue-600 font-medium">
                          Starts on{" "}
                          {new Date(promo.startDate).toLocaleDateString()}
                        </p>
                      )}
                      {status.label === "Expired" && (
                        <p className="text-xs text-yellow-600 font-medium">
                          Ended on{" "}
                          {new Date(promo.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Priority:</span>
                    <span className="font-semibold text-gray-700">
                      {promo.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(promo.id, promo.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        promo.isActive === true
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      title={
                        promo.isActive === true
                          ? "Disable (hide from customers)"
                          : "Enable (show to customers if dates match)"
                      }
                    >
                      {promo.isActive === true ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleEdit(promo)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {promotions.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No promotions yet</p>
              <p className="text-gray-400 text-sm">
                Create your first promotion to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPromotion ? "Edit Promotion" : "Create New Promotion"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-900" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Promotion Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="e.g., WEEKEND SPECIAL"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Text *
                </label>
                <input
                  type="text"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="e.g., 40% OFF"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white resize-none"
                  rows={3}
                  placeholder="e.g., All DSLR cameras for weekend creators"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Promo Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-gray-900 bg-white"
                  placeholder="e.g., WEEKEND40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Priority
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700 block">
                      Enabled (visible to customers)
                    </span>
                    <span className="text-xs text-gray-500">
                      Promotion will show if dates match (if set)
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showTimer}
                    onChange={(e) =>
                      setFormData({ ...formData, showTimer: e.target.checked })
                    }
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Show countdown timer
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  <Save className="w-5 h-5" />
                  {editingPromotion ? "Update Promotion" : "Create Promotion"}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
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
