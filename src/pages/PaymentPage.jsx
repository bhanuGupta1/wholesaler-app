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
