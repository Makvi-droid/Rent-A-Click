// services/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../firebase";

export class AuthService {
  static async createUserDocument(user, additionalData = {}) {
    const userRef = doc(firestore, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      const userData = {
        fullName: additionalData.fullName || user.displayName || "",
        email: user.email,
        phoneNumber: additionalData.phoneNumber || user.phoneNumber || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: "customer",
        twoFA: false,
        isEmailVerified: user.emailVerified || false,
        profileComplete: Boolean(additionalData.fullName),
        ...additionalData
      };

      await setDoc(userRef, userData);
      return { isNewUser: true, userData };
    }

    return { isNewUser: false, userData: docSnap.data() };
  }

  static async updateLastLogin(userId) {
    const userRef = doc(firestore, "users", userId);
    await setDoc(userRef, { 
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  static async signUpWithEmail(email, password, additionalData) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      fullName: additionalData.fullName?.trim() || "",
      phoneNumber: additionalData.phoneNumber?.trim() || "",
      provider: "email",
      profileComplete: true,
      agreeToTerms: additionalData.agreeToTerms || false
    };

    await this.createUserDocument(user, userData);

    // Send email verification
    try {
      await sendEmailVerification(user);
      return { user, emailVerificationSent: true };
    } catch (verificationError) {
      console.warn("Email verification failed:", verificationError.message);
      return { user, emailVerificationSent: false };
    }
  }

  static async signInWithEmail(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await this.updateLastLogin(user.uid);
    return user;
  }

  static async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const { isNewUser } = await this.createUserDocument(user, {
      provider: "google"
    });

    if (!isNewUser) {
      await this.updateLastLogin(user.uid);
    }

    return { user, isNewUser };
  }
}