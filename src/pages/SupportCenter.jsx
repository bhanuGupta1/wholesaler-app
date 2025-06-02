// src/pages/SupportCenter.jsx
// This component provides support information, troubleshooting, and contact details.

const SupportCenter = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">Support Center</h1>

      {/* Introduction */}
      <p className="text-lg mb-4">
        Welcome to the Wholesaler App Support Center. Our goal is to provide you with all the tools and information you need to resolve any issues and use our platform effectively.
      </p>

      {/* Contact Information */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">📞 Contact Us</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Email: <a href="mailto:support@wholesaler.com" className="text-indigo-600 underline">support@wholesaler.com</a></li>
          <li>Phone: <a href="tel:+11234567890" className="text-indigo-600 underline">(123) 456-7890</a></li>
          <li>Live Chat: Available Monday to Friday, 9AM - 5PM</li>
        </ul>
      </section>

      {/* Help Topics */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">📚 Help Topics</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Getting Started with Wholesaler</li>
          <li>Managing Products and Inventory</li>
          <li>Placing and Tracking Orders</li>
          <li>Understanding Dashboard Metrics</li>
          <li>Account Management and Security</li>
        </ul>
      </section>

      {/* Troubleshooting */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">🛠 Troubleshooting</h2>
        <p className="text-gray-700">
          If you experience any technical issues such as loading errors, login failures, or data syncing problems, try the following:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mt-2">
          <li>Clear your browser cache and cookies</li>
          <li>Ensure you're using the latest version of Chrome or Firefox</li>
          <li>Check your internet connection</li>
          <li>Try logging out and back in</li>
        </ul>
      </section>

      {/* Ticket Submission */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">💬 Submit a Ticket</h2>
        <p className="text-gray-700 mb-2">
          If your issue is not listed, please submit a support ticket with detailed information, and our team will get back to you within 24 hours.
        </p>
        <a
          href="mailto:support@wholesaler.com"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Submit a Ticket
        </a>
      </section>
    </div>
  );
};

export default SupportCenter;
