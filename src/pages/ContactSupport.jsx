import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const ContactSupport = () => {
  const [darkMode] = useState(false); // Will be connected to your theme context

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
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
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 text-center hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
              <FaPhone className="text-indigo-600 text-xl" />
            </div>
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

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 text-center hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
              <FaEnvelope className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Email Support
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-2`}>
              Send us a message
            </p>
            <a href="mailto:support@megawholesaler.co.nz" className="text-indigo-600 hover:text-indigo-800 font-medium">
              support@megawholesaler.co.nz
            </a>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 text-center hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
              <FaClock className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Business Hours
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Mon-Fri: 9AM-6PM<br />
              Sat: 10AM-4PM<br />
              Sun: Closed
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 text-center hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
              <FaMapMarkerAlt className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Location
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Auckland, New Zealand<br />
              CBD Office
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;