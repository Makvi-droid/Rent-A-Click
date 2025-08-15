import React, { useState } from 'react';
import { Mail, User, Lock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import AuthToggle from '../components/Authentication/AuthToggle'
import BackButton from '../components/Authentication/BackButton'
import BackgroundElements from '../components/Authentication/BackgroundElements'
import FormFooter from '../components/Authentication/FormFooter'
import FormHeader from '../components/Authentication/FormHeader'
import ImageSection from '../components/Authentication/ImageSection'
import InputField from '../components/Authentication/InputField'
import PasswordStrengthIndicator from '../components/Authentication/PasswordStrengthIndicator'
import SubmitButton from '../components/Authentication/SubmitButton'

function Auth(){
    const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return { minLength, hasUpper, hasLower, hasNumber, hasSpecial };
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Input validation
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const strength = checkPasswordStrength(formData.password);
      if (!strength.minLength) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!(strength.hasUpper && strength.hasLower && strength.hasNumber)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
      }
    }
    
    // Sign up specific validations
    if (isSignUp) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make your actual API call
      console.log(isSignUp ? 'Signing up...' : 'Logging in...', formData);
      
      // Reset form on success
      setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
      setErrors({});
      
    } catch (error) {
      setErrors({ submit: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundElements />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            
            <ImageSection />

            {/* Form Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center relative">
              <div className="w-full max-w-md mx-auto">

                <BackButton navigate={navigate} />
                
                <AuthToggle isSignUp={isSignUp} setIsSignUp={setIsSignUp} />

                <FormHeader isSignUp={isSignUp} />

                {/* Form */}
                <div className="space-y-6">
                  
                  {/* Full Name (Sign Up Only) */}
                  <InputField
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    icon={User}
                    error={errors.fullName}
                    className={`transition-all duration-500 ${
                      isSignUp ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                  />

                  {/* Email */}
                  <InputField
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    icon={Mail}
                    error={errors.email}
                  />

                  {/* Password */}
                  <div>
                    <InputField
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      icon={Lock}
                      error={errors.password}
                      isPassword={true}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                    />
                    
                    {/* Password Strength Indicator (Sign Up Only) */}
                    {isSignUp && (
                      <PasswordStrengthIndicator 
                        password={formData.password}
                        checkPasswordStrength={checkPasswordStrength}
                      />
                    )}
                  </div>

                  {/* Confirm Password (Sign Up Only) */}
                  <InputField
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    icon={Lock}
                    error={errors.confirmPassword}
                    isPassword={true}
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`transition-all duration-500 ${
                      isSignUp ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                  />

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  <SubmitButton 
                    isLoading={isLoading}
                    isSignUp={isSignUp}
                    onSubmit={handleSubmit}
                  />
                </div>

                <FormFooter isSignUp={isSignUp} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Auth