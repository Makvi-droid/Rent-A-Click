import React, { useState } from 'react';
import { Eye, EyeOff, Camera, Lock, Mail, User, ArrowRight, Shield, Zap } from 'lucide-react';
import signUpPic from '../assets/signUp.svg'
import { useNavigate } from "react-router-dom";

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
    e.preventDefault(); // Fixed: Added preventDefault
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

  const passwordStrength = checkPasswordStrength(formData.password);
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl animate-ping"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            
            {/* Image Section */}
            <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-8 flex flex-col justify-center items-center text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>

            {/* JPG Image Placeholder - Replace the src with your image path */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center">
    
                {/* Image Container */}
                <div className="w-48 h-48 mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center backdrop-blur-sm">
                        <img 
                        src={signUpPic} 
                        alt="Camera Equipment" 
                        className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                RENT-N-CLICK
                </h1>
                <p className="text-xl text-purple-100 mb-8 max-w-md">
                Professional camera equipment rental for creators and professionals
                </p>

            {/* Features */}
            <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-300" />
                    <span className="text-purple-100">Secure & Trusted Platform</span>
                </div>
                <div className="flex items-center space-x-3">
                    <Camera className="w-5 h-5 text-blue-300" />
                    <span className="text-purple-100">Premium Equipment</span>
                </div>
                <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="text-purple-100">Lightning Fast Delivery</span>
                </div>
            </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 border-2 border-white/20 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 border-2 border-white/20 rounded-lg rotate-45 animate-pulse"></div>
        </div>

            {/* Form Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center relative">
              <div className="w-full max-w-md mx-auto">

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => navigate("/")} // Navigate back
                  className="flex items-center space-x-2 mb-4 text-white hover:text-purple-200 transition-colors"
                >
                  <ArrowRight className="w-5 h-5 transform rotate-180" /> {/* Arrow pointing left */}
                  <span>Back</span>
                </button>
                
                {/* Toggle Buttons - Fixed the logic */}
                <div className="relative mb-8">
                  <div className="flex bg-slate-800/50 rounded-xl p-1 backdrop-blur-sm border border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)} // Fixed: Direct state setting
                      className={`flex-1 py-3 px-6 text-sm font-medium rounded-lg transition-all duration-300 ${
                        !isSignUp
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)} // Fixed: Direct state setting
                      className={`flex-1 py-3 px-6 text-sm font-medium rounded-lg transition-all duration-300 ${
                        isSignUp
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Form Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-slate-400">
                    {isSignUp 
                      ? 'Join our community of creators' 
                      : 'Sign in to your account'
                    }
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  
                  {/* Full Name (Sign Up Only) */}
                  <div className={`transition-all duration-500 ${
                    isSignUp ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-2 text-sm text-red-400">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                    )}
                    
                    {/* Password Strength Indicator (Sign Up Only) */}
                    {isSignUp && formData.password && (
                      <div className="mt-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                strengthScore <= 2 ? 'bg-red-500' : 
                                strengthScore <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(strengthScore / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs ${
                            strengthScore <= 2 ? 'text-red-400' : 
                            strengthScore <= 4 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {strengthScore <= 2 ? 'Weak' : strengthScore <= 4 ? 'Good' : 'Strong'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password (Sign Up Only) */}
                  <div className={`transition-all duration-500 ${
                    isSignUp ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm Password"
                        className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button" // Changed back to button
                    onClick={handleSubmit} // Added onClick back
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Forgot Password (Sign In Only) */}
                {!isSignUp && (
                  <div className="text-center mt-6">
                    <button type="button" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Terms (Sign Up Only) */}
                {isSignUp && (
                  <div className="text-center mt-6">
                    <p className="text-xs text-slate-400">
                      By creating an account, you agree to our{' '}
                      <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Privacy Policy
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth