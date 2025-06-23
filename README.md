# 🧾 Wholesaler App v2.0 – Neural Wholesale Network

A sophisticated React + Firebase-based application for managing wholesale inventory and customer orders with advanced features including dual-theme UI (Cyberpunk/Neumorph), QR code tools, comprehensive guest access, and intelligent analytics.

---

## 🚀 Team Members

- 👑 **Bhanu** – App UI, Navigation, Enhanced Dashboard & Advanced Theming
- 🧱 **Sahib** – Product Inventory (CRUD + Advanced Stock Logic)
- 🔌 **Paras** – Firebase Integration + Complete Order System

---

## 🔧 Tech Stack

- **Frontend**: React 18.2.0 with Vite 5.2.0
- **Database**: Firebase Firestore (v11.7.1)
- **Storage**: Firebase Storage (image uploads & management)
- **Authentication**: Firebase Auth with role-based access
- **Styling**: Tailwind CSS 4.1.5 with custom themes
- **Routing**: React Router DOM v7.5.3
- **Icons**: Lucide React + React Icons
- **Animations**: Framer Motion 11.18.2
- **Charts**: Recharts 2.15.3
- **QR Codes**: html5-qrcode + qrcode libraries
- **Testing**: Vitest with coverage reporting
- **Dev Tools**: ESLint, Prettier, TypeScript support

---

## ✨ Core Features

### 🛒 Inventory & Order Management
- **Smart Inventory**: Real-time CRUD operations with intelligent stock tracking
- **Advanced Order System**: Live product selection with automatic stock deduction
- **Order History**: Comprehensive filtering, sorting, and status tracking
- **Invoice Generation**: Professional invoice creation with print functionality
- **Bulk Operations**: CSV import/export for efficient inventory management

### 🎨 Advanced UI/UX
- **Dual Theme System**: Toggle between Cyberpunk (Neural) and Neumorph themes
- **Guest Access Dashboard**: Full-featured browsing without authentication
- **Responsive Design**: Mobile-first approach with touch-optimized controls
- **Loading States**: Skeleton loaders and smooth animations
- **Error Handling**: Comprehensive error recovery and user feedback

### 📱 QR Code Integration
- **QR Generation**: Create codes for products, orders, and inventory tracking
- **QR Scanning**: html5-qrcode integration for mobile inventory management
- **Product Identification**: Quick lookup and stock updates via QR scanning
- **Warehouse Tools**: Physical item tagging and identification system

### 👥 Access Control & Authentication
- **Role-Based Access**: Admin, Manager, Business, and User roles
- **Guest Mode**: Browse products and access tools without registration
- **Demo Accounts**: Pre-configured test accounts for evaluation
- **Security Features**: Firebase Auth with comprehensive access control

### 📊 Analytics & Monitoring
- **Real-time Metrics**: Live sales, inventory, and performance tracking
- **Interactive Charts**: Recharts-powered analytics dashboards
- **Low Stock Alerts**: Intelligent inventory threshold monitoring
- **Activity Timeline**: Track system actions and user interactions

---

## 🏗 Project Structure

```
src/
├── components/
│   ├── common/           # Shared UI components (Layout, Header, ThemeToggle)
│   ├── dashboard/        # Dashboard-specific components and analytics
│   ├── inventory/        # Inventory management and product modals
│   └── qr/               # QR code generation and scanning tools
├── context/              # React Context (Theme, Auth, Access Control)
├── firebase/             # Firebase config and service modules
├── hooks/                # Custom React hooks (useAuth, useAccessControl)
├── pages/                # Page components and route definitions
├── services/             # API services and data management
├── utils/                # Utility functions and helpers
└── styles/               # CSS and theme configurations
```

---

## 🎭 Theme System

### Cyberpunk Theme (Neural Network)
- **Visual Style**: Neon glows, digital grids, scanlines effects
- **Color Palette**: Cyan, purple, green with dark backgrounds
- **Typography**: Futuristic fonts with glow effects
- **UI Elements**: Angular designs with matrix-inspired animations

### Neumorph Theme (Classic)
- **Visual Style**: Soft shadows, glass morphism, subtle gradients
- **Color Palette**: Blues, indigos, teals with light backgrounds  
- **Typography**: Clean, modern fonts with subtle effects
- **UI Elements**: Rounded designs with depth and softness

---

