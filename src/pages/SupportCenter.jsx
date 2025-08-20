import React from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaBookOpen,
  FaTools,
  FaTicketAlt,
} from "react-icons/fa";

const SupportCenter = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-10">
          {/* Here I add a header section with a title and brief introduction */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">
              Support Center
            </h1>
            <p className="text-gray-600 text-lg">
              Need help? Our support team is here to assist you with any issues
              or questions.
            </p>
          </div>

          {/* Here I add a section for contact information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <FaPhoneAlt className="text-indigo-600 mr-2" />
              Contact Us
            </h2>
            <ul className="text-gray-700 space-y-2 pl-6 list-disc">
              {/* Here I add email contact details */}
              <li>
                <FaEnvelope className="inline-block mr-2 text-indigo-600" />
                Email:{" "}
                <a
                  href="mailto:support@wholesaler.com"
                  className="text-indigo-600 underline"
                >
                  support@wholesaler.com
                </a>
              </li>
              {/* Here I add phone contact details */}
              <li>
                <FaPhoneAlt className="inline-block mr-2 text-indigo-600" />
                Phone:{" "}
                <a
                  href="tel:+11234567890"
                  className="text-indigo-600 underline"
                >
                  (123) 456-7890
                </a>
              </li>
              {/* Here I add live chat availability details */}
              <li>
                <FaClock className="inline-block mr-2 text-indigo-600" />
                Live Chat: Monday – Friday, 9AM – 5PM (NZST)
              </li>
            </ul>
          </section>

          {/* Here I add a section listing help topics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <FaBookOpen className="text-indigo-600 mr-2" />
              Help Topics
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 text-gray-700">
              {/* Here I add help topics for getting started */}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <h3 className="font-semibold text-indigo-700">
                  Getting Started
                </h3>
                <p>
                  Learn how to create an account, navigate the dashboard, and
                  start placing orders.
                </p>
              </div>
              {/* Here I add inventory management help topics */}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <h3 className="font-semibold text-indigo-700">
                  Inventory Management
                </h3>
                <p>
                  Manage your products, stock levels, and availability settings
                  effectively.
                </p>
              </div>
            </div>
          </section>

          {/* Here I add a troubleshooting section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
              <FaTools className="text-indigo-600 mr-2" />
              Troubleshooting
            </h2>
            <p className="text-gray-700 mb-2">
              Try the following solutions for common technical issues:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Clear your browser cache and cookies</li>
              <li>
                Ensure you are using the latest version of Chrome or Firefox
              </li>
              <li>Check your internet connection and firewall</li>
              <li>Try logging out and logging back in</li>
            </ul>
          </section>

          {/* Here I add a submit ticket section */}
          <section className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 flex justify-center items-center mb-4">
              <FaTicketAlt className="text-indigo-600 mr-2" />
              Submit a Ticket
            </h2>
            <p className="text-gray-700 mb-6">
              If you need personalized help, send us a ticket and our team will
              respond within 24 hours.
            </p>
            <a
              href="mailto:support@wholesaler.com"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Contact Support
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
