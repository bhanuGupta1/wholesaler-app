// src/components/common/ProtectedRoute.jsx - Updated with approval system
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  allowedRoles = null,
  requiredPermission = null,
  fallbackPath = "/login",
}) => {
  const { user, loading, approvalStatus, userRole, hasPermission } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();

  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p
            className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user's account has access (approval status)
  if (!user.canAccess && approvalStatus && !approvalStatus.canAccess) {
    return (
      <ApprovalStatusScreen
        approvalStatus={approvalStatus}
        user={user}
        darkMode={darkMode}
      />
    );
  }

  // Check specific role requirement
  if (requiredRole && userRole !== requiredRole) {
    return (
      <AccessDeniedScreen
        reason={`This page requires ${requiredRole} access`}
        userRole={userRole}
        darkMode={darkMode}
      />
    );
  }

  // Check if user role is in allowed roles array
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <AccessDeniedScreen
        reason={`This page is restricted to: ${allowedRoles.join(", ")}`}
        userRole={userRole}
        darkMode={darkMode}
      />
    );
  }

  // Check specific permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <AccessDeniedScreen
        reason="You don't have the required permissions for this page"
        userRole={userRole}
        darkMode={darkMode}
        missingPermission={requiredPermission}
      />
    );
  }

  // User has access - render the protected content
  return children;
};

