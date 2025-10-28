// Enhanced checkoutUtils.js - FIXED: Better image URL handling
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  runTransaction,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Currency formatter for Philippine Peso
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper functions for pricing calculations
export const getDailyRate = (item) => {
  if (item.dailyRate) return parseFloat(item.dailyRate);
  if (item.variant?.price) return parseFloat(item.variant.price);
  if (item.price) return parseFloat(item.price);
  return 0;
};

// FIXED: Helper to get image URL from item (checks multiple possible fields)
const getItemImageUrl = (item) => {
  // Check all possible image field variations
  if (item.imageUrl) return item.imageUrl;
  if (item.image) return item.image;
  if (item.variant?.imageUrl) return item.variant.imageUrl;
  if (item.variant?.image) return item.variant.image;
  if (item.productImage) return item.productImage;
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }

  console.warn(`⚠️ No image found for item: ${item.name || item.id}`);
  return null;
};

// NEW: Fetch blocked dates from Firebase
export const fetchBlockedDates = async () => {
  try {
    const snapshot = await getDocs(collection(db, "businessSettings"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data;
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    return [];
  }
};

// NEW: Check if a specific date is blocked
export const isDateBlocked = (date, blockedDates) => {
  if (!date || !blockedDates || blockedDates.length === 0) return false;

  const dateKey = date.toISOString().split("T")[0];
  const dayOfWeek = date.getDay();

  // Check full day blocks
  const hasFullDayBlock = blockedDates.some(
    (b) =>
      b.type === "full_day" &&
      Array.isArray(b.dates) &&
      b.dates.includes(dateKey)
  );

  // Check date range blocks
  const hasRangeBlock = blockedDates.some((b) => {
    if (b.type !== "date_range") return false;
    if (!b.startDate || !b.endDate) return false;
    return dateKey >= b.startDate && dateKey <= b.endDate;
  });

  // Check recurring blocks
  const hasRecurringBlock = blockedDates.some(
    (b) => b.type === "recurring" && b.recurringDay === dayOfWeek
  );

  return hasFullDayBlock || hasRangeBlock || hasRecurringBlock;
};

// NEW: Get list of blocked dates between start and end date
export const getBlockedDatesInRange = (startDate, endDate, blockedDates) => {
  if (!startDate || !endDate || !blockedDates) return [];

  const blocked = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    if (isDateBlocked(current, blockedDates)) {
      blocked.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return blocked;
};

// ENHANCED: Calculate rental days excluding blocked dates
export const calculateRentalDays = (startDate, endDate, blockedDates = []) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays === 0) return 1; // Same day rental

  // If no blocked dates provided, return total days
  if (!blockedDates || blockedDates.length === 0) {
    return Math.max(1, totalDays);
  }

  // Count blocked days in the range
  const blockedDaysInRange = getBlockedDatesInRange(
    startDate,
    endDate,
    blockedDates
  );
  const availableDays = totalDays - blockedDaysInRange.length;

  // Ensure at least 1 day is counted
  return Math.max(1, availableDays);
};

// NEW: Get rental calculation details
export const getRentalCalculationDetails = (
  startDate,
  endDate,
  blockedDates = []
) => {
  if (!startDate || !endDate) {
    return {
      totalDays: 0,
      blockedDays: 0,
      billableDays: 0,
      blockedDatesArray: [],
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays === 0) {
    return {
      totalDays: 1,
      blockedDays: 0,
      billableDays: 1,
      blockedDatesArray: [],
    };
  }

  const blockedDatesArray = getBlockedDatesInRange(
    startDate,
    endDate,
    blockedDates
  );
  const blockedDays = blockedDatesArray.length;
  const billableDays = Math.max(1, totalDays - blockedDays);

  return {
    totalDays,
    blockedDays,
    billableDays,
    blockedDatesArray,
  };
};

export const calculateDeliveryFee = (deliveryMethod, subtotal) => {
  if (deliveryMethod !== "delivery") return 0;
  if (subtotal >= 5000) return 0;
  return subtotal * 0.1;
};

export const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Enhanced function to find customer document by firebaseUid
export const findCustomerDoc = async (firebaseUid) => {
  try {
    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("firebaseUid", "==", firebaseUid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const customerDoc = querySnapshot.docs[0];
      return {
        id: customerDoc.id,
        data: customerDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error finding customer document:", error);
    return null;
  }
};

// Enhanced function to create a new customer profile
export const createCustomerProfile = async (firebaseUid, userData) => {
  try {
    const customersRef = collection(db, "customers");

    const newCustomerData = {
      firebaseUid: firebaseUid,
      firstName: userData?.displayName?.split(" ")[0] || "",
      lastName: userData?.displayName?.split(" ").slice(1).join(" ") || "",
      email: userData?.email || "",
      phone: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      paypalEmail: "",
      newsletter: false,
      cart: [],
      orderHistory: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      profileCompleted: false,
      lastLoginAt: serverTimestamp(),
      accountStatus: "active",
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
      },
    };

    const docRef = await addDoc(customersRef, newCustomerData);

    console.log("New customer profile created:", docRef.id);

    return {
      id: docRef.id,
      data: newCustomerData,
    };
  } catch (error) {
    console.error("Error creating customer profile:", error);
    throw error;
  }
};

// Enhanced function to update customer profile during checkout
export const updateCustomerProfile = async (
  customerDocId,
  checkoutFormData
) => {
  if (!customerDocId) return;

  try {
    const customerRef = doc(db, "customers", customerDocId);
    const updateData = {
      firstName: checkoutFormData.firstName.trim(),
      lastName: checkoutFormData.lastName.trim(),
      email: checkoutFormData.email.trim(),
      phone: checkoutFormData.phone.trim(),
      address: checkoutFormData.address.trim(),
      apartment: checkoutFormData.apartment?.trim() || "",
      city: checkoutFormData.city.trim(),
      state: checkoutFormData.state.trim(),
      zipCode: checkoutFormData.zipCode.trim(),
      paypalEmail: checkoutFormData.paypalEmail?.trim() || "",
      newsletter: checkoutFormData.newsletter,
      updatedAt: serverTimestamp(),
      profileCompleted: true,
      lastCheckoutAt: serverTimestamp(),
    };

    await updateDoc(customerRef, updateData);
    console.log("Customer profile updated during checkout");
  } catch (error) {
    console.error("Error updating customer profile:", error);
  }
};

// Enhanced checkout ID generation
export const generateNextCheckoutId = async () => {
  try {
    return await runTransaction(db, async (transaction) => {
      const counterRef = doc(db, "counters", "checkouts");
      const counterDoc = await transaction.get(counterRef);

      let nextNumber = 1;

      if (counterDoc.exists()) {
        nextNumber = (counterDoc.data().lastNumber || 0) + 1;
      }

      transaction.set(
        counterRef,
        {
          lastNumber: nextNumber,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const currentYear = new Date().getFullYear().toString().slice(-2);
      const formattedId = `RACCO${currentYear}${nextNumber
        .toString()
        .padStart(4, "0")}`;

      return formattedId;
    });
  } catch (error) {
    console.error("Error generating checkout ID:", error);
    const timestamp = Date.now().toString().slice(-6);
    const currentYear = new Date().getFullYear().toString().slice(-2);
    return `RACCO${currentYear}${timestamp}`;
  }
};

// Helper function to convert 24-hour time to 12-hour AM/PM format
const formatTimeTo12Hour = (time24) => {
  if (!time24) return null;

  try {
    const [hour, minute] = time24.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;

    return `${hour12}:${minute} ${period}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return time24;
  }
};

// FIXED: Enhanced saveCheckoutToFirebase function with better image handling
export const saveCheckoutToFirebase = async (
  checkoutId,
  formData,
  customerDocId,
  user,
  rentalItems,
  paypalPaymentDetails,
  shouldCreateCustomerProfile,
  pricing
) => {
  try {
    console.log("Saving checkout to Firebase with ID:", checkoutId);
    console.log("📅 Rental calculation:", {
      totalDays: pricing.totalDays,
      blockedDays: pricing.blockedDays,
      billableDays: pricing.rentalDays,
    });

    const pickupTime12Hour = formatTimeTo12Hour(formData.pickupTime);
    const returnTime12Hour = formatTimeTo12Hour(formData.returnTime);

    const checkoutData = {
      id: checkoutId,
      orderNumber: checkoutId,

      customerId: customerDocId,
      customerInfo: {
        customerDocId: customerDocId,
        firebaseUid: user?.uid,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      },

      userId: user?.uid || null,
      userEmail: user?.email || formData.email,

      rentalDetails: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: pricing.totalDays || pricing.rentalDays,
        blockedDays: pricing.blockedDays || 0,
        billableDays: pricing.rentalDays,
        deliveryMethod: formData.deliveryMethod,
        pickupTime: pickupTime12Hour,
        returnTime: returnTime12Hour,
        pickupTime24Hour: formData.pickupTime || null,
        returnTime24Hour: formData.returnTime || null,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },

      deliveryAddress:
        formData.deliveryMethod === "delivery"
          ? {
              address: formData.address.trim(),
              apartment: formData.apartment?.trim() || null,
              city: formData.city.trim(),
              state: formData.state.trim(),
              zipCode: formData.zipCode.trim(),
              fullAddress: `${formData.address.trim()}${
                formData.apartment ? ", " + formData.apartment.trim() : ""
              }, ${formData.city.trim()}, ${formData.state.trim()} ${formData.zipCode.trim()}`,
            }
          : null,

      paymentInfo: {
        method: formData.paymentMethod,
        paypalEmail:
          formData.paymentMethod === "paypal"
            ? formData.paypalEmail?.trim()
            : null,
        paypal:
          formData.paymentMethod === "paypal" && paypalPaymentDetails
            ? {
                orderId: paypalPaymentDetails.paypalOrderId,
                paymentId: paypalPaymentDetails.paymentId,
                captureId: paypalPaymentDetails.captureId,
                payerEmail: paypalPaymentDetails.payerEmail,
                payerName: paypalPaymentDetails.payerName,
                amount: paypalPaymentDetails.amount,
                currency: paypalPaymentDetails.currency,
                status: paypalPaymentDetails.status,
                createTime: paypalPaymentDetails.createTime,
                updateTime: paypalPaymentDetails.updateTime,
              }
            : null,
      },

      // FIXED: Enhanced items mapping with comprehensive image URL handling
      items: rentalItems.map((item) => {
        const imageUrl = getItemImageUrl(item);

        // Log for debugging
        if (!imageUrl) {
          console.warn(
            `⚠️ Item "${item.name}" (ID: ${item.id}) has no image URL`
          );
        } else {
          console.log(`✅ Item "${item.name}" image URL: ${imageUrl}`);
        }

        return {
          id: item.id,
          name: item.name,
          brand: item.brand || null,
          category: item.category || null,
          subCategory: item.subCategory || null,
          quantity: item.quantity || 1,
          dailyRate: getDailyRate(item),
          totalItemCost:
            getDailyRate(item) * (item.quantity || 1) * pricing.rentalDays,
          variant: item.variant || null,
          // Store image in BOTH fields for maximum compatibility
          image: imageUrl,
          imageUrl: imageUrl,
          // Keep original data for reference
          originalItem: {
            productId: item.productId || item.id,
            inventoryId: item.inventoryId || null,
          },
        };
      }),

      pricing: {
        subtotal: Number(pricing.subtotal.toFixed(2)),
        deliveryFee: Number(pricing.deliveryFee.toFixed(2)),
        insuranceFee: Number(pricing.insuranceFee.toFixed(2)),
        tax: Number(pricing.tax.toFixed(2)),
        total: Number(pricing.total.toFixed(2)),
        rentalDays: pricing.rentalDays,
        currency: "PHP",
      },

      options: {
        insurance: formData.insurance,
        newsletter: formData.newsletter,
        specialInstructions: formData.specialInstructions?.trim() || null,
      },

      verification: {
        idRequired: true,
        idSubmitted: formData.idSubmitted || false,
        idSubmissionTimestamp: formData.idSubmissionTimestamp || null,
        penaltyAgreementAccepted: formData.penaltyAgreementAccepted || true,
      },

      status: formData.paymentMethod === "paypal" ? "confirmed" : "pending",
      paymentStatus: formData.paymentMethod === "paypal" ? "paid" : "pending",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      submittedAt: formData.submittedAt || new Date().toISOString(),

      termsAccepted: formData.termsAccepted,
      termsAcceptedAt: formData.termsAccepted ? serverTimestamp() : null,

      metadata: {
        source: "web-checkout",
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        itemCount: rentalItems.length,
        totalQuantity: rentalItems.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        ),
        collectionVersion: "customers-v1",
        checkoutVersion: "2.3", // Updated version
        customerProfileExists: !!customerDocId,
        autoCreatedProfile: shouldCreateCustomerProfile,
      },
    };

    await setDoc(doc(db, "checkouts", checkoutId), checkoutData);

    console.log("✅ Checkout saved successfully:", checkoutId);
    console.log(
      "📦 Items with images:",
      checkoutData.items.map((i) => ({
        name: i.name,
        hasImage: !!i.imageUrl,
      }))
    );

    return checkoutData;
  } catch (error) {
    console.error("❌ Error saving checkout to Firebase:", error);
    throw new Error(`Failed to save checkout: ${error.message}`);
  }
};
