import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { uploadToCloudinary } from "../services/cloudinaryService";

// Import all modular components
import ProfilePhotoUpload from "../components/Account/ProfilePhoto";
import PersonalInformation from "../components/Account/PersonalInformation";
import ContactInformation from "../components/Account/ContactInformation";
import Address from "../components/Account/Address";
import IdVerification from "../components/Account/IdVerification";

const AccountPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",

    // Contact Information
    primaryPhone: "",
    alternativePhone: "",

    // Address
    streetAddress: "",
    barangay: "",
    city: "",
    state: "",
    zipCode: "",

    // ID Verification
    idType: "",
    idNumber: "",
    idDocument: null,
    idDocumentUrl: "", // Cloudinary URL

    // Profile Photo
    profilePhoto: null,
    profilePhotoUrl: "", // Cloudinary URL
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  // Load user data from Firestore customers collection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);

        try {
          // Find customer document by firebaseUid
          const customersRef = collection(firestore, "customers");
          const q = query(
            customersRef,
            where("firebaseUid", "==", firebaseUser.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Customer exists
            const customerDoc = querySnapshot.docs[0];
            const customerData = customerDoc.data();
            setCustomerId(customerDoc.id);

            // Populate form with existing data
            setFormData((prev) => ({
              ...prev,
              firstName: customerData.firstName || "",
              lastName: customerData.lastName || "",
              dateOfBirth: customerData.dateOfBirth || "",
              primaryPhone: customerData.phoneNumber || "",
              alternativePhone: customerData.alternativePhone || "",
              streetAddress: customerData.address?.street || "",
              barangay: customerData.address?.barangay || "",
              city: customerData.address?.city || "",
              state: customerData.address?.state || "",
              zipCode: customerData.address?.zipCode || "",
              idType: customerData.idVerification?.type || "",
              idNumber: customerData.idVerification?.number || "",
              idDocumentUrl: customerData.idVerification?.documentUrl || "",
              profilePhotoUrl: customerData.profilePicture || "",
            }));
          } else {
            // No customer document exists yet - will be created on first save
            console.log("No customer document found, will create on save");
          }
        } catch (error) {
          console.error("Error loading customer data:", error);
        }
      } else {
        // No user is signed in, redirect to login
        navigate("/auth");
        return;
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    setSaveMessage("");
    setUploadProgress("");

    try {
      // Prepare URLs for images
      let profilePhotoUrl = formData.profilePhotoUrl;
      let idDocumentUrl = formData.idDocumentUrl;

      // Upload images to Cloudinary if new files were selected
      const uploads = [];

      if (formData.profilePhoto instanceof File) {
        setUploadProgress("Uploading profile photo...");
        uploads.push({
          file: formData.profilePhoto,
          folder: `profile-photos/${currentUser.uid}`,
          field: "profilePhoto",
        });
      }

      if (formData.idDocument instanceof File) {
        setUploadProgress("Uploading ID document...");
        uploads.push({
          file: formData.idDocument,
          folder: `id-documents/${currentUser.uid}`,
          field: "idDocument",
        });
      }

      // Upload all files
      if (uploads.length > 0) {
        setUploadProgress(`Uploading ${uploads.length} file(s)...`);

        for (let i = 0; i < uploads.length; i++) {
          const upload = uploads[i];
          setUploadProgress(`Uploading file ${i + 1} of ${uploads.length}...`);

          try {
            const result = await uploadToCloudinary(upload.file, upload.folder);

            if (upload.field === "profilePhoto") {
              profilePhotoUrl = result.url;
            } else if (upload.field === "idDocument") {
              idDocumentUrl = result.url;
            }

            console.log(`${upload.field} uploaded:`, result.url);
          } catch (uploadError) {
            console.error(`Error uploading ${upload.field}:`, uploadError);
            throw new Error(
              `Failed to upload ${upload.field}: ${uploadError.message}`
            );
          }
        }
      }

      setUploadProgress("Saving to database...");

      // Prepare data for Firestore update
      const updateData = {
        firebaseUid: currentUser.uid,
        email: currentUser.email,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.primaryPhone,
        alternativePhone: formData.alternativePhone,
        address: {
          street: formData.streetAddress,
          barangay: formData.barangay,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        idVerification: {
          type: formData.idType,
          number: formData.idNumber,
          documentUrl: idDocumentUrl,
          documentUploaded: !!idDocumentUrl,
          verified: false, // Admin will verify
        },
        profilePicture: profilePhotoUrl,
        updatedAt: new Date(),
      };

      console.log("Saving customer data:", updateData);

      if (customerId) {
        // Update existing customer document
        const customerRef = doc(firestore, "customers", customerId);
        await updateDoc(customerRef, updateData);
      } else {
        // Create new customer document
        const customersRef = collection(firestore, "customers");
        const newCustomerRef = doc(customersRef);
        await setDoc(newCustomerRef, {
          ...updateData,
          createdAt: new Date(),
        });
        setCustomerId(newCustomerRef.id);
      }

      console.log("Save successful!");
      setUploadProgress("");
      setSaveMessage("Settings saved successfully!");

      // Navigate back to profile page after a short delay
      setTimeout(() => {
        navigate("/profilePage");
      }, 1500);
    } catch (error) {
      console.error("Detailed error saving customer data:", error);
      setUploadProgress("");
      setSaveMessage(`Error saving changes: ${error.message}`);
      setTimeout(() => setSaveMessage(""), 5000);
    }

    setIsSaving(false);
  };

  const isFormValid = () => {
    const required = [
      "firstName",
      "lastName",
      "dateOfBirth",
      "primaryPhone",
      "streetAddress",
      "barangay",
      "city",
      "state",
      "zipCode",
      "idType",
      "idNumber",
    ];

    const fieldsValid = required.every((field) =>
      formData[field]?.toString().trim()
    );

    // Check if documents are uploaded (either new files or existing URLs)
    const profilePhotoValid =
      formData.profilePhoto instanceof File || formData.profilePhotoUrl;
    const idDocumentValid =
      formData.idDocument instanceof File || formData.idDocumentUrl;

    return fieldsValid && profilePhotoValid && idDocumentValid;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mb-4"></div>
          <p className="text-gray-300">Loading your account information...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background effects - matching ProfilePage */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-pink-900/10" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500/5 to-transparent rounded-full blur-3xl" />

      {/* Floating particles - matching ProfilePage */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animation: `float ${4 + i * 0.3}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-8">
        {/* Header with back navigation - matching ProfilePage style */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/profilePage")}
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <div className="p-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 group-hover:border-purple-500/50 group-hover:bg-gray-700/50 transition-all duration-300 shadow-lg">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            </div>
            <span className="font-medium hidden sm:block">Back to Profile</span>
          </button>

          {/* Page title - matching ProfilePage style */}
          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Manage your account information
            </p>
          </div>
        </div>

        {/* Form sections with ProfilePage styling */}
        <div className="space-y-6">
          <ProfilePhotoUpload
            currentPhoto={formData.profilePhotoUrl || formData.profilePhoto}
            onPhotoChange={(file) => handleInputChange("profilePhoto", file)}
          />

          {/* PersonalInformation now handles its own data fetching */}
          <PersonalInformation data={formData} onChange={handleInputChange} />

          <ContactInformation data={formData} onChange={handleInputChange} />

          <Address data={formData} onChange={handleInputChange} />

          <IdVerification data={formData} onChange={handleInputChange} />
        </div>

        {/* Upload progress indicator */}
        {uploadProgress && (
          <div className="mt-6 text-center p-4 rounded-2xl backdrop-blur-sm border border-blue-700/30 bg-blue-900/20">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <p className="text-sm text-blue-300">{uploadProgress}</p>
            </div>
          </div>
        )}

        {/* Action buttons section - matching ProfilePage button style */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end items-center">
          {/* Save button with ProfilePage styling */}
          <button
            onClick={handleSave}
            disabled={!isFormValid() || isSaving}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-xl backdrop-blur-sm border relative overflow-hidden group
              ${
                isFormValid()
                  ? "bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 text-white border-purple-500/30 hover:shadow-purple-500/25"
                  : "bg-gray-800/50 cursor-not-allowed text-gray-400 border-gray-700/50"
              }`}
          >
            <span className="relative z-10 flex items-center justify-center space-x-3">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </span>
            {isFormValid() && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}
          </button>

          {!isFormValid() && (
            <p className="text-xs text-gray-500 max-w-xs text-center sm:text-right">
              Please fill in all required fields and upload required documents
            </p>
          )}
        </div>

        {/* Save message with ProfilePage styling */}
        {saveMessage && (
          <div
            className={`mt-6 text-center p-4 rounded-2xl backdrop-blur-sm border font-medium shadow-xl
            ${
              saveMessage.includes("Error")
                ? "text-red-400 bg-red-900/20 border-red-700/30"
                : "text-green-400 bg-green-900/20 border-green-700/30"
            }`}
          >
            {saveMessage}
          </div>
        )}

        {/* Information note with ProfilePage styling */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-2xl backdrop-blur-sm shadow-xl">
          <p className="text-sm text-blue-200/80 text-center">
            <strong className="text-blue-300">Note:</strong> Your email is
            automatically synced from your account and cannot be changed here.
            Contact support if you need to update your email address.
          </p>
        </div>
      </div>

      {/* Animation styles - matching ProfilePage */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          100% {
            transform: translateY(-15px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AccountPage;
