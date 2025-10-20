// services/notificationService.js
// UPDATED: Changed from 'users' to 'customers' collection
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

// Generic function to create notifications
// NOTE: Uses customerId instead of userId to match customers collection
export const createNotification = async (
  customerId,
  type,
  title,
  message,
  additionalData = {}
) => {
  try {
    console.log("Creating notification:", { customerId, type, title });

    const notificationsRef = collection(db, "notifications");

    const notificationData = {
      customerId, // CHANGED: from userId to customerId
      type,
      title,
      message,
      isRead: false,
      createdAt: serverTimestamp(),
      ...additionalData,
    };

    const docRef = await addDoc(notificationsRef, notificationData);

    console.log("Notification created successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// =============================================================================
// ORDER NOTIFICATION FUNCTIONS
// =============================================================================

export const notifyOrderPlaced = async (
  customerId,
  orderId,
  orderNumber,
  totalAmount
) => {
  return await createNotification(
    customerId,
    "orders",
    "Order Placed Successfully",
    `Your rental order #${orderNumber} has been placed and is being processed.`,
    {
      orderId,
      data: {
        orderNumber,
        totalAmount: `$${totalAmount}`,
        status: "Processing",
      },
    }
  );
};

export const notifyOrderProcessing = async (
  customerId,
  orderId,
  orderNumber
) => {
  return await createNotification(
    customerId,
    "orders",
    "Order Being Processed",
    `Your order #${orderNumber} is now being prepared for delivery.`,
    {
      orderId,
      data: {
        orderNumber,
        status: "Processing",
      },
    }
  );
};

export const notifyOrderShipped = async (
  customerId,
  orderId,
  orderNumber,
  trackingNumber = null,
  estimatedDelivery = null
) => {
  let message = `Your order #${orderNumber} has been shipped!`;
  const data = {
    orderNumber,
    status: "Shipped",
  };

  if (trackingNumber) {
    message += ` Tracking: ${trackingNumber}`;
    data.trackingNumber = trackingNumber;
  }

  if (estimatedDelivery) {
    message += ` Estimated delivery: ${estimatedDelivery}`;
    data.estimatedDelivery = estimatedDelivery;
  }

  return await createNotification(
    customerId,
    "orders",
    "Order Shipped",
    message,
    {
      orderId,
      data,
    }
  );
};

export const notifyOrderDelivered = async (
  customerId,
  orderId,
  orderNumber,
  deliveryAddress = null
) => {
  let message = `Your rental order #${orderNumber} has been delivered successfully!`;
  const data = {
    orderNumber,
    status: "Delivered",
    deliveredAt: new Date().toLocaleString(),
  };

  if (deliveryAddress) {
    message += ` Delivered to: ${deliveryAddress}`;
    data.deliveryAddress = deliveryAddress;
  }

  return await createNotification(
    customerId,
    "orders",
    "Order Delivered",
    message,
    {
      orderId,
      data,
    }
  );
};

export const notifyOrderReturned = async (
  customerId,
  orderId,
  orderNumber,
  returnDate
) => {
  return await createNotification(
    customerId,
    "orders",
    "Items Returned",
    `Your rental items for order #${orderNumber} have been successfully returned.`,
    {
      orderId,
      data: {
        orderNumber,
        status: "Returned",
        returnDate,
      },
    }
  );
};

// =============================================================================
// BILLING NOTIFICATION FUNCTIONS
// =============================================================================

export const notifyPaymentSuccess = async (
  customerId,
  amount,
  orderId = null,
  paymentMethod = null
) => {
  let message = `Your payment of $${amount.toFixed(
    2
  )} has been processed successfully.`;
  const data = {
    amount: `$${amount.toFixed(2)}`,
    status: "Completed",
    processedAt: new Date().toLocaleString(),
  };

  if (paymentMethod) {
    data.paymentMethod = paymentMethod;
  }

  if (orderId) {
    message += ` Thank you for your order!`;
    data.orderId = orderId;
  }

  return await createNotification(
    customerId,
    "billing",
    "Payment Successful",
    message,
    {
      orderId,
      data,
    }
  );
};

export const notifyPaymentFailed = async (
  customerId,
  amount,
  orderId = null,
  reason = ""
) => {
  let message = `Your payment of $${amount.toFixed(2)} could not be processed.`;
  if (reason) {
    message += ` Reason: ${reason}.`;
  }
  message += ` Please update your payment method and try again.`;

  return await createNotification(
    customerId,
    "billing",
    "Payment Failed",
    message,
    {
      orderId,
      data: {
        amount: `$${amount.toFixed(2)}`,
        status: "Failed",
        reason: reason || "Unknown error",
        attemptedAt: new Date().toLocaleString(),
      },
    }
  );
};

export const notifyRefundProcessed = async (
  customerId,
  amount,
  orderId,
  reason = "Order cancellation"
) => {
  return await createNotification(
    customerId,
    "billing",
    "Refund Processed",
    `A refund of $${amount.toFixed(
      2
    )} has been processed and will appear in your account within 3-5 business days.`,
    {
      orderId,
      data: {
        amount: `$${amount.toFixed(2)}`,
        reason,
        processedAt: new Date().toLocaleString(),
        expectedDate: "3-5 business days",
      },
    }
  );
};

export const notifyLateFee = async (customerId, amount, orderId, dueDate) => {
  return await createNotification(
    customerId,
    "billing",
    "Late Return Fee",
    `A late fee of $${amount.toFixed(
      2
    )} has been applied to your account for order items returned after the due date.`,
    {
      orderId,
      data: {
        lateFee: `$${amount.toFixed(2)}`,
        originalDueDate: dueDate,
        appliedAt: new Date().toLocaleString(),
      },
    }
  );
};

// =============================================================================
// RENTAL REMINDER NOTIFICATION FUNCTIONS
// =============================================================================

export const notifyRentalDueToday = async (
  customerId,
  orderId,
  orderNumber,
  dueDateTime,
  items = []
) => {
  const itemCount = items.length || 0;
  const itemText = itemCount === 1 ? "item is" : "items are";

  return await createNotification(
    customerId,
    "reminder",
    "⏰ Rental Due Today!",
    `Your ${itemCount} rental ${itemText} due today at ${dueDateTime}. Order #${orderNumber}. Please prepare for return to avoid late fees.`,
    {
      orderId,
      data: {
        orderNumber,
        dueDateTime,
        itemCount,
        reminderType: "due-today-morning",
      },
    }
  );
};

export const notifyRentalOverdue = async (
  customerId,
  orderId,
  orderNumber,
  overdueHours
) => {
  return await createNotification(
    customerId,
    "reminder",
    "⚠️ Rental Overdue",
    `Your rental order #${orderNumber} is ${overdueHours} hours overdue. Please return items immediately to avoid additional late fees.`,
    {
      orderId,
      data: {
        orderNumber,
        overdueHours,
        reminderType: "overdue",
      },
    }
  );
};

// =============================================================================
// PROMOTION NOTIFICATION FUNCTIONS
// =============================================================================

export const notifyPromotion = async (
  customerId,
  title,
  message,
  promoCode = null,
  discount = null,
  validUntil = null
) => {
  const data = {};

  if (promoCode) data.promoCode = promoCode;
  if (discount) data.discount = discount;
  if (validUntil) data.validUntil = validUntil;

  return await createNotification(customerId, "promotions", title, message, {
    data,
  });
};

export const notifySeasonalPromo = async (
  customerId,
  season,
  discount,
  validUntil
) => {
  return await notifyPromotion(
    customerId,
    `${season} Special - ${discount} Off!`,
    `Get ${discount} off all rental items this ${season.toLowerCase()}. Limited time offer!`,
    `${season.toUpperCase()}${discount.replace("%", "")}`,
    discount,
    validUntil
  );
};

export const notifyLoyaltyReward = async (customerId, rewardType, discount) => {
  return await notifyPromotion(
    customerId,
    `Loyalty Reward - ${discount} Off!`,
    `Thank you for being a valued customer! Enjoy ${discount} off your next rental as a token of our appreciation.`,
    `LOYALTY${discount.replace("%", "")}`,
    discount
  );
};

// =============================================================================
// REAL-TIME ORDER STATUS LISTENER
// =============================================================================

export const setupOrderStatusListener = (orderId) => {
  console.log("Setting up order status listener for:", orderId);

  const orderRef = doc(db, "orders", orderId);

  return onSnapshot(
    orderRef,
    (doc) => {
      if (doc.exists()) {
        const orderData = doc.data();
        const { status, customerId, orderNumber, totalAmount } = orderData; // CHANGED: userId to customerId

        console.log(`Order ${orderId} status changed to: ${status}`);

        // Trigger notifications based on status change
        switch (status) {
          case "processing":
            notifyOrderProcessing(customerId, orderId, orderNumber);
            break;
          case "shipped":
            notifyOrderShipped(
              customerId,
              orderId,
              orderNumber,
              orderData.trackingNumber,
              orderData.estimatedDelivery
            );
            break;
          case "delivered":
            notifyOrderDelivered(
              customerId,
              orderId,
              orderNumber,
              orderData.deliveryAddress
            );
            break;
          case "returned":
            notifyOrderReturned(
              customerId,
              orderId,
              orderNumber,
              orderData.returnDate
            );
            break;
          default:
            console.log(`No notification handler for status: ${status}`);
            break;
        }
      }
    },
    (error) => {
      console.error("Error in order status listener:", error);
    }
  );
};

// =============================================================================
// BULK NOTIFICATION FUNCTIONS (for admin use)
// =============================================================================

// UPDATED: Now fetches from customers collection
export const notifyAllCustomers = async (
  type,
  title,
  message,
  additionalData = {}
) => {
  try {
    console.log("Sending bulk notifications to all customers...");

    // Fetch all customers from the customers collection
    const customersRef = collection(db, "customers");
    const customersSnapshot = await getDocs(customersRef);

    const notificationPromises = [];

    customersSnapshot.forEach((customerDoc) => {
      const customerId = customerDoc.id;
      notificationPromises.push(
        createNotification(customerId, type, title, message, additionalData)
      );
    });

    const results = await Promise.allSettled(notificationPromises);

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `Bulk notifications sent: ${successful} successful, ${failed} failed`
    );

    return { successful, failed, total: customersSnapshot.size };
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    throw error;
  }
};

// Listen to all order changes (for admin/system use)
export const setupAllOrdersListener = () => {
  console.log("Setting up listener for all orders");

  const ordersRef = collection(db, "orders");

  return onSnapshot(
    ordersRef,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const orderData = change.doc.data();
          console.log("New order detected:", change.doc.id);

          // Notify when new order is placed
          // CHANGED: userId to customerId
          notifyOrderPlaced(
            orderData.customerId,
            change.doc.id,
            orderData.orderNumber,
            orderData.totalAmount
          );
        }
      });
    },
    (error) => {
      console.error("Error in all orders listener:", error);
    }
  );
};

// =============================================================================
// HELPER FUNCTIONS FOR QUERYING NOTIFICATIONS
// =============================================================================

// Get all notifications for a specific customer
export const getCustomerNotifications = async (customerId) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("customerId", "==", customerId));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching customer notifications:", error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      readAt: serverTimestamp(),
    });
    console.log(`Notification ${notificationId} marked as read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Setup real-time listener for customer notifications
export const setupCustomerNotificationsListener = (customerId, callback) => {
  console.log("Setting up notifications listener for customer:", customerId);

  const notificationsRef = collection(db, "notifications");
  const q = query(notificationsRef, where("customerId", "==", customerId));

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(notifications);
    },
    (error) => {
      console.error("Error in customer notifications listener:", error);
    }
  );
};
