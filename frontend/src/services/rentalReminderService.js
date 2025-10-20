// services/rentalReminderService.js
// UPDATED: Changed from 'userId' to 'customerId' to match customers collection
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";

// Track when we last checked (in-memory, per session)
let lastCheckTime = null;
const CHECK_COOLDOWN_MINUTES = 15; // Only check once every 15 minutes

// Check if a date is today
const isToday = (date) => {
  const today = new Date();
  const checkDate = date instanceof Date ? date : date.toDate();

  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// Check if a date is tomorrow
const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkDate = date instanceof Date ? date : date.toDate();

  return (
    checkDate.getDate() === tomorrow.getDate() &&
    checkDate.getMonth() === tomorrow.getMonth() &&
    checkDate.getFullYear() === tomorrow.getFullYear()
  );
};

// Check if it's morning time (6 AM - 12 PM)
const isMorningTime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 12;
};

// Check if enough time has passed since last reminder (24 hours for overdue)
const shouldSendOverdueReminder = (lastSentAt) => {
  if (!lastSentAt) return true;

  const lastSent =
    lastSentAt instanceof Date ? lastSentAt : lastSentAt.toDate();
  const hoursSinceLastReminder =
    (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);

  // Send overdue reminder once per day (24 hours)
  return hoursSinceLastReminder >= 24;
};

// Create reminder notification with transaction to prevent duplicates
// CHANGED: userId -> customerId
const createReminderNotification = async (
  customerId,
  type,
  title,
  message,
  checkoutId,
  updateData
) => {
  try {
    // Use transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
      const checkoutRef = doc(db, "checkouts", checkoutId);
      const checkoutDoc = await transaction.get(checkoutRef);

      if (!checkoutDoc.exists()) {
        throw new Error("Checkout document does not exist");
      }

      const checkoutData = checkoutDoc.data();

      // Double-check the flag hasn't been set by another process
      if (type === "dayBefore" && checkoutData.dayBeforeReminderSent) {
        console.log("Day-before reminder already sent, skipping");
        return;
      }
      if (type === "dueToday" && checkoutData.dueTodayReminderSent) {
        console.log("Due today reminder already sent, skipping");
        return;
      }
      if (
        type === "overdue" &&
        !shouldSendOverdueReminder(checkoutData.overdueReminderSentAt)
      ) {
        console.log("Overdue reminder sent too recently, skipping");
        return;
      }

      // Create notification
      const notificationRef = doc(collection(db, "notifications"));
      transaction.set(notificationRef, {
        customerId, // CHANGED: from userId to customerId
        type: "reminder",
        title,
        message,
        isRead: false,
        createdAt: serverTimestamp(),
        data: {
          ...updateData.data,
          reminderType: type,
        },
      });

      // Update checkout with flag
      transaction.update(checkoutRef, updateData.flags);

      console.log(`Reminder notification created: ${title}`);
    });
  } catch (error) {
    console.error("Error creating reminder notification:", error);
  }
};

