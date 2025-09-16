// utils/userManagement.js
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  orderBy,
  limit,
  startAfter
} from "firebase/firestore";
import { firestore } from "../firebase";

/**
 * Find a user by their custom ID (e.g., "RACU0001")
 * @param {string} customId - The custom ID to search for
 * @returns {Promise<Object|null>} User document data with Firebase UID, or null if not found
 */
export const findUserByCustomId = async (customId) => {
  try {
    const usersCollection = collection(firestore, "users");
    const q = query(usersCollection, where("customId", "==", customId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Should only be one user with this custom ID
    const userDoc = querySnapshot.docs[0];
    return {
      uid: userDoc.id, // Firebase UID
      ...userDoc.data() // User data including customId
    };
    
  } catch (error) {
    console.error("Error finding user by custom ID:", error);
    throw error;
  }
};

/**
 * Get user data by Firebase UID (includes custom ID)
 * @param {string} uid - Firebase UID
 * @returns {Promise<Object|null>} User document data or null if not found
 */
export const getUserByUID = async (uid) => {
  try {
    const userRef = doc(firestore, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return {
      uid: uid,
      ...userDoc.data()
    };
    
  } catch (error) {
    console.error("Error getting user by UID:", error);
    throw error;
  }
};

/**
 * Update user profile data
 * @param {string} uid - Firebase UID
 * @param {Object} updateData - Data to update (cannot include customId for security)
 * @returns {Promise<boolean>} Success status
 */
export const updateUserProfile = async (uid, updateData) => {
  try {
    // Remove customId from update data to prevent tampering
    const { customId, ...allowedUpdateData } = updateData;
    
    if (customId) {
      console.warn("customId cannot be updated through this function for security reasons");
    }
    
    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      ...allowedUpdateData,
      updatedAt: new Date()
    });
    
    return true;
    
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Get all users with pagination support
 * @param {number} pageSize - Number of users per page (default: 20)
 * @param {Object} lastDoc - Last document from previous page (for pagination)
 * @returns {Promise<Object>} Object containing users array and pagination info
 */
export const getAllUsers = async (pageSize = 20, lastDoc = null) => {
  try {
    const usersCollection = collection(firestore, "users");
    let q = query(
      usersCollection, 
      orderBy("customId"),
      limit(pageSize)
    );
    
    // If continuing from a previous page
    if (lastDoc) {
      q = query(
        usersCollection,
        orderBy("customId"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      users,
      lastDoc: lastVisible,
      hasMore: querySnapshot.docs.length === pageSize
    };
    
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

/**
 * Search users by name or email
 * @param {string} searchTerm - Term to search for
 * @param {number} maxResults - Maximum results to return (default: 50)
 * @returns {Promise<Array>} Array of matching users
 */
export const searchUsers = async (searchTerm, maxResults = 50) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }
    
    const usersCollection = collection(firestore, "users");
    
    // Search by email (exact match and starts with)
    const emailQuery = query(
      usersCollection,
      where("email", ">=", searchTerm.toLowerCase()),
      where("email", "<=", searchTerm.toLowerCase() + "\uf8ff"),
      limit(maxResults)
    );
    
    // Search by full name (starts with)
    const nameQuery = query(
      usersCollection,
      where("fullName", ">=", searchTerm),
      where("fullName", "<=", searchTerm + "\uf8ff"),
      limit(maxResults)
    );
    
    // Execute both queries
    const [emailResults, nameResults] = await Promise.all([
      getDocs(emailQuery),
      getDocs(nameQuery)
    ]);
    
    // Combine results and remove duplicates
    const userMap = new Map();
    
    emailResults.forEach((doc) => {
      userMap.set(doc.id, {
        uid: doc.id,
        ...doc.data()
      });
    });
    
    nameResults.forEach((doc) => {
      userMap.set(doc.id, {
        uid: doc.id,
        ...doc.data()
      });
    });
    
    return Array.from(userMap.values());
    
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

/**
 * Get the current counter value (for admin purposes)
 * @returns {Promise<number>} Current counter value
 */
export const getCurrentUserCount = async () => {
  try {
    const counterRef = doc(firestore, "counters", "userIdCounter");
    const counterDoc = await getDoc(counterRef);
    
    if (!counterDoc.exists()) {
      return 0;
    }
    
    return counterDoc.data().lastId || 0;
    
  } catch (error) {
    console.error("Error getting current user count:", error);
    return 0;
  }
};

/**
 * Validate custom ID format
 * @param {string} customId - The custom ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidCustomId = (customId) => {
  if (!customId || typeof customId !== 'string') {
    return false;
  }
  
  // Check if it matches the RACU#### format
  const regex = /^RACU\d{4}$/;
  return regex.test(customId);
};

/**
 * Get user statistics
 * @returns {Promise<Object>} Object containing user statistics
 */
export const getUserStatistics = async () => {
  try {
    const usersCollection = collection(firestore, "users");
    
    // Get all users (you might want to implement this more efficiently for large datasets)
    const allUsersQuery = query(usersCollection);
    const allUsersSnapshot = await getDocs(allUsersQuery);
    
    let totalUsers = 0;
    let emailUsers = 0;
    let googleUsers = 0;
    let verifiedUsers = 0;
    let adminUsers = 0;
    
    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      totalUsers++;
      
      if (userData.provider === 'email') {
        emailUsers++;
      } else if (userData.provider === 'google') {
        googleUsers++;
      }
      
      if (userData.isEmailVerified) {
        verifiedUsers++;
      }
      
      if (userData.role === 'admin') {
        adminUsers++;
      }
    });
    
    const currentCounter = await getCurrentUserCount();
    
    return {
      totalUsers,
      emailUsers,
      googleUsers,
      verifiedUsers,
      adminUsers,
      currentIdCounter: currentCounter,
      lastUserId: currentCounter > 0 ? `RACU${currentCounter.toString().padStart(4, '0')}` : 'None'
    };
    
  } catch (error) {
    console.error("Error getting user statistics:", error);
    throw error;
  }
};