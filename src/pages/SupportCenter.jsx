// src/pages/SupportCenter.jsx
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


    </div>
  );
};

export default SupportCenter;
