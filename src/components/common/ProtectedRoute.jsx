// src/components/common/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Custom hook to access authentication state

// This component protects routes by allowing only authenticated users to access them
const ProtectedRoute = ({ children }) => {
  // Destructure the currentUser and loading state from the custom auth hook
  const { currentUser, loading } = useAuth();
  
  // While the authentication status is being determined, show a loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {/* Spinner animation */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // If no user is authenticated, redirect to the login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If the user is authenticated, render the protected child components
  return children;
};

export default ProtectedRoute;
