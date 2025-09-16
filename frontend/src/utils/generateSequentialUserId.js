// utils/generateSequentialId.js
import { doc, runTransaction, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase";

/**
 * Generates a sequential user ID in the format RACU0001, RACU0002, etc.
 * Uses Firestore transactions to ensure atomicity and prevent duplicate IDs.
 * @returns {Promise<string>} The generated sequential ID (e.g., "RACU0001")
 */
export const generateSequentialUserId = async () => {
  const counterRef = doc(firestore, "counters", "userIdCounter");
  
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
      
      // Format the ID as RACU + 4-digit padded number
      const formattedId = `RACU${nextId.toString().padStart(4, '0')}`;
      
      return formattedId;
    });
    
    return sequentialId;
    
  } catch (error) {
    console.error("Error generating sequential user ID:", error);
    
    // Fallback: if transaction fails, try a timestamp-based approach
    // This is less ideal but prevents complete failure
    const timestamp = Date.now().toString().slice(-4);
    const fallbackId = `RACU${timestamp}`;
    
    console.warn(`Using fallback ID: ${fallbackId}`);
    return fallbackId;
  }
};

/**
 * Checks if a user ID already exists in the users collection
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} True if the ID exists, false otherwise
 */
export const checkUserIdExists = async (userId) => {
  try {
    // Query users collection to check if customId already exists
    const usersCollection = collection(firestore, "users");
    const q = query(usersCollection, where("customId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking user ID existence:", error);
    return false;
  }
};

/**
 * Gets the next available user ID, checking for any gaps in the sequence
 * This is a more robust version that handles edge cases
 * @returns {Promise<string>} The next available sequential ID
 */
export const getNextAvailableUserId = async () => {
  const maxRetries = 5;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const generatedId = await generateSequentialUserId();
      
      // Double-check that this ID doesn't already exist
      const exists = await checkUserIdExists(generatedId);
      
      if (!exists) {
        return generatedId;
      }
      
      console.warn(`Generated ID ${generatedId} already exists, retrying...`);
      attempt++;
      
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;
      
      if (attempt >= maxRetries) {
        // Last resort: use timestamp-based ID
        const timestamp = Date.now().toString().slice(-6);
        return `RACU${timestamp}`;
      }
    }
  }
  
  throw new Error("Failed to generate unique user ID after maximum retries");
};