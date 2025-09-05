import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function PrivateRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {

    if (user) {
      // Redirect admin users to dashboard if they're on any non-admin, non-profile page
      if (user.role === 'admin' && !location.pathname.startsWith('/admin') && location.pathname !== '/profile') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, location, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Prevent admin users from accessing regular user pages
  if (user.role === 'admin') {
    // Allow access to profile page and admin pages only
    if (location.pathname === '/') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (location.pathname !== '/profile' && !location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Prevent non-admin users from accessing admin pages
  if (user.role !== 'admin' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
