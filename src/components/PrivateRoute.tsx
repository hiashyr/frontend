import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function PrivateRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('PrivateRoute useEffect - user:', user);
    console.log('PrivateRoute useEffect - location:', location);

    if (user) {
      // Redirect admin users to dashboard if they're on any non-admin, non-profile page
      if (user.role === 'admin' && !location.pathname.startsWith('/admin') && location.pathname !== '/profile') {
        console.log('Redirecting admin to dashboard');
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, location, navigate]);

  if (isLoading) {
    console.log('PrivateRoute - loading...');
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('PrivateRoute - no user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Prevent admin users from accessing regular user pages
  if (user.role === 'admin') {
    // Allow access to profile page and admin pages only
    if (location.pathname === '/') {
      console.log('Redirecting admin from home page to dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    } else if (location.pathname !== '/profile' && !location.pathname.startsWith('/admin')) {
      console.log('Redirecting admin from user page to dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Prevent non-admin users from accessing admin pages
  if (user.role !== 'admin' && location.pathname.startsWith('/admin')) {
    console.log('Redirecting non-admin from admin page to home');
    return <Navigate to="/" replace />;
  }

  console.log('PrivateRoute - rendering outlet');
  return <Outlet />;
}
