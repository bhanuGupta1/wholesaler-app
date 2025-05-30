// src/components/common/UpgradeToSellerModal.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { requestSellerUpgrade } from '../../services/businessUpgradeService';

const UpgradeToSellerModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    businessDescription: '',
    productCategories: [],
    estimatedMonthlyRevenue: '',
    reasonForUpgrade: '',
    hasExperience: false,
    agreeToTerms: false
  });

  const productCategoryOptions = [
    'Electronics', 'Clothing & Fashion', 'Home & Garden', 'Health & Beauty',
    'Sports & Outdoors', 'Automotive', 'Books & Media', 'Food & Beverages',
    'Industrial Supplies', 'Office Supplies', 'Arts & Crafts', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the seller terms and conditions');
      return;
    }

    if (formData.productCategories.length === 0) {
      setError('Please select at least one product category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestSellerUpgrade(user.uid, {
        businessDescription: formData.businessDescription,
        productCategories: formData.productCategories,
        estimatedMonthlyRevenue: formData.estimatedMonthlyRevenue,
        reasonForUpgrade: formData.reasonForUpgrade,
        hasExperience: formData.hasExperience,
        businessName: user.businessName,
        currentBusinessType: user.businessType
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit upgrade request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🚀 Upgrade to Seller Account
            </h2>
            <button
              onClick={onClose}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Benefits Section */}
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
              ✨ What You'll Get as a Seller
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-700'}`}>
                <div>✅ List unlimited products</div>
                <div>✅ Real-time inventory management</div>
                <div>✅ Advanced order processing</div>
              </div>
              <div className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-700'}`}>
                <div>✅ Detailed sales analytics</div>
                <div>✅ Customer management tools</div>
                <div>✅ Priority support</div>
              </div>
            </div>
          </div>

          {error && (
            <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Description */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Business Description *
              </label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                required
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                placeholder="Describe your business and what you plan to sell..."
              />
            </div>

            {/* Product Categories */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Product Categories * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {productCategoryOptions.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.productCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estimated Monthly Revenue */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Estimated Monthly Revenue
              </label>
              <select
                name="estimatedMonthlyRevenue"
                value={formData.estimatedMonthlyRevenue}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
              >
                <option value="">Select range...</option>
                <option value="under-1k">Under $1,000</option>
                <option value="1k-5k">$1,000 - $5,000</option>
                <option value="5k-10k">$5,000 - $10,000</option>
                <option value="10k-25k">$10,000 - $25,000</option>
                <option value="25k-50k">$25,000 - $50,000</option>
                <option value="over-50k">Over $50,000</option>
              </select>
            </div>

            {/* Reason for Upgrade */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Why do you want to become a seller?
              </label>
              <textarea
                name="reasonForUpgrade"
                value={formData.reasonForUpgrade}
                onChange={handleChange}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                placeholder="Tell us about your goals and motivation..."
              />
            </div>

            {/* Experience Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasExperience"
                checked={formData.hasExperience}
                onChange={handleChange}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                I have previous experience selling products online
              </label>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mt-1"
              />
              <label className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                I agree to the{' '}
                <a href="#" className={`${darkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'} underline`}>
                  Seller Terms and Conditions
                </a>{' '}
                and understand that my upgrade request will be reviewed by admin
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </div>
                ) : (
                  'Submit Upgrade Request'
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-3 px-6 rounded-lg font-medium border transition-colors ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpgradeToSellerModal;