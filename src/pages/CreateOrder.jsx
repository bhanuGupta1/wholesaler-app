import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ProductCard } from './GuestDashboard'; // Reuse ProductCard
import ThemeToggle from '../components/common/ThemeToggle';
const CreateOrder = () => {
  const { darkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const productList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
      setLoading(false);
    };
    fetchProducts();
  }, []);
  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };
  const goToPayment = () => {
    if (!cart.length) {
      alert("Please select at least one item to proceed.");
      return;
    }
    localStorage.setItem('order', JSON.stringify(cart)); // Temp store
    navigate('/payment');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.stock), 0).toFixed(2);
  };

  return (
    <Layout>
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create New Order</h1>
          <ThemeToggle />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} darkMode={darkMode}>
                <button
                  onClick={() => addToCart(product)}
                  className={`mt-4 w-full py-2 px-4 rounded font-medium ${
                    product.stock > 0 
                      ? darkMode 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : darkMode 
                        ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                  }`}
                  disabled={product.stock <= 0}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </ProductCard>
            ))}
          </div>
        )}
                {/* Cart Section */}
        {cart.length > 0 && (
          <div className={`mt-10 p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
            <ul>
              {cart.map(item => (
                <li key={item.id} className="flex justify-between py-2 border-b border-gray-300">
                  <span>{item.name}</span>
                  <span>${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between font-bold">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
            <button
              onClick={goToPayment}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