// Component to show approval status
const ApprovalStatusScreen = ({ approvalStatus, user, darkMode }) => {
  const getStatusInfo = () => {
    switch (approvalStatus.status) {
      case "pending_approval":
        return {
          icon: "⏳",
          title: "Account Pending Approval",
          message:
            "Your account is currently being reviewed by our admin team.",
          color: "yellow",
          details: [
            "Your registration was successful",
            "Admin review typically takes 1-2 business days",
            "You'll receive an email notification once approved",
            "You can still browse as a guest while waiting",
          ],
        };
      case "rejected":
        return {
          icon: "❌",
          title: "Account Application Rejected",
          message: "Unfortunately, your account application was not approved.",
          color: "red",
          details: [
            "Your application did not meet our requirements",
            "You can contact support for more information",
            "You may reapply after addressing the issues",
            "You can still browse as a guest",
          ],
        };
      case "suspended":
        return {
          icon: "🚫",
          title: "Account Suspended",
          message: "Your account has been temporarily suspended.",
          color: "gray",
          details: [
            "This may be due to a policy violation",
            "Contact support to understand the reason",
            "Your account may be reactivated after review",
            "You can browse as a guest while suspended",
          ],
        };
      default:
        return {
          icon: "⚠️",
          title: "Account Access Restricted",
          message:
            "Your account requires approval before you can access this area.",
          color: "blue",
          details: [
            "Please wait for admin approval",
            "Contact support if you have questions",
            "You can browse public areas while waiting",
          ],
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"} px-4`}
    >
      <div
        className={`max-w-md w-full p-8 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg text-center`}
      >
        <div className="text-6xl mb-6">{statusInfo.icon}</div>

        <h2
          className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          {statusInfo.title}
        </h2>

        <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          {statusInfo.message}
        </p>

        {/* Account Details */}
        <div
          className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
        >
          <div className="text-left space-y-2">
            <div className="flex justify-between">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Account Type:
              </span>
              <span
                className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} capitalize`}
              >
                {user.accountType}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Email:
              </span>
              <span
                className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                {user.email}
              </span>
            </div>
            {user.businessName && (
              <div className="flex justify-between">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Business:
                </span>
                <span
                  className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}
                >
                  {user.businessName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Details */}
        <div
          className={`p-4 rounded-lg mb-6 ${
            statusInfo.color === "yellow"
              ? darkMode
                ? "bg-yellow-900/20 border-yellow-800"
                : "bg-yellow-50 border-yellow-200"
              : statusInfo.color === "red"
                ? darkMode
                  ? "bg-red-900/20 border-red-800"
                  : "bg-red-50 border-red-200"
                : statusInfo.color === "gray"
                  ? darkMode
                    ? "bg-gray-900/20 border-gray-800"
                    : "bg-gray-50 border-gray-200"
                  : darkMode
                    ? "bg-blue-900/20 border-blue-800"
                    : "bg-blue-50 border-blue-200"
          } border`}
        >
          <h3
            className={`font-medium mb-2 ${
              statusInfo.color === "yellow"
                ? darkMode
                  ? "text-yellow-300"
                  : "text-yellow-800"
                : statusInfo.color === "red"
                  ? darkMode
                    ? "text-red-300"
                    : "text-red-800"
                  : statusInfo.color === "gray"
                    ? darkMode
                      ? "text-gray-300"
                      : "text-gray-800"
                    : darkMode
                      ? "text-blue-300"
                      : "text-blue-800"
            }`}
          >
            What you should know:
          </h3>
          <ul
            className={`text-sm text-left space-y-1 ${
              statusInfo.color === "yellow"
                ? darkMode
                  ? "text-yellow-200"
                  : "text-yellow-700"
                : statusInfo.color === "red"
                  ? darkMode
                    ? "text-red-200"
                    : "text-red-700"
                  : statusInfo.color === "gray"
                    ? darkMode
                      ? "text-gray-200"
                      : "text-gray-700"
                    : darkMode
                      ? "text-blue-200"
                      : "text-blue-700"
            }`}
          >
            {statusInfo.details.map((detail, index) => (
              <li key={index}>• {detail}</li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className={`block w-full py-3 px-4 ${darkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white rounded-lg transition-colors`}
          >
            Continue as Guest
          </Link>

          {approvalStatus.status === "rejected" && (
            <Link
              to="/register"
              className={`block w-full py-3 px-4 border ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} rounded-lg transition-colors`}
            >
              Apply Again
            </Link>
          )}

          <a
            href="mailto:support@wholesaler.com"
            className={`block w-full py-3 px-4 border ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} rounded-lg transition-colors`}
          >
            Contact Support
          </a>

          <button
            onClick={() => window.location.reload()}
            className={`w-full py-2 px-4 text-sm ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"} transition-colors`}
          >
            🔄 Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
};

// Component to show access denied
const AccessDeniedScreen = ({
  reason,
  userRole,
  darkMode,
  missingPermission,
}) => {
  return (
    <div
      className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"} px-4`}
    >
      <div
        className={`max-w-md w-full p-8 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg text-center`}
      >
        <div className="text-6xl mb-6">🚫</div>

        <h2
          className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          Access Denied
        </h2>

        <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          {reason}
        </p>

        {/* Current Role Info */}
        <div
          className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
        >
          <div className="text-left space-y-2">
            <div className="flex justify-between">
              <span
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Your Role:
              </span>
              <span
                className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} capitalize`}
              >
                {userRole}
              </span>
            </div>
            {missingPermission && (
              <div className="flex justify-between">
                <span
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  Required:
                </span>
                <span
                  className={`text-sm font-medium ${darkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {missingPermission}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Help Info */}
        <div
          className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"} border`}
        >
          <h3
            className={`font-medium mb-2 ${darkMode ? "text-blue-300" : "text-blue-800"}`}
          >
            Need Access?
          </h3>
          <ul
            className={`text-sm text-left space-y-1 ${darkMode ? "text-blue-200" : "text-blue-700"}`}
          >
            <li>• Contact your administrator</li>
            <li>• Request role upgrade if needed</li>
            <li>• Check if you have the right account type</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className={`block w-full py-3 px-4 ${darkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white rounded-lg transition-colors`}
          >
            Go to Dashboard
          </Link>

          <Link
            to="/profile"
            className={`block w-full py-3 px-4 border ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} rounded-lg transition-colors`}
          >
            View Profile
          </Link>

          <a
            href="mailto:admin@wholesaler.com"
            className={`block w-full py-3 px-4 border ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} rounded-lg transition-colors`}
          >
            Contact Admin
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
