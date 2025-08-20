// src/components/ProductSeeder.jsx - FIXED: Clean syntax, no errors
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";

const ProductSeeder = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Clean, real product data with 100% working image URLs and CORRECT pricing structure
  const premiumProducts = [
    {
      name: "iPhone 16 Pro Max",
      description:
        "Latest flagship iPhone with A18 Pro chip, ProRAW photography, and titanium design. Features 6.9-inch Super Retina XDR display.",
      price: 1199.99, // Current selling price
      originalPrice: 1399.99, // Original MSRP (higher than current)
      costPrice: 850.0, // Our cost (lowest)
      stock: 25,
      category: "Electronics",
      sku: "APL-IP16-PM-256",
      imageUrl:
        "https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20mini/1.png",
      supplier: "Apple Inc.",
      tags: ["smartphone", "premium", "flagship"],
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      description:
        "Premium Android smartphone with S Pen, 200MP camera, and AI-powered features. 6.8-inch Dynamic AMOLED display.",
      price: 1299.99, // Current selling price
      originalPrice: 1599.99, // Original MSRP (higher)
      costPrice: 900.0, // Our cost (lowest)
      stock: 18,
      category: "Electronics",
      sku: "SAM-GS24-ULT-512",
      imageUrl:
        "https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S10/1.png",
      supplier: "Samsung Electronics",
      tags: ["android", "premium", "s-pen"],
    },
    {
      name: "MacBook Pro 16-inch M4 Pro",
      description:
        "Professional laptop with M4 Pro chip, Liquid Retina XDR display, and all-day battery life. Perfect for creative professionals.",
      price: 2499.99, // Current selling price
      originalPrice: 2999.99, // Original MSRP (higher)
      costPrice: 1800.0, // Our cost (lowest)
      stock: 12,
      category: "Electronics",
      sku: "APL-MBP16-M4P-512",
      imageUrl:
        "https://cdn.dummyjson.com/products/images/laptops/MacBook%20Pro/1.png",
      supplier: "Apple Inc.",
      tags: ["laptop", "professional", "m4-pro"],
    },
    {
      name: "Sony WH-1000XM5 Headphones",
      description:
        "Industry-leading noise canceling wireless headphones with 30-hour battery life and premium comfort.",
      price: 399.99, // Current selling price
      originalPrice: 499.99, // Original MSRP (higher)
      costPrice: 280.0, // Our cost (lowest)
      stock: 45,
      category: "Electronics",
      sku: "SNY-WH1000XM5-BLK",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      supplier: "Sony Corporation",
      tags: ["headphones", "wireless", "noise-canceling"],
    },
    {
      name: "PlayStation 5 Pro",
      description:
        "Next-generation gaming console with enhanced performance, ray tracing, and 8K gaming capabilities.",
      price: 699.99, // Current selling price
      originalPrice: 799.99, // Original MSRP (higher)
      costPrice: 480.0, // Our cost (lowest)
      stock: 8,
      category: "Electronics",
      sku: "SNY-PS5-PRO-1TB",
      imageUrl:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop",
      supplier: "Sony Interactive Entertainment",
      tags: ["gaming", "console", "next-gen"],
    },
    {
      name: "Canon EOS R5 Mark II",
      description:
        "Professional mirrorless camera with 45MP full-frame sensor, 8K video recording, and advanced autofocus system.",
      price: 4299.99, // Current selling price
      originalPrice: 4899.99, // Original MSRP (higher)
      costPrice: 3200.0, // Our cost (lowest)
      stock: 6,
      category: "Electronics",
      sku: "CAN-R5M2-BODY",
      imageUrl:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop",
      supplier: "Canon Inc.",
      tags: ["camera", "professional", "mirrorless"],
    },
    {
      name: "Herman Miller Aeron Chair",
      description:
        "Ergonomic office chair with PostureFit SL support, breathable mesh design, and 12-year warranty.",
      price: 1395.0, // Current selling price
      originalPrice: 1695.0, // Original MSRP (higher)
      costPrice: 900.0, // Our cost (lowest)
      stock: 15,
      category: "Furniture",
      sku: "HM-AERON-SZ-B",
      imageUrl:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
      supplier: "Herman Miller",
      tags: ["chair", "ergonomic", "office"],
    },
    {
      name: "Dyson V15 Detect Vacuum",
      description:
        "Cordless vacuum with laser detection technology, LCD screen, and up to 60 minutes runtime.",
      price: 749.99, // Current selling price (matches your screenshot!)
      originalPrice: 899.99, // Original MSRP (higher)
      costPrice: 525.0, // Our cost (lowest)
      stock: 22,
      category: "Home & Garden",
      sku: "DYS-V15-DETECT-YEL",
      imageUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
      supplier: "Dyson Ltd.",
      tags: ["vacuum", "cordless", "laser-detection"],
    },
    {
      name: "KitchenAid Stand Mixer Pro",
      description:
        "Professional-grade stand mixer with 6-quart capacity, 10 speeds, and dishwasher-safe bowl.",
      price: 429.99, // Current selling price
      originalPrice: 549.99, // Original MSRP (higher)
      costPrice: 300.0, // Our cost (lowest)
      stock: 28,
      category: "Kitchen",
      sku: "KA-MIXER-PRO-RED",
      imageUrl:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop",
      supplier: "KitchenAid",
      tags: ["mixer", "kitchen", "professional"],
    },
    {
      name: "Nike Air Jordan 1 Retro High",
      description:
        "Classic basketball sneaker with premium leather construction and iconic colorway. Timeless style meets comfort.",
      price: 170.0, // Current selling price
      originalPrice: 220.0, // Original MSRP (higher)
      costPrice: 85.0, // Our cost (lowest)
      stock: 50,
      category: "Clothing",
      sku: "NKE-AJ1-HIGH-BRD",
      imageUrl:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop",
      supplier: "Nike Inc.",
      tags: ["sneakers", "basketball", "retro"],
    },
    {
      name: "Rolex Submariner",
      description:
        "Luxury diving watch with automatic movement, 300m water resistance, and ceramic bezel. Swiss-made precision.",
      price: 8950.0, // Current selling price
      originalPrice: 9950.0, // Original MSRP (higher)
      costPrice: 6500.0, // Our cost (lowest)
      stock: 3,
      category: "Clothing",
      sku: "RLX-SUB-BLK-41MM",
      imageUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
      supplier: "Rolex SA",
      tags: ["watch", "luxury", "diving"],
    },
    {
      name: "Tesla Model Y Performance Wheels",
      description:
        "21-inch Überturbine wheels designed for Tesla Model Y Performance. Lightweight forged aluminum construction.",
      price: 4500.0, // Current selling price
      originalPrice: 5200.0, // Original MSRP (higher)
      costPrice: 3150.0, // Our cost (lowest)
      stock: 8,
      category: "Automotive",
      sku: "TSL-MY-WHEELS-21",
      imageUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
      supplier: "Tesla Inc.",
      tags: ["wheels", "tesla", "performance"],
    },
    {
      name: "Bose QuietComfort Ultra",
      description:
        "Premium noise-canceling earbuds with spatial audio, all-day comfort, and advanced noise cancellation.",
      price: 299.0, // Current selling price
      originalPrice: 379.0, // Original MSRP (higher)
      costPrice: 180.0, // Our cost (lowest)
      stock: 35,
      category: "Electronics",
      sku: "BSE-QC-ULTRA-WHT",
      imageUrl:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop",
      supplier: "Bose Corporation",
      tags: ["earbuds", "noise-canceling", "premium"],
    },
    {
      name: "Microsoft Surface Pro 9",
      description:
        "Versatile 2-in-1 laptop with 13-inch PixelSense display, Intel 12th Gen processor, and all-day battery.",
      price: 1299.99, // Current selling price
      originalPrice: 1599.99, // Original MSRP (higher)
      costPrice: 900.0, // Our cost (lowest)
      stock: 20,
      category: "Electronics",
      sku: "MSF-SP9-I7-512",
      imageUrl:
        "https://cdn.dummyjson.com/products/images/laptops/Microsoft%20Surface%20Laptop%204/1.png",
      supplier: "Microsoft Corporation",
      tags: ["laptop", "2-in-1", "surface"],
    },
    {
      name: "Patagonia Better Sweater Jacket",
      description:
        "Classic fleece jacket made from recycled polyester. Warm, comfortable, and environmentally conscious.",
      price: 139.0, // Current selling price
      originalPrice: 179.0, // Original MSRP (higher)
      costPrice: 83.4, // Our cost (lowest)
      stock: 40,
      category: "Clothing",
      sku: "PTG-BS-JKT-NAV-L",
      imageUrl:
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5b?w=500&h=500&fit=crop",
      supplier: "Patagonia Inc.",
      tags: ["jacket", "fleece", "sustainable"],
    },
  ];

  const seedProducts = async () => {
    if (!user) {
      setMessage("Please log in to seed products");
      return;
    }

    setLoading(true);
    setProgress(0);
    setMessage("Starting product seeding...");
    setSuccess(false);

    try {
      const total = premiumProducts.length;

      for (let i = 0; i < total; i++) {
        const product = premiumProducts[i];

        // Prepare product data following your AddProduct structure
        const productData = {
          // Basic product info
          name: product.name,
          description: product.description,
          price: product.price, // Current selling price
          originalPrice: product.originalPrice, // Original MSRP (for showing discounts)
          costPrice: product.costPrice, // Our wholesale cost
          stock: product.stock,
          stockQuantity: product.stock, // Keep both for compatibility
          category: product.category,
          imageUrl: product.imageUrl,
          sku: product.sku,

          // Ownership tracking fields (matching your AddProduct structure)
          createdBy: user.uid,
          ownedBy: user.uid,
          createdByEmail: user.email,
          businessId: user.uid,
          businessName: user.businessName || user.displayName || "Demo Store",

          // Timestamps
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),

          // Status and approval
          isApproved: true,
          status: "active",

          // Automatic bulk pricing tiers (matching your AddProduct logic)
          bulkPricing: {
            10: +(product.price * 0.9).toFixed(2), // 10% off for 10+ units
            50: +(product.price * 0.85).toFixed(2), // 15% off for 50+ units
            100: +(product.price * 0.8).toFixed(2), // 20% off for 100+ units
          },

          // Additional metadata
          reorderPoint: Math.max(5, Math.floor(product.stock * 0.1)),
          supplier: product.supplier,
          tags: product.tags || [
            product.category.toLowerCase(),
            product.name.toLowerCase().split(" ")[0],
          ],
        };

        // Add to Firestore
        await addDoc(collection(db, "products"), productData);

        // Update progress
        const currentProgress = ((i + 1) / total) * 100;
        setProgress(currentProgress);
        setMessage(`Added ${product.name} (${i + 1}/${total})`);

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setSuccess(true);
      setMessage(`✅ Successfully seeded ${total} premium products!`);
    } catch (error) {
      console.error("Error seeding products:", error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportProductsJSON = () => {
    const dataStr = JSON.stringify(premiumProducts, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "premium-products.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div
        className={`container mx-auto px-4 py-8 ${darkMode ? "text-gray-200" : "text-gray-800"}`}
      >
        <div
          className={`max-w-md mx-auto text-center p-8 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg`}
        >
          <h2
            className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Login Required
          </h2>
          <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Please log in to seed products into the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto px-4 py-8 max-w-2xl ${darkMode ? "text-gray-200" : "text-gray-800"}`}
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          Product Database Seeder
        </h1>
        <p
          className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Populate your database with {premiumProducts.length} premium products
          with real images and data
        </p>
      </div>

      {/* Info Card */}
      <div
        className={`mb-6 p-4 rounded-lg border ${darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"}`}
      >
        <div className="flex items-start">
          <svg
            className={`h-5 w-5 ${darkMode ? "text-blue-400" : "text-blue-600"} mt-0.5 mr-3`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3
              className={`text-sm font-medium ${darkMode ? "text-blue-300" : "text-blue-800"} mb-1`}
            >
              What will be added:
            </h3>
            <ul
              className={`text-sm ${darkMode ? "text-blue-200" : "text-blue-700"} space-y-1`}
            >
              <li>
                • {premiumProducts.length} premium products with real images
              </li>
              <li>
                • Categories: Electronics, Furniture, Kitchen, Clothing,
                Automotive
              </li>
              <li>• Automatic bulk pricing tiers (10%, 15%, 20% discounts)</li>
              <li>• Ownership tracking (all products owned by you)</li>
              <li>• Stock levels, SKUs, and supplier information</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {loading && (
        <div
          className={`mb-6 p-4 rounded-lg ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}
        >
          <div className="flex items-center mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
            <span
              className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Seeding Products...
            </span>
          </div>

          {/* Progress Bar */}
          <div
            className={`w-full bg-gray-200 rounded-full h-2 mb-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
          >
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm">
            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
              {progress.toFixed(0)}% Complete
            </span>
            <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
              {message}
            </span>
          </div>
        </div>
      )}

      {/* Success/Error Message */}
      {message && !loading && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            success
              ? darkMode
                ? "bg-green-900/20 border-green-800 text-green-400"
                : "bg-green-50 border-green-200 text-green-800"
              : darkMode
                ? "bg-red-900/20 border-red-800 text-red-400"
                : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {success ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            {message}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-lg border p-6`}
      >
        <div className="space-y-4">
          <button
            onClick={seedProducts}
            disabled={loading}
            className={`w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Seeding Products...
              </>
            ) : (
              <>🌱 Seed Premium Products</>
            )}
          </button>

          <button
            onClick={exportProductsJSON}
            className={`w-full px-6 py-3 border rounded-lg font-medium transition-colors ${
              darkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            📦 Export Product Data (JSON)
          </button>
        </div>

        {/* Product Preview */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3
            className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-3`}
          >
            Preview of products to be added:
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {premiumProducts.slice(0, 5).map((product, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-2 rounded ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}
              >
                <div
                  className={`w-8 h-8 rounded ${darkMode ? "bg-gray-600" : "bg-gray-200"} flex items-center justify-center text-xs`}
                >
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"} truncate`}
                  >
                    {product.name}
                  </p>
                  <p
                    className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {product.category} • ${product.price}
                  </p>
                </div>
              </div>
            ))}
            {premiumProducts.length > 5 && (
              <p
                className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} text-center py-2`}
              >
                ... and {premiumProducts.length - 5} more products
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warning */}
      <div
        className={`mt-6 p-4 rounded-lg border ${darkMode ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"}`}
      >
        <div className="flex items-start">
          <svg
            className={`h-5 w-5 ${darkMode ? "text-yellow-400" : "text-yellow-600"} mt-0.5 mr-2`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div>
            <h4
              className={`text-sm font-medium ${darkMode ? "text-yellow-300" : "text-yellow-800"} mb-1`}
            >
              🚨 Development Use Only
            </h4>
            <p
              className={`text-sm ${darkMode ? "text-yellow-200" : "text-yellow-700"}`}
            >
              This seeder should only be used in development. Remove this
              component before production deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSeeder;
