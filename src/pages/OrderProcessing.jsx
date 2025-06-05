import React from 'react';
import {
  FaCogs,
  FaShippingFast,
  FaEdit,
  FaTruckMoving,
  FaPhoneAlt,
  FaEnvelope,
  FaRegClock,
  FaBoxOpen
} from 'react-icons/fa';

const OrderProcessing = () => {
  return (
    <div className="bg-gray-50 py-12 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-lg shadow-md text-gray-800">

        {/* Header */}
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">Order Processing</h1>
        <p className="text-lg mb-10 text-gray-600">
          Our order processing system ensures accuracy, transparency, and fast fulfillment — designed for both bulk and individual buyers.
        </p>

        {/* Lifecycle Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold flex items-center mb-4">
            <FaBoxOpen className="text-indigo-600 mr-2" />
            Order Lifecycle Overview
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              ['Product Selection', 'Browse inventory with live stock updates.'],
              ['Order Submission', 'Validate and place items into the cart.'],
              ['Secure Payment', 'Complete checkout via safe, encrypted gateways.'],
              ['Order Confirmation', 'Receive in-app and email confirmation instantly.'],
              ['Packaging & Fulfillment', 'Products packed and marked for dispatch.'],
              ['Shipping & Delivery', 'Tracked delivery with real-time updates.'],
            ].map(([title, desc], i) => (
              <div key={i} className="border-l-4 border-indigo-600 bg-indigo-50 p-4 rounded shadow-sm">
                <h3 className="font-semibold text-indigo-700">{title}</h3>
                <p className="text-gray-700 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Automation Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold flex items-center mb-4">
            <FaCogs className="text-indigo-600 mr-2" />
            Automation & Smart Features
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Auto-Inventory Sync:</strong> Inventory adjusts in real-time upon order.</li>
            <li><strong>Order Alerts:</strong> Get alerts on urgent or delayed orders instantly.</li>
            <li><strong>Smart Routing:</strong> Auto-scheduling deliveries based on your location.</li>
            <li><strong>Bulk Discounts:</strong> Dynamic pricing for wholesale and large orders.</li>
          </ul>
        </section>

        {/* Shipping Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold flex items-center mb-4">
            <FaShippingFast className="text-indigo-600 mr-2" />
            Shipping & Delivery Options
          </h2>
          <p className="text-gray-700 mb-4">We collaborate with reliable logistics partners for all your shipping needs:</p>
          <div className="overflow-x-auto">
            <table className="table-auto w-full border text-sm">
              <thead className="bg-indigo-100 text-indigo-800">
                <tr>
                  <th className="p-3 border">Option</th>
                  <th className="p-3 border">Time</th>
                  <th className="p-3 border">Cost</th>
                  <th className="p-3 border">Availability</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="hover:bg-gray-50">
                  <td className="p-3 border">Standard</td>
                  <td className="p-3 border">3–5 Business Days</td>
                  <td className="p-3 border">Free</td>
                  <td className="p-3 border">Nationwide</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-gray-50">
                  <td className="p-3 border">Express</td>
                  <td className="p-3 border">1–2 Business Days</td>
                  <td className="p-3 border">$15</td>
                  <td className="p-3 border">Metro Only</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 border">Bulk Freight</td>
                  <td className="p-3 border">3–7 Days</td>
                  <td className="p-3 border">Custom Quote</td>
                  <td className="p-3 border">B2B Clients</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Modifications */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold flex items-center mb-4">
            <FaEdit className="text-indigo-600 mr-2" />
            Modify or Cancel Orders
          </h2>
          <p className="mb-3 text-gray-700">
            Need to make changes? You can modify or cancel your order under certain conditions:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Orders can be edited within 1 hour of placement.</li>
            <li>Cancel directly from the "My Orders" page before shipping.</li>
            <li>For scheduled dispatch, changes are allowed up to 24 hours before shipping.</li>
          </ul>
        </section>

        {/* Tracking */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold flex items-center mb-4">
            <FaTruckMoving className="text-indigo-600 mr-2" />
            Real-Time Tracking
          </h2>
          <p className="text-gray-700 mb-2">
            Stay updated every step of the way. Your order status is visible under <strong>Dashboard → Orders</strong>:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Order Confirmed</li>
            <li>Processing & Packing</li>
            <li>Dispatched with Tracking ID</li>
            <li>Out for Delivery</li>
            <li>Delivered</li>
          </ul>
        </section>

        {/* Support */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold flex items-center mb-4">
            <FaRegClock className="text-indigo-600 mr-2" />
            Need Assistance?
          </h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>
              <FaEnvelope className="inline-block text-indigo-600 mr-2" />
              Email: <a href="mailto:orders@wholesaler.com" className="text-indigo-600 underline">orders@wholesaler.com</a>
            </li>
            <li>
              <FaPhoneAlt className="inline-block text-indigo-600 mr-2" />
              Phone: (123) 456-7890 (NZ only)
            </li>
            <li>
              <FaRegClock className="inline-block text-indigo-600 mr-2" />
              Live Chat: 9AM–5PM NZST, Monday to Friday
            </li>
          </ul>
        </section>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/orders"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium text-lg shadow-sm transition"
          >
            View My Orders
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderProcessing;
