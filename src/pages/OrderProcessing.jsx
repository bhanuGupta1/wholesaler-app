// src/pages/OrderProcessing.jsx
// Here I create the OrderProcessing component with an introduction and layout.

const OrderProcessing = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto text-gray-800">
    
      // Here I add the page title and introduction.
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">Order Processing</h1>
      <p className="text-lg mb-6">
        The Wholesaler App provides a robust, real-time order processing system designed to streamline the fulfillment journey from cart to delivery. Our system supports businesses, bulk buyers, and regular users with maximum transparency and efficiency.
      </p>

      // Here I define the Order Lifecycle section explaining each step.
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

      // Here I introduce automation features that improve efficiency.
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">⚙️ Automation & Smart Features</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>Auto-Inventory Sync:</strong> Real-time deduction upon order placement.</li>
          <li><strong>Order Alerts:</strong> Instant notifications for low stock or urgent orders.</li>
          <li><strong>Smart Routing:</strong> Optimized delivery scheduling based on location.</li>
          <li><strong>Bulk Order Discounts:</strong> Dynamic pricing applied for large volumes.</li>
        </ul>
      </section>

      // Here I define the shipping and delivery options using a table format.
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">🚚 Shipping & Delivery</h2>
        <p className="mb-2">We partner with multiple logistics providers to offer flexible shipping:</p>
        <table className="table-auto w-full text-left border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Option</th>
              <th className="p-2 border">Delivery Time</th>
              <th className="p-2 border">Cost</th>
              <th className="p-2 border">Availability</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Standard</td>
              <td className="p-2 border">3–5 Business Days</td>
              <td className="p-2 border">Free</td>
              <td className="p-2 border">All Regions</td>
            </tr>
            <tr>
              <td className="p-2 border">Express</td>
              <td className="p-2 border">1–2 Business Days</td>
              <td className="p-2 border">$15</td>
              <td className="p-2 border">Metro Areas Only</td>
            </tr>
            <tr>
              <td className="p-2 border">Bulk Freight</td>
              <td className="p-2 border">3–7 Days</td>
              <td className="p-2 border">Custom Quote</td>
              <td className="p-2 border">Business Accounts</td>
            </tr>
          </tbody>
        </table>
      </section>

      // Here I allow users to modify or cancel their orders.
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">✏️ Modify or Cancel Orders</h2>
        <p className="text-gray-700 mb-2">
          We understand that plans change. Here's how to modify your order:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Orders can be edited within 1 hour of placement.</li>
          <li>To cancel, navigate to your Order History & click “Cancel” before it ships.</li>
          <li>Business users can schedule future dispatches using advanced settings.</li>
        </ul>
      </section>

      // Here I add tracking and support details for order inquiries.
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">📦 Real-Time Tracking</h2>
        <p className="text-gray-700">
          Every shipment comes with a tracking number visible under <strong>User Dashboard → Orders</strong>. Live status includes:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mt-2">
          <li>Order Confirmed</li>
          <li>Packed</li>
          <li>Shipped</li>
          <li>Out for Delivery</li>
          <li>Delivered</li>
        </ul>
      </section>

      // Here I add FAQ and support contact details.
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">💬 Need Help?</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Email: <a href="mailto:orders@wholesaler.com" className="text-indigo-600 underline">orders@wholesaler.com</a></li>
          <li>Phone: (123) 456-7890 (NZ only)</li>
          <li>Live Chat: In-app support available from 9AM–5PM NZST</li>
        </ul>
      </section>

      <div className="mt-10 text-center">
        <a
          href="/orders"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 text-lg"
        >
          View My Orders
        </a>
      </div>

    </div>
  );
};

export default OrderProcessing;
