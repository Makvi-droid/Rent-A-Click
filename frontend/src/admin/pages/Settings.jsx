import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Camera,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { toast } from "react-hot-toast";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { createAuditLog } from "../../utils/auditLogger";
//import bcrypt from "bcryptjs";

const Settings = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: null,
    profileImageUrl: "",
    roleId: "",
    roleName: "",
    employeeId: "",
  });

  // Security data state
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  // Notification preferences state
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    orderNotifications: true,
    systemNotifications: true,
    marketingEmails: false,
  });

  // Load admin/employee data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Check if user is admin
      const adminRef = doc(db, "admin", user.uid);
      const adminDoc = await getDoc(adminRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        setProfileData((prev) => ({
          ...prev,
          firstName: adminData.firstName || "",
          lastName: adminData.lastName || "",
          email: adminData.email || user.email,
          phone: adminData.phone || "",
          profileImageUrl: adminData.profileImage || "",
          roleId: "admin",
          roleName: "Administrator",
          employeeId: "ADMIN",
        }));

        // Load notification preferences if they exist
        if (adminData.notificationPreferences) {
          setNotificationData(adminData.notificationPreferences);
        }
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
        if (employeeData.roleId) {
          const roleDoc = await getDoc(doc(db, "roles", employeeData.roleId));
          if (roleDoc.exists()) {
            roleName = roleDoc.data().name;
          }
        }

        setProfileData((prev) => ({
          ...prev,
          firstName: employeeData.firstName || "",
          lastName: employeeData.lastName || "",
          email: employeeData.email || user.email,
          phone: employeeData.phone || "",
          profileImageUrl: employeeData.profileImage || "",
          roleId: employeeData.roleId || "",
          roleName: roleName,
          employeeId: employeeData.employeeId || "",
        }));

        // Load notification preferences if they exist
        if (employeeData.notificationPreferences) {
          setNotificationData(employeeData.notificationPreferences);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setProfileData((prev) => ({ ...prev, profileImage: file }));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setUploadProgress("");

    try {
      let profileImageUrl = profileData.profileImageUrl;

      // Upload new profile image if selected
      if (profileData.profileImage instanceof File) {
        setUploadProgress("Uploading profile image...");
        const result = await uploadToCloudinary(
          profileData.profileImage,
          `admin-profiles/${user.uid}`
        );
        profileImageUrl = result.url;
      }

      setUploadProgress("Saving profile...");

      // Check if admin or employee
      const adminRef = doc(db, "admin", user.uid);
      const adminDoc = await getDoc(adminRef);

      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        profileImage: profileImageUrl,
        updatedAt: new Date(),
      };

      if (adminDoc.exists()) {
        await updateDoc(adminRef, updateData);
      } else {
        // Update employee document
        const employeesRef = collection(db, "employees");
        const q = query(employeesRef, where("firebaseUid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const employeeDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, "employees", employeeDoc.id), updateData);
        }
      }

      await createAuditLog({
        action: "UPDATE_PROFILE",
        target: "admin_settings",
        targetId: user.uid,
        details: { fields: Object.keys(updateData) },
      });

      setUploadProgress("");
      toast.success("Profile updated successfully!");

      // Reload data
      await loadUserData();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
      setUploadProgress("");
    }
  };

  const handleSavePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (securityData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSaving(true);

    try {
      // Import required Firebase Auth functions
      const {
        EmailAuthProvider,
        reauthenticateWithCredential,
        updatePassword,
      } = await import("firebase/auth");

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        securityData.currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Update Firebase Auth password
      await updatePassword(user, securityData.newPassword);

      // Update employee document to mark password change as complete
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("firebaseUid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const employeeDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "employees", employeeDoc.id), {
          passwordChangeRequired: false,
          lastPasswordChange: new Date(),
          updatedAt: new Date(),
        });
      }

      await createAuditLog({
        action: "CHANGE_PASSWORD",
        target: "security",
        targetId: user.uid,
        details: { success: true },
      });

      toast.success(
        "Password changed successfully! You can now use your new password to log in."
      );

      // Clear password fields
      setSecurityData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Error changing password:", error);

      let errorMessage = "Failed to change password";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "New password is too weak. Please use a stronger password.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage =
          "For security, please log out and log back in before changing your password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);

    try {
      const adminRef = doc(db, "admin", user.uid);
      const adminDoc = await getDoc(adminRef);

      const updateData = {
        notificationPreferences: notificationData,
        updatedAt: new Date(),
      };

      if (adminDoc.exists()) {
        await updateDoc(adminRef, updateData);
      } else {
        const employeesRef = collection(db, "employees");
        const q = query(employeesRef, where("firebaseUid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const employeeDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, "employees", employeeDoc.id), updateData);
        }
      }

      await createAuditLog({
        action: "UPDATE_NOTIFICATIONS",
        target: "settings",
        targetId: user.uid,
        details: notificationData,
      });

      toast.success("Notification preferences saved!");
    } catch (error) {
      console.error("Error saving notifications:", error);
      toast.error("Failed to save notification preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Profile Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your account profile information
              </p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {profileData.profileImageUrl || profileData.profileImage ? (
                      <img
                        src={
                          profileData.profileImage instanceof File
                            ? URL.createObjectURL(profileData.profileImage)
                            : profileData.profileImageUrl
                        }
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Employee/Admin Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={profileData.employeeId}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profileData.roleName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed. Contact system administrator.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-700">{uploadProgress}</p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleSaveProfile}
                  disabled={
                    isSaving || !profileData.firstName || !profileData.lastName
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Security Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your password and security preferences
              </p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={
                      securityData.showCurrentPassword ? "text" : "password"
                    }
                    value={securityData.currentPassword}
                    onChange={(e) =>
                      setSecurityData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSecurityData((prev) => ({
                        ...prev,
                        showCurrentPassword: !prev.showCurrentPassword,
                      }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  >
                    {securityData.showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={securityData.showNewPassword ? "text" : "password"}
                    value={securityData.newPassword}
                    onChange={(e) =>
                      setSecurityData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSecurityData((prev) => ({
                        ...prev,
                        showNewPassword: !prev.showNewPassword,
                      }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  >
                    {securityData.showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase,
                  number, and special character
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={
                      securityData.showConfirmPassword ? "text" : "password"
                    }
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      setSecurityData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSecurityData((prev) => ({
                        ...prev,
                        showConfirmPassword: !prev.showConfirmPassword,
                      }))
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  >
                    {securityData.showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {securityData.newPassword && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Password Strength
                  </p>
                  <div className="space-y-1 text-xs">
                    <div
                      className={
                        securityData.newPassword.length >= 8
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✓ At least 8 characters
                    </div>
                    <div
                      className={
                        /[A-Z]/.test(securityData.newPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✓ Uppercase letter
                    </div>
                    <div
                      className={
                        /[a-z]/.test(securityData.newPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✓ Lowercase letter
                    </div>
                    <div
                      className={
                        /[0-9]/.test(securityData.newPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✓ Number
                    </div>
                    <div
                      className={
                        /[!@#$%^&*]/.test(securityData.newPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      ✓ Special character
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleSavePassword}
                  disabled={
                    isSaving ||
                    !securityData.currentPassword ||
                    !securityData.newPassword ||
                    !securityData.confirmPassword ||
                    securityData.newPassword !== securityData.confirmPassword
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Notification Preferences
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose how you want to be notified about important updates
              </p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Email Notifications */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationData.emailNotifications}
                    onChange={(e) =>
                      setNotificationData((prev) => ({
                        ...prev,
                        emailNotifications: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive email notifications for important system updates
                  </p>
                </div>
              </div>

              {/* Order Notifications */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationData.orderNotifications}
                    onChange={(e) =>
                      setNotificationData((prev) => ({
                        ...prev,
                        orderNotifications: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    Order & Rental Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Get notified about new orders, returns, and rental updates
                  </p>
                </div>
              </div>

              {/* System Notifications */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationData.systemNotifications}
                    onChange={(e) =>
                      setNotificationData((prev) => ({
                        ...prev,
                        systemNotifications: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    System Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive alerts about system maintenance and critical updates
                  </p>
                </div>
              </div>

              {/* Marketing Emails */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={notificationData.marketingEmails}
                    onChange={(e) =>
                      setNotificationData((prev) => ({
                        ...prev,
                        marketingEmails: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700">
                    Marketing & Updates
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive news about new features and company updates
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
