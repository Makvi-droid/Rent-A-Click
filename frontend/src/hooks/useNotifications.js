// hooks/useNotifications.js
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { checkRentalDueReminders } from "../services/rentalReminderService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [customerId, setCustomerId] = useState(null);
  const [user] = useAuthState(auth);

  // Fetch customerId from firebaseUid
  useEffect(() => {
    const fetchCustomerId = async () => {
      if (!user) {
        setCustomerId(null);
        setLoading(false);
        return;
      }

      try {
        console.log("🔑 Fetching customer ID for firebaseUid:", user.uid);

        const customersRef = collection(db, "customers");
        const q = query(
          customersRef,
          where("firebaseUid", "==", user.uid),
          limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const customerDoc = querySnapshot.docs[0];
          const id = customerDoc.id;
          setCustomerId(id);
          console.log("🔑 Customer ID found:", id);
        } else {
          console.warn("🔑 No customer document found for user:", user.uid);
          setCustomerId(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("🔑 Error fetching customer ID:", error);
        setCustomerId(null);
        setLoading(false);
      }
    };

    fetchCustomerId();
  }, [user]);

  // Setup notifications listener
  useEffect(() => {
    if (!customerId) {
      setNotifications([]);
      setUnreadCount(0);
      if (!user) {
        setLoading(false);
      }
      return;
    }

    console.log(
      "🔥 Setting up notifications listener for customer:",
      customerId
    );

    // Create real-time listener for customer's notifications
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("customerId", "==", customerId), // CHANGED: from userId to customerId
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "🔥 SNAPSHOT TRIGGERED - Total docs:",
          snapshot.docs.length
        );
        console.log("🔥 Snapshot metadata:", {
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          fromCache: snapshot.metadata.fromCache,
        });

        // Log document changes specifically
        snapshot.docChanges().forEach((change) => {
          console.log(`🔥 DOC CHANGE: ${change.type} - ID: ${change.doc.id}`);
          console.log("🔥 DOC DATA:", change.doc.data());
          if (change.type === "modified") {
            console.log("🔥 MODIFIED FIELDS:", change.doc.data());
          }
        });

        const notificationsList = [];
        let unreadCounter = 0;

        snapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          notificationsList.push(data);

          if (!data.isRead) {
            unreadCounter++;
          }
        });

        console.log(
          `🔥 FINAL STATE: ${notificationsList.length} notifications, ${unreadCounter} unread`
        );
        console.log(
          "🔥 NOTIFICATIONS LIST:",
          notificationsList.map((n) => ({
            id: n.id,
            title: n.title,
            isRead: n.isRead,
          }))
        );

        setNotifications(notificationsList);
        setUnreadCount(unreadCounter);
        setLoading(false);
      },
      (error) => {
        console.error("🔥 LISTENER ERROR:", error);
        setLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      console.log("🔥 Cleaning up notifications listener");
      unsubscribe();
    };
  }, [customerId]);

  // Setup rental reminder checker
  useEffect(() => {
    if (!customerId) return;

    console.log(
      "⏰ Setting up rental reminder checker for customer:",
      customerId
    );

    // Check reminders immediately when hook mounts
    checkRentalDueReminders(customerId).catch((error) => {
      console.error("⏰ Error checking initial reminders:", error);
    });

    // Check reminders every 30 minutes while app is open
    const reminderInterval = setInterval(() => {
      console.log("⏰ Running periodic rental reminder check...");
      checkRentalDueReminders(customerId).catch((error) => {
        console.error("⏰ Error in periodic reminder check:", error);
      });
    }, 30 * 60 * 1000); // 30 minutes

    // Cleanup interval on component unmount
    return () => {
      console.log("⏰ Cleaning up rental reminder checker");
      clearInterval(reminderInterval);
    };
  }, [customerId]);

  // Mark notification as read OR unread (toggle functionality)
  const markAsRead = async (notificationId) => {
    try {
      console.log("🔥 MARK AS READ CALLED - ID:", notificationId);

      // Find the notification to check current read status
      const notification = notifications.find((n) => n.id === notificationId);
      if (!notification) {
        console.error("🔥 NOTIFICATION NOT FOUND:", notificationId);
        console.log(
          "🔥 AVAILABLE NOTIFICATIONS:",
          notifications.map((n) => n.id)
        );
        return;
      }

      console.log("🔥 CURRENT NOTIFICATION STATE:", {
        id: notification.id,
        isRead: notification.isRead,
        title: notification.title,
      });

      const notificationRef = doc(db, "notifications", notificationId);
      const newReadStatus = !notification.isRead;

      console.log("🔥 UPDATING TO NEW STATUS:", newReadStatus);

      await updateDoc(notificationRef, {
        isRead: newReadStatus,
        [newReadStatus ? "readAt" : "unreadAt"]: serverTimestamp(),
      });

      console.log("🔥 FIREBASE UPDATE COMPLETED - should trigger listener now");
      console.log(
        `🔥 Successfully ${
          newReadStatus ? "marked as read" : "marked as unread"
        }`
      );
    } catch (error) {
      console.error("🔥 ERROR toggling notification read status:", error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      console.log("🔥 MARK ALL AS READ CALLED");

      const unreadNotifications = notifications.filter((n) => !n.isRead);
      console.log(
        `🔥 Found ${unreadNotifications.length} unread notifications`
      );

      if (unreadNotifications.length === 0) {
        console.log("🔥 No unread notifications to mark");
        return;
      }

      const updatePromises = unreadNotifications.map((notification) => {
        console.log("🔥 Marking as read:", notification.id);
        const notificationRef = doc(db, "notifications", notification.id);
        return updateDoc(notificationRef, {
          isRead: true,
          readAt: serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);
      console.log(
        "🔥 ALL NOTIFICATIONS MARKED AS READ - should trigger listener"
      );
    } catch (error) {
      console.error("🔥 ERROR marking all notifications as read:", error);
      throw error;
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    customerId, // Export customerId for other components
    markAsRead,
    markAllAsRead,
  };
};
