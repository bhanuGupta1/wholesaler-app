// src/pages/OrderProcessing.jsx
const OrderProcessing = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto text-gray-800">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">Order Processing</h1>

      {/* Introduction */}
      <p className="text-lg mb-6">
        The Wholesaler App provides a robust, real-time order processing system designed to streamline the fulfillment journey from cart to delivery. Our system supports businesses, bulk buyers, and regular users with maximum transparency and efficiency.
      </p>
            {/* Section: Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">🔍 Overview of the Order Lifecycle</h2>
        <p className="mb-4">
          Every order follows a standardized yet flexible lifecycle to ensure that both suppliers and customers are aligned on timelines and expectations.
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li><strong>Product Selection:</strong> Users browse products with live stock updates.</li>
          <li><strong>Order Submission:</strong> Cart contents are validated before checkout.</li>
          <li><strong>Payment:</strong> Multiple secure options (credit card, business account).</li>
          <li><strong>Confirmation:</strong> Email and in-app confirmation with invoice ID.</li>
          <li><strong>Fulfillment:</strong> Order packed, labeled, and queued for dispatch.</li>
          <li><strong>Shipping:</strong> Tracking ID shared and updated in the dashboard.</li>
          <li><strong>Completion:</strong> Order marked as delivered or completed.</li>
        </ol>
      </section>

    </div>
  );
};

export default OrderProcessing;
