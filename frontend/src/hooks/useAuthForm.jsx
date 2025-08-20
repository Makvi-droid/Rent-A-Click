// hooks/useAuthForm.js
import { useState } from 'react';

const INITIAL_FORM_STATE = {
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  phoneNumber: "",
  agreeToTerms: false,
  recaptchaToken: null,
};

export default UseAuthForm = (initialData = INITIAL_FORM_STATE) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: inputValue }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRecaptchaChange = (token) => {
    setFormData((prev) => ({ ...prev, recaptchaToken: token }));
    if (errors.recaptcha) {
      setErrors((prev) => ({ ...prev, recaptcha: "" }));
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
  };

  const setFieldError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    handleInputChange,
    handleRecaptchaChange,
    resetForm,
    setFieldError,
    clearErrors,
  };
};