// Main function to check and send rental reminders
// CHANGED: userId -> customerId
export const checkRentalDueReminders = async (customerId) => {
  try {
    // Prevent multiple checks in short succession (cooldown)
    if (lastCheckTime) {
      const minutesSinceLastCheck = (Date.now() - lastCheckTime) / (1000 * 60);
      if (minutesSinceLastCheck < CHECK_COOLDOWN_MINUTES) {
        console.log(
          `Reminder check on cooldown. Last check was ${Math.round(
            minutesSinceLastCheck
          )} minutes ago`
        );
        return 0;
      }
    }

    lastCheckTime = Date.now();
    console.log("Checking rental reminders for customer:", customerId);

    const now = new Date();

    // Query active checkouts for this customer
    // CHANGED: userId -> customerId
    const checkoutsRef = collection(db, "checkouts");
    const q = query(
      checkoutsRef,
      where("customerId", "==", customerId), // CHANGED: userId to customerId
      where("itemReturned", "==", false)
    );

    const snapshot = await getDocs(q);
    console.log(`Found ${snapshot.size} active rentals to check`);

    if (snapshot.empty) {
      console.log("No active rentals found");
      return 0;
    }

    let remindersSent = 0;

    for (const checkoutDoc of snapshot.docs) {
      const checkout = checkoutDoc.data();
      const checkoutId = checkoutDoc.id;

      // Check if checkout has an end date
      if (!checkout.rentalDetails?.endDate) {
        console.log(`Checkout ${checkoutId} has no end date, skipping...`);
        continue;
      }

      const endDate = checkout.rentalDetails.endDate.toDate();
      const orderNumber = checkout.id || checkoutId;
      const itemCount = checkout.rentalItems?.length || 0;
      const returnTime = checkout.rentalDetails?.returnTime || "end of day";

      console.log(`Checking checkout ${orderNumber}:`, {
        endDate: endDate.toLocaleString(),
        isToday: isToday(endDate),
        isTomorrow: isTomorrow(endDate),
        isMorning: isMorningTime(),
        dayBeforeReminderSent: checkout.dayBeforeReminderSent,
        dueTodayReminderSent: checkout.dueTodayReminderSent,
        isPastDue: now > endDate,
      });

      // CHECK 1: Day before due reminder
      if (
        isTomorrow(endDate) &&
        isMorningTime() &&
        !checkout.dayBeforeReminderSent
      ) {
        console.log(`Sending day-before reminder for order ${orderNumber}`);

        await createReminderNotification(
          customerId, // CHANGED: from userId
          "dayBefore",
          "Rental Due Tomorrow",
          `Reminder: Your rental items for order #${orderNumber} are due tomorrow by ${returnTime}. Please prepare to return them on time.`,
          checkoutId,
          {
            data: {
              orderId: checkoutId,
              orderNumber,
              dueDate: endDate.toISOString(),
              itemCount,
              returnTime,
            },
            flags: {
              dayBeforeReminderSent: true,
              dayBeforeReminderSentAt: Timestamp.now(),
            },
          }
        );

        remindersSent++;
        console.log(`Day-before reminder sent for order ${orderNumber}`);
      }

      // CHECK 2: Due today morning reminder
      if (
        isToday(endDate) &&
        isMorningTime() &&
        !checkout.dueTodayReminderSent
      ) {
        console.log(`Sending due today reminder for order ${orderNumber}`);

        await createReminderNotification(
          customerId, // CHANGED: from userId
          "dueToday",
          "Rental Due Today",
          `Your rental items for order #${orderNumber} are due for return today by ${returnTime}. Please return on time to avoid late fees.`,
          checkoutId,
          {
            data: {
              orderId: checkoutId,
              orderNumber,
              dueDate: endDate.toISOString(),
              itemCount,
              returnTime,
            },
            flags: {
              dueTodayReminderSent: true,
              dueTodayReminderSentAt: Timestamp.now(),
            },
          }
        );

        remindersSent++;
        console.log(`Due today reminder sent for order ${orderNumber}`);
      }

      // CHECK 3: Overdue reminder (if past end date and not returned)
      // Only send if 24 hours have passed since last overdue reminder
      if (
        now > endDate &&
        shouldSendOverdueReminder(checkout.overdueReminderSentAt)
      ) {
        const overdueMilliseconds = now - endDate;
        const overdueDays = Math.floor(
          overdueMilliseconds / (1000 * 60 * 60 * 24)
        );
        const overdueHours = Math.floor(
          (overdueMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        console.log(
          `Order ${orderNumber} is ${overdueDays} days and ${overdueHours} hours overdue`
        );

        const overdueMessage =
          overdueDays > 0
            ? `Your rental for order #${orderNumber} is ${overdueDays} day${
                overdueDays > 1 ? "s" : ""
              } overdue. Please return the items immediately to avoid additional late fees.`
            : `Your rental for order #${orderNumber} is ${overdueHours} hour${
                overdueHours > 1 ? "s" : ""
              } overdue. Please return the items as soon as possible.`;

        await createReminderNotification(
          customerId, // CHANGED: from userId
          "overdue",
          "Rental Overdue - Action Required",
          overdueMessage,
          checkoutId,
          {
            data: {
              orderId: checkoutId,
              orderNumber,
              dueDate: endDate.toISOString(),
              overdueDays,
              overdueHours,
            },
            flags: {
              overdueReminderSent: true,
              overdueReminderSentAt: Timestamp.now(),
              lastOverdueReminderCount:
                (checkout.lastOverdueReminderCount || 0) + 1,
            },
          }
        );

        remindersSent++;
        console.log(`Overdue reminder sent for order ${orderNumber}`);
      }
    }

    if (remindersSent > 0) {
      console.log(`Total reminders sent: ${remindersSent}`);
    } else {
      console.log("No reminders needed at this time");
    }

    return remindersSent;
  } catch (error) {
    console.error("Error checking rental reminders:", error);
    return 0;
  }
};

// =============================================================================
// ADDITIONAL HELPER FUNCTIONS
// =============================================================================

// Check reminders for all customers (admin/system function)
export const checkAllCustomersReminders = async () => {
  try {
    console.log("Checking reminders for all customers...");

    // Get all active checkouts
    const checkoutsRef = collection(db, "checkouts");
    const q = query(checkoutsRef, where("itemReturned", "==", false));

    const snapshot = await getDocs(q);
    console.log(`Found ${snapshot.size} active rentals across all customers`);

    if (snapshot.empty) {
      console.log("No active rentals found");
      return { total: 0, sent: 0 };
    }

    // Get unique customer IDs
    const customerIds = new Set();
    snapshot.forEach((doc) => {
      const checkout = doc.data();
      if (checkout.customerId) {
        customerIds.add(checkout.customerId);
      }
    });

    console.log(`Processing reminders for ${customerIds.size} customers`);

    let totalRemindersSent = 0;

    // Check reminders for each customer
    for (const customerId of customerIds) {
      const remindersSent = await checkRentalDueReminders(customerId);
      totalRemindersSent += remindersSent;
    }

    console.log(
      `Completed checking all customers. Total reminders sent: ${totalRemindersSent}`
    );

    return {
      total: customerIds.size,
      sent: totalRemindersSent,
    };
  } catch (error) {
    console.error("Error checking all customers reminders:", error);
    return { total: 0, sent: 0, error: error.message };
  }
};

// Get reminder statistics for a customer
export const getCustomerReminderStats = async (customerId) => {
  try {
    const checkoutsRef = collection(db, "checkouts");
    const q = query(
      checkoutsRef,
      where("customerId", "==", customerId),
      where("itemReturned", "==", false)
    );

    const snapshot = await getDocs(q);

    const stats = {
      activeRentals: snapshot.size,
      dayBeforeRemindersSent: 0,
      dueTodayRemindersSent: 0,
      overdueRemindersSent: 0,
      overdueRentals: 0,
    };

    const now = new Date();

    snapshot.forEach((doc) => {
      const checkout = doc.data();

      if (checkout.dayBeforeReminderSent) stats.dayBeforeRemindersSent++;
      if (checkout.dueTodayReminderSent) stats.dueTodayRemindersSent++;
      if (checkout.overdueReminderSent) stats.overdueRemindersSent++;

      // Check if overdue
      if (checkout.rentalDetails?.endDate) {
        const endDate = checkout.rentalDetails.endDate.toDate();
        if (now > endDate) {
          stats.overdueRentals++;
        }
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting customer reminder stats:", error);
    return null;
  }
};
