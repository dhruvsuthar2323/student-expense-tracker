import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * While the initial auth check is loading, shows a full-screen spinner.
 * If the user is not authenticated, redirects to /login.
 * Otherwise, renders the child route via <Outlet />.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
