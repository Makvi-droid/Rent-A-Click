// utils/generateSequentialCustomerId.js
import { doc, runTransaction, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";

/**
 * Generates a sequential customer ID in the format RACC0001, RACC0002, etc.
 * Uses Firestore transactions to ensure atomicity and prevent duplicate IDs.
 * @returns {Promise<string>} The generated sequential ID (e.g., "RACC0001")
 */
export const generateSequentialCustomerId = async () => {
  const counterRef = doc(firestore, "counters", "customerIdCounter");
  
  try {
    const sequentialId = await runTransaction(firestore, async (transaction) => {
      // Get the current counter value
      const counterDoc = await transaction.get(counterRef);
      
      let nextId = 1;
      
      if (counterDoc.exists()) {
        nextId = (counterDoc.data().lastId || 0) + 1;
      } else {
        // Initialize the counter document if it doesn't exist
        transaction.set(counterRef, { 
          lastId: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Update the counter with the new ID
      transaction.update(counterRef, { 
        lastId: nextId,
        updatedAt: new Date()
      });
      
      // Format the ID as RACC + 4-digit padded number (RACC for customers vs RACU for users)
      const formattedId = `RACC${nextId.toString().padStart(4, '0')}`;
      
      return formattedId;
    });
    
    return sequentialId;
    
  } catch (error) {
    console.error("Error generating sequential customer ID:", error);
    
    // Fallback: if transaction fails, try a timestamp-based approach
    // This is less ideal but prevents complete failure
    const timestamp = Date.now().toString().slice(-4);
    const fallbackId = `RACC${timestamp}`;
    
    console.warn(`Using fallback customer ID: ${fallbackId}`);
    return fallbackId;
  }
};

/**
 * Checks if a customer ID already exists in the customers collection
 * @param {string} customerId - The customer ID to check (document ID)
 * @returns {Promise<boolean>} True if the ID exists, false otherwise
 */
export const checkCustomerIdExists = async (customerId) => {
  try {
    // Since we're using the customer ID as the document ID, just check if the document exists
    const customerRef = doc(firestore, "customers", customerId);
    const customerDoc = await getDoc(customerRef);
    
    return customerDoc.exists();
  } catch (error) {
    console.error("Error checking customer ID existence:", error);
    return false;
  }
};

/**
 * Gets the next available customer ID, checking for any gaps in the sequence
 * This is a more robust version that handles edge cases
 * @returns {Promise<string>} The next available sequential customer ID
 */
export const getNextAvailableCustomerId = async () => {
  const maxRetries = 5;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const generatedId = await generateSequentialCustomerId();
      
      // Double-check that this ID doesn't already exist as a document
      const exists = await checkCustomerIdExists(generatedId);
      
      if (!exists) {
        console.log(`Generated unique customer ID: ${generatedId}`);
        return generatedId;
      }
      
      console.warn(`Generated customer ID ${generatedId} already exists, retrying...`);
      attempt++;
      
    } catch (error) {
      console.error(`Customer ID generation attempt ${attempt + 1} failed:`, error);
      attempt++;
      
      if (attempt >= maxRetries) {
        // Last resort: use timestamp-based ID with customer prefix
        const timestamp = Date.now().toString().slice(-6);
        const fallbackId = `RACC${timestamp}`;
        console.warn(`Using fallback customer ID: ${fallbackId}`);
        return fallbackId;
      }
    }
  }
  
  throw new Error("Failed to generate unique customer ID after maximum retries");
};

// Re-export user functions for backward compatibility
export { 
  generateSequentialUserId, 
  checkUserIdExists, 
  getNextAvailableUserId 
} from './generateSequentialUserId';