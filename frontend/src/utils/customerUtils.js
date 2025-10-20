// utils/customerUtils.js
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Get customer document ID from Firebase Auth UID
 * @param {string} firebaseUid - The Firebase Auth user ID
 * @returns {Promise<string|null>} The customer document ID or null if not found
 */
export const getCustomerIdFromFirebaseUid = async (firebaseUid) => {
  try {
    if (!firebaseUid) {
      console.error("No firebaseUid provided");
      return null;
    }

    console.log("Fetching customer ID for firebaseUid:", firebaseUid);

    const customersRef = collection(db, "customers");
    const q = query(
      customersRef,
      where("firebaseUid", "==", firebaseUid),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("No customer document found for firebaseUid:", firebaseUid);
      return null;
    }

    const customerDoc = querySnapshot.docs[0];
    const customerId = customerDoc.id;

    console.log("Customer ID found:", customerId);
    return customerId;
  } catch (error) {
    console.error("Error fetching customer ID:", error);
    return null;
  }
};

/**
 * Get customer data by document ID
 * @param {string} customerId - The customer document ID
 * @returns {Promise<Object|null>} The customer data or null if not found
 */
export const getCustomerData = async (customerId) => {
  try {
    if (!customerId) {
      console.error("No customerId provided");
      return null;
    }

    const customerRef = doc(db, "customers", customerId);
    const customerSnap = await getDoc(customerRef);

    if (!customerSnap.exists()) {
      console.warn("Customer document not found:", customerId);
      return null;
    }

    return {
      id: customerSnap.id,
      ...customerSnap.data(),
    };
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return null;
  }
};

/**
 * Custom hook to get and manage customer ID
 * @param {Object} user - Firebase Auth user object
 * @returns {Object} Customer ID and loading state
 */
export const useCustomerId = (user) => {
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerId = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const id = await getCustomerIdFromFirebaseUid(user.uid);
        setCustomerId(id);
      } catch (err) {
        console.error("Error in useCustomerId:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerId();
  }, [user]);

  return { customerId, loading, error };
};
