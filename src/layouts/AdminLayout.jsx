import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';


export default function AdminLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
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