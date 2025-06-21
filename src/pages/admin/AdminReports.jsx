// src/pages/admin/AdminReports.jsx - Complete Reports Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Filter,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const AdminReports = () => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    users: [],
    orders: [],
    products: [],
    analytics: {}
  });
  const [dateRange, setDateRange] = useState('30d');
  const [selectedReports, setSelectedReports] = useState(new Set());

  // Fetch all data for reports
  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [usersSnapshot, ordersSnapshot, productsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'products'))
      ]);

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate analytics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
      const totalUsers = users.length;
      const businessUsers = users.filter(u => u.accountType === 'business').length;

      setReports({
        users,
        orders,
        products,
        analytics: {
          totalRevenue,
          averageOrderValue,
          totalUsers,
          businessUsers,
          totalOrders: orders.length,
          totalProducts: products.length
        }
      });
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  // Export functions
  const exportToCSV = (data, filename) => {
    let csvContent = '';
    
    if (data.users) {
      csvContent += 'USERS REPORT\n';
      csvContent += 'ID,Name,Email,Account Type,Status,Created Date\n';
      data.users.forEach(user => {
        csvContent += `"${user.id}","${user.displayName || ''}","${user.email}","${user.accountType}","${user.status || 'active'}","${user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}"\n`;
      });
      csvContent += '\n';
    }

    if (data.orders) {
      csvContent += 'ORDERS REPORT\n';
      csvContent += 'Order ID,Customer Email,Total,Status,Date,Items Count\n';
      data.orders.forEach(order => {
        csvContent += `"${order.id}","${order.customerEmail || ''}","${order.total || 0}","${order.status || ''}","${order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}","${order.items?.length || 0}"\n`;
      });
      csvContent += '\n';
    }

    if (data.products) {
      csvContent += 'PRODUCTS REPORT\n';
      csvContent += 'ID,Name,Category,Price,Stock,Creator\n';
      data.products.forEach(product => {
        csvContent += `"${product.id}","${product.name || ''}","${product.category || ''}","${product.price || 0}","${product.stock || 0}","${product.createdBy || ''}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async (data, filename) => {
    // Create a simple HTML content for PDF
    const htmlContent = `
      <html>
        <head>
          <title>Admin Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Admin Dashboard Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          <div class="summary">
            <h2>Summary</h2>
            <p>Total Users: ${data.analytics?.totalUsers || 0}</p>
            <p>Total Orders: ${data.analytics?.totalOrders || 0}</p>
            <p>Total Products: ${data.analytics?.totalProducts || 0}</p>
            <p>Total Revenue: $${data.analytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
            <p>Average Order Value: $${data.analytics?.averageOrderValue?.toFixed(2) || '0.00'}</p>
          </div>

          <h2>Users (Top 10)</h2>
          <table>
            <tr><th>Name</th><th>Email</th><th>Account Type</th><th>Status</th></tr>
            ${data.users?.slice(0, 10).map(user => `
              <tr>
                <td>${user.displayName || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${user.accountType}</td>
                <td>${user.status || 'active'}</td>
              </tr>
            `).join('') || ''}
          </table>

          <h2>Recent Orders (Top 10)</h2>
          <table>
            <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
            ${data.orders?.slice(0, 10).map(order => `
              <tr>
                <td>${order.id}</td>
                <td>${order.customerEmail || 'N/A'}</td>
                <td>$${order.total?.toFixed(2) || '0.00'}</td>
                <td>${order.status || 'N/A'}</td>
                <td>${order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
              </tr>
            `).join('') || ''}
          </table>
        </body>
      </html>
    `;
