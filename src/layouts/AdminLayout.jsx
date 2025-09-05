import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import LoadingSpinner from '../components/LoadingSpinner'; // Импортируем наш спиннер

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      }
  }, [user, isLoading]);

  if (isLoading) return <LoadingSpinner fullPage />;
  
  if (!user || !user.role) {
    console.error('User data missing:', user);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
