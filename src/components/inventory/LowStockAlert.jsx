// src/components/inventory/LowStockAlert.jsx
import { useState } from "react";

const LowStockAlert = ({
  products,
  onUpdateStock,
  threshold,
  onChangeThreshold,
}) => {
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [customThreshold, setCustomThreshold] = useState(threshold);

  // Handler for expanding/collapsing product details
  const toggleProductExpand = (productId) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
      setStockAdjustment(0);
    } else {
      setExpandedProduct(productId);
      setStockAdjustment(0);
    }
  };

  // Handler for adjusting stock
  const handleStockAdjustment = async (product) => {
    const newStock = Math.max(0, product.stock + stockAdjustment);
    await onUpdateStock(product.id, newStock);
    setExpandedProduct(null);
    setStockAdjustment(0);
  };

  // Handler for changing threshold
  const handleThresholdChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setCustomThreshold(value);
    }
  };

  // Handler for applying new threshold
  const applyThreshold = () => {
    onChangeThreshold(customThreshold);
  };

  return (
    <div className="mt-2 bg-white rounded-lg shadow-md border border-yellow-200 overflow-hidden">
      <div className="p-4 border-b border-yellow-100 bg-yellow-50 flex justify-between items-center">
        <h3 className="text-lg font-medium text-yellow-800">Low Stock Alert</h3>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="threshold"
            className="text-sm font-medium text-yellow-700"
          >
            Low stock threshold:
          </label>
          <input
            type="number"
            id="threshold"
            value={customThreshold}
            onChange={handleThresholdChange}
            min="0"
            className="w-16 text-center border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-md shadow-sm text-sm"
          />
          <button
            onClick={applyThreshold}
            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-sm"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {products.map((product) => (
          <div key={product.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    SKU: {product.sku || "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <div className="text-sm font-medium text-gray-900">
                    ${parseFloat(product.price).toFixed(2)}
                  </div>
                  <div className="text-xs font-medium text-red-600">
                    Stock: {product.stock}
                  </div>
                </div>
                <button
                  onClick={() => toggleProductExpand(product.id)}
                  className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform duration-200 ${expandedProduct === product.id ? "transform rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {expandedProduct === product.id && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center text-sm text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Supplier: {product.supplier || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <span>Category: {product.category}</span>
                    </div>
                    {product.reorderPoint && (
                      <div className="flex items-center text-sm text-gray-700 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span>Reorder Point: {product.reorderPoint}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <div className="flex rounded-md shadow-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setStockAdjustment((prev) => Math.max(0, prev - 1))
                        }
                        className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                      >
                        <span className="sr-only">Decrease</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 12H6"
                          />
                        </svg>
                      </button>
                      <input
                        type="number"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-16 min-w-0 border-gray-300 text-center"
                        value={stockAdjustment}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value >= 0) {
                            setStockAdjustment(value);
                          }
                        }}
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => setStockAdjustment((prev) => prev + 1)}
                        className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                      >
                        <span className="sr-only">Increase</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => handleStockAdjustment(product)}
                      className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlert;
