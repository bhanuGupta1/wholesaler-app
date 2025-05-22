# 🧾 Wholesaler App – Inventory & Order Management

A comprehensive React + Firebase-based application for managing wholesale inventory and customer orders in real-time with advanced features including dark mode, analytics, and guest access.

---

## 🚀 Team Members

- 👑 **Bhanu** – App UI, Navigation, Dashboard & Enhanced Features
- 🧱 **Sahib** – Product Inventory (CRUD + Stock Logic)
- 🔌 **Paras** – Firebase Integration + Order System

---

## 🔧 Tech Stack

- **Frontend**: React 18 with Vite
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (for image uploads)
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Animations**: Framer Motion (for enhanced dashboard)

---

## ✨ Features

### Core Features
- **Inventory Management**: Add, edit, delete products with real-time stock control
- **Order System**: Place orders with live product selection and automatic stock deduction
- **Order History**: View, filter, and sort orders by customer, date, and status
- **Invoice Generation**: Create and print professional invoices
- **Real-time Updates**: Live database synchronization via Firestore

### Enhanced Features
- **Dark/Light Mode**: Toggle between themes with persistent settings
- **Guest Access**: Browse products and view orders without authentication
- **Role-based Dashboards**: Different interfaces for admin, manager, and regular users
- **Advanced Analytics**: Performance metrics with interactive charts
- **Low Stock Alerts**: Automatic notifications for inventory management
- **Bulk Upload**: CSV import for product inventory
- **Image Upload**: Product image management with Firebase Storage
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Search & Filtering**: Advanced filtering across all sections
- **Data Seeding**: Automatic sample data generation for testing

### User Experience
- **Enhanced Dashboard**: Interactive charts, real-time metrics, and quick actions
- **Activity Timeline**: Track recent actions and system updates
- **Stock Adjustment**: Quick stock level modifications with +/- controls
- **Loading States**: Smooth loading animations and skeleton loaders
- **Error Handling**: Comprehensive error messages and recovery options

---

## 🏗 Project Structure

```
src/
├── components/
│   ├── common/           # Shared components (Layout, Header, etc.)
│   ├── dashboard/        # Dashboard-specific components
│   └── inventory/        # Inventory management components
├── context/              # React Context providers
├── firebase/             # Firebase configuration
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── services/             # API services
├── utils/                # Utility functions
└── styles/               # CSS and styling
```

---

## 🚦 Branch Structure

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code with all features |
| `feature/bhanu/app-ui` | Main UI, enhanced dashboard & theming |
| `feature/sahib/inventory` | Inventory CRUD with advanced features |
| `feature/paras/orders-and-firebase` | Orders system & Firebase integration |

---

## 🛠 How to Run Locally

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project setup

### Installation

```bash
# Clone the repository
git clone https://github.com/bhanuGupta1/wholesaler-app.git
cd wholesaler-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database, Authentication, and Storage
3. Update `src/firebase/config.js` with your Firebase configuration
4. Set up Firestore security rules for your collections

### Environment Setup

The app will automatically detect if your database is empty and offer to create sample data for testing.

---

## 🔐 Authentication

### Demo Accounts
- **Admin**: `admin@wholesaler.com` / `password123`
- **Manager**: `manager@wholesaler.com` / `password123`  
- **User**: `user@wholesaler.com` / `password123`

### Guest Access
- Browse products and inventory without signing in
- View-only access to orders and system features
- Promotional signup prompts for full access

---

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard with advanced analytics
- **Tablet**: Adapted layouts with touch-friendly controls
- **Mobile**: Streamlined interface with essential features

---

## 🌙 Dark Mode

Toggle between light and dark themes with:
- Persistent theme selection
- System preference detection
- Smooth transitions
- Consistent styling across all components

---

## 📊 Analytics & Reporting

- Real-time sales metrics
- Inventory level monitoring
- Order status tracking
- Performance charts and graphs
- Export capabilities for detailed reports

---

## 🔄 Data Management

- **Automatic Seeding**: Sample data generation for testing
- **Real-time Sync**: Live updates across all connected clients
- **Offline Support**: Basic offline functionality with Firestore
- **Data Validation**: Comprehensive input validation and error handling

---

## 🚀 Deployment

The app is configured for easy deployment on:
- **Vercel** (recommended for React + Firebase)
- **Netlify** 
- **Firebase Hosting**

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Tailwind CSS for styling framework
- React team for the amazing framework
- All contributors and team members