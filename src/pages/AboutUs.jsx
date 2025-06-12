import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaHandshake, FaShieldAlt, FaTags, FaWarehouse } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-10">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold text-black mb-4">About Wholesaler</h1>

            <p className="text-lg text-gray-600">
              Empowering businesses through seamless and secure wholesale trading.
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Who We Are</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              WholesaleHub is a dynamic B2B platform built to revolutionize how businesses discover, purchase,
              and manage wholesale goods. From local startups to international enterprises, we bridge the
              gap between trusted manufacturers and fast-growing businesses worldwide.
            </p>
          </section>

          {/* Mission Section */}
          <section className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our mission is to streamline the wholesale supply chain and provide a trusted, intuitive,
              and secure environment for businesses to thrive. We’re here to empower buyers and suppliers
              with the tools and support they need to grow together.
            </p>
          </section>

          {/* Core Offerings */}
          <section className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">What Sets Us Apart</h2>
            <div className="grid md:grid-cols-2 gap-8 text-gray-700 text-base">
              <div className="flex items-start space-x-4">
                <FaWarehouse className="text-indigo-600 text-2xl" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Vast Product Inventory</h4>
                  <p>Access thousands of wholesale products from global, verified suppliers.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaShieldAlt className="text-indigo-600 text-2xl" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Secure Transactions</h4>
                  <p>All payments are encrypted, tracked, and backed by buyer protection policies.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaTags className="text-indigo-600 text-2xl" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Competitive Pricing</h4>
                  <p>Get wholesale discounts, loyalty benefits, and limited-time offers year-round.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <FaHandshake className="text-indigo-600 text-2xl" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Verified Partnerships</h4>
                  <p>We screen every supplier to ensure quality, consistency, and business integrity.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Our Core Values</h2>
            <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
              <li><strong>Integrity:</strong> We stand for transparency, fairness, and ethical practices.</li>
              <li><strong>Innovation:</strong> We build smart tools to make your business scalable and efficient.</li>
              <li><strong>Customer-Centricity:</strong> Your success is our priority — always.</li>
              <li><strong>Global Reach:</strong> We support international trading and multilingual experiences.</li>
            </ul>
          </section>

          {/* Trusted by Companies */}
          <section className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Trusted by 1,000+ Businesses</h2>
            <p className="text-gray-700 text-lg mb-2">
              From retail chains to online brands and logistics companies — businesses trust WholesaleHub
              for reliable sourcing and long-term partnerships.
            </p>
          </section>

          {/* Contact Section */}
          <section className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <div className="space-y-4 text-gray-700 text-lg">
              <div className="flex items-center">
                <FaEnvelope className="mr-3 text-indigo-600" />
                <span><strong>Email:</strong> info@wholesalehub.com</span>
              </div>
              <div className="flex items-center">
                <FaPhoneAlt className="mr-3 text-indigo-600" />
                <span><strong>Phone:</strong> +1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-3 text-indigo-600" />
                <span><strong>Address:</strong> 123 Commerce Street, Business District, NY 10001</span>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Ready to grow your wholesale business?</h3>
            <p className="text-gray-600 mb-4">Join the WholesaleHub network and start scaling today.</p>
            <a
              href="/signup"
              className="inline-block px-6 py-3 bg-indigo-600 text-white text-lg font-medium rounded hover:bg-indigo-700 transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
