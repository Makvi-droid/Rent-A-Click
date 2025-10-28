import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  User,
  Shield,
  Briefcase,
  Package,
  DollarSign,
  Truck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  limit,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

const Header = ({ setIsOpen }) => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [currentUser, setCurrentUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load user data from Firebase
  useEffect(() => {
    if (user) {
      loadUserData();
      const unsubscribe = loadNotifications();
      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // First check if user is admin
      const adminRef = doc(db, "admin", user.uid);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();

        setCurrentUser({
          uid: user.uid,
          email: adminData.email || user.email,
          firstName: adminData.firstName || "Admin",
          lastName: adminData.lastName || "User",
          name: `${adminData.firstName || "Admin"} ${
            adminData.lastName || "User"
          }`,
          role: "admin",
          roleName: "Administrator",
          avatar:
            adminData.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              adminData.firstName || "Admin"
            )}+${encodeURIComponent(
              adminData.lastName || "User"
            )}&background=6366f1&color=fff&bold=true`,
          department: "Administration",
          employeeId: "ADMIN",
          phone: adminData.phone || "",
          joinDate: adminData.createdAt?.toDate() || new Date(),
        });
        return;
      }

      // If not admin, check employees collection
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("firebaseUid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const employeeDoc = querySnapshot.docs[0];
        const employeeData = employeeDoc.data();

        // Get role information
        let roleName = "Employee";
        let roleType = "employee";

        if (employeeData.roleId) {
          try {
            const roleDoc = await getDoc(doc(db, "roles", employeeData.roleId));
            if (roleDoc.exists()) {
              const roleData = roleDoc.data();
              roleName = roleData.name;
              roleType = roleData.name.toLowerCase();
            }
          } catch (error) {
            console.error("Error fetching role:", error);
          }
        }

        setCurrentUser({
          uid: user.uid,
          email: employeeData.email || user.email,
          firstName: employeeData.firstName || "",
          lastName: employeeData.lastName || "",
          name:
            `${employeeData.firstName || ""} ${
              employeeData.lastName || ""
            }`.trim() || employeeData.email,
          role: roleType,
          roleName: roleName,
          avatar:
            employeeData.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              employeeData.firstName || "User"
            )}+${encodeURIComponent(
              employeeData.lastName || ""
            )}&background=6366f1&color=fff&bold=true`,
          department: roleName,
          employeeId: employeeData.employeeId || "N/A",
          phone: employeeData.phone || "",
          joinDate: employeeData.createdAt?.toDate() || new Date(),
        });
      } else {
        // If neither admin nor employee, create a basic user object
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(" ")[0] || "User",
          lastName: user.displayName?.split(" ")[1] || "",
          name: user.displayName || user.email,
          role: "user",
          roleName: "User",
          avatar:
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.email
            )}&background=6366f1&color=fff&bold=true`,
          department: "General",
          employeeId: "N/A",
          phone: "",
          joinDate: new Date(),
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Create fallback user object
      setCurrentUser({
        uid: user.uid,
        email: user.email,
        firstName: "User",
        lastName: "",
        name: user.email,
        role: "user",
        roleName: "User",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.email
        )}&background=6366f1&color=fff&bold=true`,
        department: "General",
        employeeId: "N/A",
        phone: "",
        joinDate: new Date(),
      });
    }
  };

  const loadNotifications = () => {
    try {
      // Set up real-time listener for notifications
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notifs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            time: formatNotificationTime(doc.data().createdAt?.toDate()),
          }));

          setNotifications(notifs);
          setUnreadCount(notifs.filter((n) => !n.read).length);
        },
        (error) => {
          console.error("Error loading notifications:", error);
          setDemoNotifications();
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up notifications listener:", error);
      setDemoNotifications();
      return null;
    }
  };

  const setDemoNotifications = () => {
    const demoNotifications = [
      {
        id: "1",
        message: "Welcome to the admin dashboard!",
        time: "Just now",
        type: "info",
        read: false,
      },
      {
        id: "2",
        message: "New rental request received",
        time: "5 min ago",
        type: "success",
        read: false,
      },
      {
        id: "3",
        message: "Low inventory alert",
        time: "15 min ago",
        type: "warning",
        read: false,
      },
    ];

    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter((n) => !n.read).length);
  };

  const formatNotificationTime = (date) => {
    if (!date) return "Just now";

    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hour${
        Math.floor(diff / 3600) > 1 ? "s" : ""
      } ago`;
    if (diff < 604800)
      return `${Math.floor(diff / 86400)} day${
        Math.floor(diff / 86400) > 1 ? "s" : ""
      } ago`;
    return date.toLocaleDateString();
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: Shield,
      administrator: Shield,
      manager: Briefcase,
      inventory: Package,
      sales: DollarSign,
      logistics: Truck,
    };
    return icons[role] || User;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "text-purple-600 bg-purple-100",
      administrator: "text-purple-600 bg-purple-100",
      manager: "text-blue-600 bg-blue-100",
      inventory: "text-green-600 bg-green-100",
      sales: "text-orange-600 bg-orange-100",
      logistics: "text-indigo-600 bg-indigo-100",
    };
    return colors[role] || "text-gray-600 bg-gray-100";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = notifications
        .filter((n) => !n.read)
        .map((n) => updateDoc(doc(db, "notifications", n.id), { read: true }));

      await Promise.all(batch);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading || !currentUser) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-10"></div>
            <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-80"></div>
          </div>
          <div className="animate-pulse bg-gray-200 rounded-full h-12 w-32"></div>
        </div>
      </header>
    );
  }

  const RoleIcon = getRoleIcon(currentUser.role);

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-30 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
          >
            <Menu className="h-5 w-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Date and Time Display */}
          <div className="hidden md:flex items-center space-x-4 px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {formatDate(currentTime)}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden xl:flex items-center space-x-3 ml-4">
            <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 group relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <p className="text-xs text-gray-500">
                        {unreadCount} unread message
                        {unreadCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                          No notifications yet
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          You're all caught up!
                        </p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/dashboard/notifications");
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl px-4 py-2.5 border border-gray-100 ml-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  currentUser.name
                )}&background=6366f1&color=fff&bold=true`;
              }}
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.name}
              </p>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                    currentUser.role
                  )}`}
                >
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {currentUser.roleName}
                </span>
                {currentUser.employeeId && currentUser.employeeId !== "N/A" && (
                  <span className="text-xs text-gray-500">
                    {currentUser.employeeId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
