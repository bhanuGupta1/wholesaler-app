// src/pages/Registration.jsx - Fixed Registration Page with Approval System
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/";
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    phoneNumber: '',
    accountType: 'user' // user, business, manager
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Determine user status based on account type (NEW)
  const getUserStatus = (accountType) => {
    switch (accountType) {
      case 'user':
        return 'approved'; // Regular users are auto-approved
      case 'business':
      case 'manager':
      case 'admin':
        return 'pending'; // Business roles require approval
      default:
        return 'pending';
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.accountType === 'business' && !formData.businessName.trim()) {
      setError('Business name is required for business accounts');
      return false;
    }
    
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      
      // FIXED: Create user document with both old and new fields for backward compatibility
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
        accountType: formData.accountType,
        businessType: formData.accountType === 'business' ? 'buyer' : null,
        businessName: formData.businessName || null,
        phoneNumber: formData.phoneNumber || null,
        
        // NEW STATUS SYSTEM (for new users)
        status: getUserStatus(formData.accountType),
        
        // BACKWARD COMPATIBILITY (maintain old structure)
        approved: formData.accountType === 'user' ? true : false,
        
        // ADDITIONAL STATUS FIELDS (for future use)
        approvedBy: null,
        approvedAt: null,
        rejectedReason: null,
        
        // SYSTEM FIELDS
        isActive: true,
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // USER PREFERENCES
        preferences: {
          notifications: true,
          marketing: false,
          theme: darkMode ? 'dark' : 'light'
        }
      });
      
      // Show different messages based on account type
      if (formData.accountType !== 'user') {
        setError(''); // Clear any errors
        // Don't navigate immediately - let them see the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Regular users navigate immediately
        navigate(from, { replace: true });
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Please sign in instead.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill demo account
  const fillDemoAccount = (type) => {
    const demoAccounts = {
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@wholesaler.com',
        password: 'password123',
        confirmPassword: 'password123',
        accountType: 'user',
        businessName: '',
        phoneNumber: '+1-555-0123'
      },
      business: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'business@wholesaler.com',
        password: 'password123',
        confirmPassword: 'password123',
        accountType: 'business',
        businessName: 'Smith Electronics Ltd',
        phoneNumber: '+1-555-0456'
      },
      manager: {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'manager@wholesaler.com',
        password: 'password123',
        confirmPassword: 'password123',
        accountType: 'manager',
        businessName: 'Johnson Supply Co',
        phoneNumber: '+1-555-0789'
      }
    };
    
    setFormData(demoAccounts[type]);
    setAcceptTerms(true);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Left Panel - Brand information */}
      <div className={`hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-12 flex-col justify-between`}>
        <div>
          <div className="flex items-center mb-8">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-4v4h4V7zm1-2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h12z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold ml-3">Wholesaler</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">Join Our Wholesale Network</h2>
          <p className="text-indigo-100 mb-8">
            Create your account to access exclusive wholesale pricing and manage your business efficiently.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Wholesale Pricing</h3>
                <p className="text-indigo-100 text-sm mt-1">Access competitive wholesale prices on thousands of products.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Business Tools</h3>
                <p className="text-indigo-100 text-sm mt-1">Manage inventory, orders, and analytics all in one place.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">24/7 Support</h3>
                <p className="text-indigo-100 text-sm mt-1">Get help when you need it with our dedicated support team.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-12">
          <p className="text-sm text-indigo-100">© {new Date().getFullYear()} Wholesaler App. All rights reserved.</p>
        </div>
      </div>
      
      {/* Right Panel - Registration Form */}
      <div className={`flex flex-col justify-center items-center p-6 md:p-12 w-full md:w-1/2 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-center mb-8">
            <div className={`h-10 w-10 ${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'} rounded-lg flex items-center justify-center text-white`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-4v4h4V7zm1-2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h12z" />
              </svg>
            </div>
            <h1 className={`text-2xl font-bold ml-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Wholesaler</h1>
          </div>
          
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create your account</h2>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Join thousands of businesses already using our platform</p>
          </div>
          
          {/* Demo accounts section */}
          <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-indigo-50'} rounded-lg p-4`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-indigo-700'} font-medium mb-3`}>
              Quick Demo Registration
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => fillDemoAccount('user')}
                className={`text-xs px-2 py-1 rounded ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-indigo-300' 
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                }`}
              >
                User Account
              </button>
              <button 
                onClick={() => fillDemoAccount('business')}
                className={`text-xs px-2 py-1 rounded ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-indigo-300' 
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                }`}
              >
                Business Account
              </button>
              <button 
                onClick={() => fillDemoAccount('manager')}
                className={`text-xs px-2 py-1 rounded ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-indigo-300' 
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                }`}
              >
                Manager Account
              </button>
            </div>
          </div>
          
          {/* Success message for business/manager accounts */}
          {loading && formData.accountType !== 'user' && (
            <div className={`mb-6 ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-500'} border-l-4 p-4 rounded-md`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    Your {formData.accountType} account will be reviewed by our admin team. You'll receive an email once approved.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className={`mb-6 ${darkMode ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-500'} border-l-4 p-4 rounded-md`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm rounded-md ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } border`}
                  placeholder="John"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm rounded-md ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } border`}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 sm:text-sm rounded-md border`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label htmlFor="accountType" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account Type</label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="user">Individual User</option>
                <option value="business">Business Account</option>
                <option value="manager">Manager Account</option>
              </select>
              {formData.accountType !== 'user' && (
                <p className={`mt-1 text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  ⚠️ {formData.accountType === 'business' ? 'Business' : 'Manager'} accounts require admin approval before access is granted.
                </p>
              )}
            </div>

            {/* Business Name (conditional) */}
            {(formData.accountType === 'business' || formData.accountType === 'manager') && (
              <div>
                <label htmlFor="businessName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Business Name</label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm rounded-md ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } border`}
                  placeholder="Your Business Name"
                />
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number (Optional)</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm rounded-md ${
                  darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } border`}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 py-2 sm:text-sm rounded-md border`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 py-2 sm:text-sm rounded-md border`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded`}
              />
              <label htmlFor="accept-terms" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                I agree to the{' '}
                <a href="#" className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>
          
          {/* Social Login Options */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  className={`w-full inline-flex justify-center py-2 px-4 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium`}
                  onClick={() => {
                    // Handle Google signup
                    console.log('Google signup clicked');
                  }}
                >
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className={`w-full inline-flex justify-center py-2 px-4 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium`}
                  onClick={() => {
                    // Handle Facebook signup
                    console.log('Facebook signup clicked');
                  }}
                >
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"></path>
                  </svg>
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link to="/login" className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;