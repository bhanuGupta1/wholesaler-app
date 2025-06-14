import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const ContactSupport = () => {
  const [darkMode] = useState(false); // Connect to your theme context
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Form submitted:', formData);
    setShowSuccess(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      priority: 'medium',
      message: ''
    });
    setIsSubmitting(false);

    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Contact Support
          </h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Get in touch with our support team for personalized assistance
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow`}>
            <FaPhone className="text-indigo-600 text-3xl mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Phone Support
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-2`}>
              Call us directly
            </p>
            <a href="tel:+6495551234" className="text-indigo-600 hover:text-indigo-800 font-medium">
              +64 9 555 1234
            </a>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow`}>
            <FaEnvelope className="text-indigo-600 text-3xl mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Email Support
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-2`}>
              Send us a message
            </p>
            <a href="mailto:support@megawholesaler.co.nz" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
              support@megawholesaler.co.nz
            </a>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow`}>
            <FaClock className="text-indigo-600 text-3xl mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Business Hours
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Mon-Fri: 9AM-6PM<br />
              Sat: 10AM-4PM<br />
              Sun: Closed
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow`}>
            <FaMapMarkerAlt className="text-indigo-600 text-3xl mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Location
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Auckland, New Zealand<br />
              CBD Office
            </p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800 text-center">
              <h3 className="font-medium mb-1">Message sent successfully!</h3>
              <p className="text-sm">We'll get back to you within 24 hours.</p>
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Please describe your issue in detail..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href="tel:+6495551234"
                  className="block p-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-center"
                >
                  <FaPhone className="text-indigo-600 mx-auto mb-1" />
                  <span className="text-indigo-700 dark:text-indigo-300 font-medium text-sm">Call Now</span>
                </a>
                <a
                  href="mailto:support@megawholesaler.co.nz"
                  className="block p-3 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors text-center"
                >
                  <FaEnvelope className="text-green-600 mx-auto mb-1" />
                  <span className="text-green-700 dark:text-green-300 font-medium text-sm">Email Us</span>
                </a>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Response Times
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Urgent:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>1-2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>High:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>4-6 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Medium:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Low:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>48 hours</span>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Need Help?
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>
                Check our Help Center for instant answers to common questions.
              </p>
              <a
                href="/help-center"
                className="block text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Visit Help Center
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactSupport;