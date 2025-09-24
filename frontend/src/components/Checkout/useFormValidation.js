// 3. hooks/useFormValidation.js
import { useState } from 'react';

export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateStep = (step, formData) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.startDate) newErrors.startDate = "Start date is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";
        if (formData.startDate && formData.endDate) {
          const startDate = new Date(formData.startDate);
          const endDate = new Date(formData.endDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (startDate < today) {
            newErrors.startDate = "Start date cannot be in the past";
          }
          if (endDate <= startDate) {
            newErrors.endDate = "End date must be after start date";
          }
        }
        break;
      
      case 2:
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        if (!formData.phone.trim()) {
          newErrors.phone = "Phone is required";
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
          newErrors.phone = "Please enter a valid phone number";
        }
        
        if (formData.deliveryMethod === "delivery") {
          if (!formData.address.trim()) newErrors.address = "Address is required";
          if (!formData.city.trim()) newErrors.city = "City is required";
          if (!formData.state.trim()) newErrors.state = "Province is required";
          if (!formData.zipCode.trim()) {
            newErrors.zipCode = "ZIP code is required";
          } else if (!/^\d{4}$/.test(formData.zipCode)) {
            newErrors.zipCode = "Please enter a valid 4-digit ZIP code";
          }
        }
        break;
      
      case 3:
        if (formData.paymentMethod === "paypal") {
          if (!formData.paypalEmail.trim()) {
            newErrors.paypalEmail = "PayPal email is required";
          } else if (!/\S+@\S+\.\S+/.test(formData.paypalEmail)) {
            newErrors.paypalEmail = "Please enter a valid PayPal email address";
          }
        }
        break;
      
      case 4:
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = "You must accept the terms and conditions";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, setErrors, validateStep };
};
