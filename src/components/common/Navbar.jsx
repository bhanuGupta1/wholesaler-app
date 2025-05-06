// src/components/common/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold">Wholesaler App</Link>
          
          <div className="flex space-x-6">
            <Link 
              to="/" 
              className={`hover:text-white/80 ${isActive('/') ? 'font-bold border-b-2 border-white' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/inventory" 
              className={`hover:text-white/80 ${isActive('/inventory') ? 'font-bold border-b-2 border-white' : ''}`}
            >
              Inventory
            </Link>
            <Link 
              to="/orders" 
              className={`hover:text-white/80 ${isActive('/orders') ? 'font-bold border-b-2 border-white' : ''}`}
            >
              Orders
            </Link>
            <Link 
              to="/create-order" 
              className={`hover:text-white/80 ${isActive('/create-order') ? 'font-bold border-b-2 border-white' : ''}`}
            >
              New Order
            </Link>
          </div>
          
          <div>
            {user ? (
              <button 
                onClick={logout} 
                className="bg-white text-primary px-4 py-1 rounded-md hover:bg-gray-100"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                className="bg-white text-primary px-4 py-1 rounded-md hover:bg-gray-100"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;