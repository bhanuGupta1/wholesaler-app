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
