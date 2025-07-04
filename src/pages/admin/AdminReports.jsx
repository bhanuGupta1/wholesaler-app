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

    // Convert HTML to PDF using browser's print functionality
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const sendEmailReport = (data) => {
    const subject = `Admin Dashboard Report - ${new Date().toLocaleDateString()}`;
    const body = `Admin Dashboard Report Summary:
    
Total Users: ${data.analytics?.totalUsers || 0}
Total Orders: ${data.analytics?.totalOrders || 0}
Total Products: ${data.analytics?.totalProducts || 0}
Total Revenue: $${data.analytics?.totalRevenue?.toFixed(2) || '0.00'}
Average Order Value: $${data.analytics?.averageOrderValue?.toFixed(2) || '0.00'}

Generated on: ${new Date().toLocaleString()}

Note: This is an automated report from your admin dashboard.`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Report types
  const reportTypes = [
    {
      id: 'users',
      title: 'Users Report',
      description: 'Complete user database with account types and status',
      icon: Users,
      color: 'blue',
      count: reports.users.length
    },
    {
      id: 'orders',
      title: 'Orders Report',
      description: 'All orders with customer details and revenue data',
      icon: ShoppingCart,
      color: 'green',
      count: reports.orders.length
    },
    {
      id: 'products',
      title: 'Products Report',
      description: 'Product inventory with pricing and stock levels',
      icon: BarChart3,
      color: 'purple',
      count: reports.products.length
    },
    {
      id: 'analytics',
      title: 'Analytics Summary',
      description: 'Key performance metrics and business insights',
      icon: TrendingUp,
      color: 'orange',
      count: Object.keys(reports.analytics).length
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <div>Loading reports data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Reports Dashboard
              </h1>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Generate and export comprehensive business reports
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                  darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 border-blue-500/50'
                    : 'bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50'
                }`}
              >
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Revenue', value: `$${reports.analytics.totalRevenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'green' },
            { title: 'Total Orders', value: reports.analytics.totalOrders || 0, icon: ShoppingCart, color: 'blue' },
            { title: 'Total Users', value: reports.analytics.totalUsers || 0, icon: Users, color: 'purple' },
            { title: 'Avg Order Value', value: `$${reports.analytics.averageOrderValue?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: 'orange' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  stat.color === 'green' ? 'bg-green-100 text-green-600' :
                  stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Export Options */}
        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } mb-8`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-blue-400' : 'text-blue-600'
          } flex items-center`}>
            <Download className="mr-3 h-5 w-5" />
            Quick Export Options
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportToCSV(reports, `admin-report-${new Date().toISOString().split('T')[0]}.csv`)}
              className={`p-4 rounded border transition-all hover:scale-105 text-center ${
                darkMode
                  ? 'bg-green-800/20 border-green-700 text-green-400 hover:bg-green-800/30'
                  : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
              }`}
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">CSV Export</div>
              <div className="text-xs opacity-75">Download raw data</div>
            </button>

            <button
              onClick={() => exportToPDF(reports, `admin-report-${new Date().toISOString().split('T')[0]}.pdf`)}
              className={`p-4 rounded border transition-all hover:scale-105 text-center ${
                darkMode
                  ? 'bg-red-800/20 border-red-700 text-red-400 hover:bg-red-800/30'
                  : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
              }`}
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">PDF Report</div>
              <div className="text-xs opacity-75">Generate formatted report</div>
            </button>

            <button
              onClick={() => sendEmailReport(reports)}
              className={`p-4 rounded border transition-all hover:scale-105 text-center ${
                darkMode
                  ? 'bg-blue-800/20 border-blue-700 text-blue-400 hover:bg-blue-800/30'
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <div className="text-2xl mb-2">📧</div>
              <div className="font-medium">Email Report</div>
              <div className="text-xs opacity-75">Send via email</div>
            </button>
          </div>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    report.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    report.color === 'green' ? 'bg-green-100 text-green-600' :
                    report.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {report.title}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {report.description}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {report.count} records
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => exportToCSV({ [report.id]: reports[report.id] }, `${report.id}-report.csv`)}
                  className={`px-3 py-1 text-xs rounded ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportToPDF({ [report.id]: reports[report.id], analytics: reports.analytics }, `${report.id}-report.pdf`)}
                  className={`px-3 py-1 text-xs rounded ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Export PDF
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;