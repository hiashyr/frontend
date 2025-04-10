import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useEffect, useState } from 'react';

export default function AdminLayout() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation(); // Правильный импорт location

  useEffect(() => {
    const timer = setTimeout(() => setIsChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return <div className="loading-spinner">Загрузка...</div>;
  }

  if (!user) {
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