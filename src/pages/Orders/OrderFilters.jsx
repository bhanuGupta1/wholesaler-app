import React from "react";

// Reusable filter component for order status, date, and customer name
const OrderFilters = ({ filters, onFilterChange }) => {
  // Update filters on input/select change
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
      {/* Status Dropdown */}
      <div className="flex items-center">
        <label
          htmlFor="status"
          className="mr-2 text-sm font-medium text-gray-700"
        >
          Status:
        </label>
        <select
          id="status"
          name="status"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={filters.status}
          onChange={handleChange}
        >
          <option value="all">All</option>
          <option value="Completed">Completed</option>
          <option value="Processing">Processing</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Date Filter */}
      <div className="flex items-center">
        <label
          htmlFor="date"
          className="mr-2 text-sm font-medium text-gray-700"
        >
          Date:
        </label>
        <select
          id="date"
          name="date"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={filters.date}
          onChange={handleChange}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Customer Search Input */}
      <div className="flex items-center">
        <label
          htmlFor="customer"
          className="mr-2 text-sm font-medium text-gray-700"
        >
          Customer:
        </label>
        <input
          type="text"
          id="customer"
          name="customer"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
          placeholder="Search customer..."
          value={filters.customer}
          onChange={handleChange}
        />
      </div>

      {/* Export Button */}
      <div className="ml-auto">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            /* Add export functionality */
          }}
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default OrderFilters;