## 🚦 Branch Structure

| Branch | Purpose | Status |
|--------|---------|---------|
| `main` | Production-ready code (v2.0.0) | ✅ Stable |
| `feature/bhanu/app-ui` | Enhanced UI, theming, guest dashboard | ✅ Complete |
| `feature/sahib/inventory` | Advanced inventory with QR integration | ✅ Complete |
| `feature/paras/orders-and-firebase` | Order system & Firebase optimization | ✅ Complete |

---

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore, Auth, and Storage enabled

### Quick Start

```bash
# Clone the repository
git clone https://github.com/bhanuGupta1/wholesaler-app.git
cd wholesaler-app

# Install dependencies
npm install

# Start development server
npm run dev

# Additional commands
npm run build          # Production build
npm run preview        # Preview production build
npm test              # Run tests
npm run test:coverage # Coverage report
npm run lint          # ESLint check
npm run format        # Prettier format
```

### Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database, Authentication, and Storage
3. Update `src/firebase/config.js` with your configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

4. Set up Firestore security rules and storage permissions

### Environment Setup

The app automatically detects empty databases and offers sample data generation for immediate testing.

---

## 🔐 Authentication & Access

### Demo Accounts
```
Admin: admin@wholesaler.com / password123
Manager: manager@wholesaler.com / password123  
Business: business@wholesaler.com / password123
User: user@wholesaler.com / password123
```

### Guest Access Features
- ✅ Product catalog browsing with search/filter
- ✅ QR code generation and scanning tools
- ✅ Company information and support center
- ✅ Help documentation and tutorials
- ✅ Platform demo and feature showcase
- ✅ Feedback submission system

---

## 📱 QR Code Tools

### Generation
- Product QR codes with embedded metadata
- Order tracking codes
- Inventory management codes
- Custom data encoding

### Scanning
- Mobile camera integration
- Product lookup and identification
- Inventory stock updates
- Order status checking

---

## 🎯 Advanced Features

### Guest Dashboard
- **Neural Theme**: Cyberpunk interface with matrix effects
- **Feature Access**: Browse products, QR tools, support center
- **Smart Search**: Real-time product search with filtering
- **Category Navigation**: Quick access to product categories
- **Recent Updates**: Platform news and feature announcements

### Analytics Dashboard
- Real-time sales metrics with interactive charts
- Inventory level monitoring with alerts
- Order status tracking and analytics
- Performance metrics and KPI monitoring
- Export capabilities for detailed reporting

### Testing & Quality
- **Vitest**: Modern testing framework with UI
- **Coverage**: Comprehensive test coverage reporting
- **Type Safety**: TypeScript integration for better development
- **Linting**: ESLint with React best practices
- **Formatting**: Prettier for consistent code style

---

## 🚀 Deployment

### Supported Platforms
- **Vercel** (recommended - optimal for React + Firebase)
- **Netlify** (easy setup with continuous deployment)
- **Firebase Hosting** (native Firebase integration)

### Production Build
```bash
# Build and deploy
npm run build
npm run deploy

# Local testing
npm run serve:local
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Interactive test UI
npm run test:ui

# Coverage report
npm run test:coverage

# Run tests once (CI)
npm run test:run
```

---

## 📊 Performance

- **Bundle Size**: Optimized with Vite for fast loading
- **Code Splitting**: Route-based splitting for efficient loading
- **Image Optimization**: Firebase Storage with compression
- **Caching**: Firebase offline persistence
- **Analytics**: Real-time performance monitoring

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper testing
4. Run linting and formatting (`npm run lint:fix && npm run format`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with detailed description

### Code Standards
- Follow ESLint rules and React best practices
- Write tests for new features
- Update documentation for API changes
- Use TypeScript types where applicable

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Firebase Team** for robust backend infrastructure
- **Tailwind CSS** for the powerful styling framework
- **React Team** for the incredible framework
- **Vite Team** for lightning-fast development experience
- **Open Source Community** for the amazing libraries and tools
- **All Contributors** who made this project possible

---

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/bhanuGupta1/wholesaler-app/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/bhanuGupta1/wholesaler-app/discussions)
- 📧 **Contact**: Use the in-app support center or feedback system
- 📖 **Documentation**: Available in the `/help-center` section

---

*Built with ❤️ by the Wholesaler App Team | v2.0.0 | Last Updated: December 2024*