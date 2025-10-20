import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';

// Import all modular components
import ProfilePhotoUpload from '../components/Account/ProfilePhoto';
import PersonalInformation from '../components/Account/PersonalInformation';
import ContactInformation from '../components/Account/ContactInformation';
import Address from '../components/Account/Address';
import IdVerification from '../components/Account/IdVerification';

const AccountPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    // Personal Information (read-only, managed by PersonalInformation component)
    dateOfBirth: '',
    
    // Contact Information
    primaryPhone: '',
    alternativePhone: '',
    
    // Address
    streetAddress: '',
    barangay: '',
    city: '',
    state: '',
    zipCode: '',
    
    // ID Verification
    idType: '',
    idNumber: '',
    idDocument: null,
    
    // Profile Photo
    profilePhoto: null
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load user data from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        
        try {
          // Get user document from Firestore
          const userRef = doc(firestore, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Populate form with existing data
            setFormData(prev => ({
              ...prev,
              dateOfBirth: userData.dateOfBirth || '',
              primaryPhone: userData.phoneNumber || '',
              alternativePhone: userData.alternativePhone || '',
              streetAddress: userData.address?.street || '',
              barangay: userData.address?.barangay || '',
              city: userData.address?.city || '',
              state: userData.address?.state || '',
              zipCode: userData.address?.zipCode || '',
              idType: userData.idVerification?.type || '',
              idNumber: userData.idVerification?.number || '',
              profilePhoto: userData.profilePicture || null
            }));
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        // No user is signed in, redirect to login
        navigate('/auth');
        return;
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const userRef = doc(firestore, "users", currentUser.uid);
      
      // Debug: Log what we're trying to save
      console.log('Attempting to save:', {
        userUID: currentUser.uid,
        formData: formData
      });
      
      // Prepare data for Firestore update (excluding file objects)
      const updateData = {
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.primaryPhone,
        alternativePhone: formData.alternativePhone,
        address: {
          street: formData.streetAddress,
          barangay: formData.barangay,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        idVerification: {
          type: formData.idType,
          number: formData.idNumber,
          documentUploaded: !!formData.idDocument
        },
        // Note: File objects cannot be saved directly to Firestore
        // profilePicture: formData.profilePhoto, // Commented out - files need Firebase Storage
        updatedAt: new Date()
      };

      console.log('Update data:', updateData);

      await updateDoc(userRef, updateData);
      
      console.log('Save successful!');
      setSaveMessage('Settings saved successfully!');
      
      // Navigate back to profile page after a short delay
      setTimeout(() => {
        navigate('/profilePage');
      }, 1500);
      
    } catch (error) {
      console.error("Detailed error saving user data:", error);
      setSaveMessage(`Error saving changes: ${error.message}`);
      setTimeout(() => setSaveMessage(''), 5000);
    }
    
    setIsSaving(false);
  };

  const isFormValid = () => {
    const required = [
      'dateOfBirth', 'primaryPhone', 'streetAddress', 'barangay',
      'city', 'state', 'zipCode', 'idType', 'idNumber'
    ];
    
    // Debug logging - remove this after fixing
    console.log('Form validation check:', {
      formData: formData,
      requiredFields: required.map(field => ({
        field,
        value: formData[field],
        hasValue: !!formData[field]?.toString().trim(),
        isEmpty: !formData[field]?.toString().trim()
      })),
      idDocument: !!formData.idDocument,
      profilePhoto: !!formData.profilePhoto,
      allFieldsValid: required.every(field => formData[field]?.toString().trim()),
      documentsValid: formData.idDocument && formData.profilePhoto,
      // TEMPORARY: Test without file uploads
      validWithoutFiles: required.every(field => formData[field]?.toString().trim())
    });
    
    const fieldsValid = required.every(field => formData[field]?.toString().trim());
    // TEMPORARY: Commented out file upload requirements for testing
    // const documentsValid = formData.idDocument && formData.profilePhoto;
    
    // return fieldsValid && documentsValid;
    return fieldsValid; // TEMPORARY: Only check text fields
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
            onClick={() => navigate('/profilePage')}
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group"
          >
            <div className="p-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 group-hover:border-purple-500/50 group-hover:bg-gray-700/50 transition-all duration-300 shadow-lg">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            </div>
            <span className="font-medium hidden sm:block">Back to Profile</span>
          </button>

          {/* Page title - matching ProfilePage style */}
          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-xs sm:text-sm text-gray-400">Manage your account information</p>
          </div>
        </div>

        {/* Form sections with ProfilePage styling */}
        <div className="space-y-6">
          <ProfilePhotoUpload
            currentPhoto={formData.profilePhoto}
            onPhotoChange={(file) => handleInputChange('profilePhoto', file)}
          />
          
          {/* PersonalInformation now handles its own data fetching */}
          <PersonalInformation 
            data={formData}
            onChange={handleInputChange}
          />
          
          <ContactInformation 
            data={formData}
            onChange={handleInputChange}
          />
          
          <Address
            data={formData}
            onChange={handleInputChange}
          />
          
          <IdVerification 
            data={formData}
            onChange={handleInputChange}
          />
        </div>

        {/* Action buttons section - matching ProfilePage button style */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end items-center">
          {/* Save button with ProfilePage styling */}
          <button
            onClick={handleSave}
            disabled={!isFormValid() || isSaving}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-xl backdrop-blur-sm border relative overflow-hidden group
              ${isFormValid() 
                ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 text-white border-purple-500/30 hover:shadow-purple-500/25' 
                : 'bg-gray-800/50 cursor-not-allowed text-gray-400 border-gray-700/50'}`}
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
              Please fill in all required fields to save your changes
            </p>
          )}
        </div>

        {/* Save message with ProfilePage styling */}
        {saveMessage && (
          <div className={`mt-6 text-center p-4 rounded-2xl backdrop-blur-sm border font-medium shadow-xl
            ${saveMessage.includes('Error') 
              ? 'text-red-400 bg-red-900/20 border-red-700/30' 
              : 'text-green-400 bg-green-900/20 border-green-700/30'}`}>
            {saveMessage}
          </div>
        )}

        {/* Information note with ProfilePage styling */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-2xl backdrop-blur-sm shadow-xl">
          <p className="text-sm text-blue-200/80 text-center">
            <strong className="text-blue-300">Note:</strong> Your name and email are automatically synced from your account and cannot be changed here.
            Contact support if you need to update this information.
          </p>
        </div>
      </div>

      {/* Animation styles - matching ProfilePage */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-15px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default AccountPage;