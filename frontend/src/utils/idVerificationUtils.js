// utils/idVerificationUtils.js
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Create a new ID verification record
 */
export const createIdVerificationRecord = async (userId, userEmail, submissionId) => {
  try {
    const verificationData = {
      userId,
      userEmail,
      submissionId,
      status: 'pending', // pending, verified, rejected
      createdAt: serverTimestamp(),
      formSubmitted: false,
      googleFormResponseId: null,
      verificationToken: null,
      verifiedAt: null,
      verifiedBy: null, // admin userId who verified
      rejectionReason: null,
      attempts: 1
    };

    const docRef = doc(collection(db, 'idVerifications'));
    await setDoc(docRef, verificationData);
    
    return {
      success: true,
      verificationId: docRef.id,
      submissionId
    };
  } catch (error) {
    console.error('Error creating ID verification record:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if user has a verified ID
 */
export const checkUserIdVerification = async (userId) => {
  try {
    const q = query(
      collection(db, 'idVerifications'),
      where('userId', '==', userId),
      where('status', '==', 'verified')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const verificationDoc = querySnapshot.docs[0];
      const data = verificationDoc.data();
      
      return {
        verified: true,
        verificationToken: data.verificationToken,
        verifiedAt: data.verifiedAt,
        verificationId: verificationDoc.id
      };
    }
    
    return {
      verified: false,
      message: 'No verified ID found'
    };
  } catch (error) {
    console.error('Error checking ID verification:', error);
    return {
      verified: false,
      error: error.message
    };
  }
};

/**
 * Check verification status by submission ID or user ID
 */
export const checkVerificationStatus = async (userId, submissionId = null) => {
  try {
    let q;
    
    if (submissionId) {
      q = query(
        collection(db, 'idVerifications'),
        where('userId', '==', userId),
        where('submissionId', '==', submissionId)
      );
    } else {
      q = query(
        collection(db, 'idVerifications'),
        where('userId', '==', userId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Get the most recent verification
      const verificationDocs = querySnapshot.docs.sort((a, b) => {
        const aTime = a.data().createdAt?.toMillis() || 0;
        const bTime = b.data().createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
      
      const latestDoc = verificationDocs[0];
      const data = latestDoc.data();
      
      return {
        found: true,
        status: data.status,
        verified: data.status === 'verified',
        verificationToken: data.verificationToken,
        verifiedAt: data.verifiedAt,
        createdAt: data.createdAt,
        formSubmitted: data.formSubmitted,
        rejectionReason: data.rejectionReason,
        verificationId: latestDoc.id
      };
    }
    
    return {
      found: false,
      verified: false,
      message: 'No verification record found'
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return {
      found: false,
      verified: false,
      error: error.message
    };
  }
};

/**
 * Update verification status (typically called by admin or webhook)
 */
export const updateVerificationStatus = async (verificationId, status, verificationToken = null, verifiedBy = null) => {
  try {
    const docRef = doc(db, 'idVerifications', verificationId);
    
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (status === 'verified') {
      updateData.verificationToken = verificationToken || `verified_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      updateData.verifiedAt = serverTimestamp();
      if (verifiedBy) updateData.verifiedBy = verifiedBy;
    }
    
    if (status === 'rejected' && verifiedBy) {
      updateData.verifiedBy = verifiedBy;
    }
    
    await updateDoc(docRef, updateData);
    
    return {
      success: true,
      verificationId,
      status,
      verificationToken: updateData.verificationToken
    };
  } catch (error) {
    console.error('Error updating verification status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mark form as submitted (called when Google Form webhook is triggered)
 */
export const markFormSubmitted = async (userId, submissionId, googleFormResponseId = null) => {
  try {
    const q = query(
      collection(db, 'idVerifications'),
      where('userId', '==', userId),
      where('submissionId', '==', submissionId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      
      await updateDoc(docRef, {
        formSubmitted: true,
        googleFormResponseId,
        formSubmittedAt: serverTimestamp(),
        status: 'submitted' // Change status to submitted
      });
      
      return {
        success: true,
        verificationId: docRef.id
      };
    }
    
    return {
      success: false,
      error: 'Verification record not found'
    };
  } catch (error) {
    console.error('Error marking form as submitted:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate a secure submission ID
 */
export const generateSubmissionId = (userId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${userId.substr(0, 8)}_${timestamp}_${random}`;
};