import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PaymentPage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    bankName: '',
    accountNumber: ''
  });
  const [success, setSuccess] = useState(false);

  const cart = JSON.parse(localStorage.getItem('order')) || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate payment success
    setTimeout(() => {
      setSuccess(true);
      localStorage.removeItem('order');
    }, 1000);
  };

  if (success) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : ''}`}>
        <div className={`p-6 ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-400'} border-l-4 rounded-md`}>
          <h2 className="text-lg font-medium">✅ Payment Successful!</h2>
          <p className="mt-2">Your order has been placed successfully.</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : ''}`}>
      <h1 className="text-3xl font-bold mb-6">Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items Summary */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
          <h2 className="font-bold mb-4">Order Summary</h2>
          <ul>
            {cart.map((item, index) => (
              <li key={index} className="py-2 flex justify-between">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
            <h2 className="text-xl font-semibold mb-4">Choose Payment Method</h2>
            <div className="mb-6">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="card">Credit Card</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <form onSubmit={handleSubmit}>
              {paymentMethod === 'card' ? (
                <>
                  <div className="mb-4">
                    <label className="block mb-2">Card Number</label>
                    <input type="text" name="cardNumber" onChange={handleChange} required
                           className="w-full p-2 border rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block mb-2">Expiry Date</label>
                      <input type="text" name="expiry" placeholder="MM/YY" onChange={handleChange} required
                             className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="block mb-2">CVV</label>
                      <input type="text" name="cvv" onChange={handleChange} required
                             className="w-full p-2 border rounded" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block mb-2">Bank Name</label>
                    <input type="text" name="bankName" onChange={handleChange} required
                           className="w-full p-2 border rounded" />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Account Number</label>
                    <input type="text" name="accountNumber" onChange={handleChange} required
                           className="w-full p-2 border rounded" />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="mt-6 w-full py-3 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm & Pay
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
