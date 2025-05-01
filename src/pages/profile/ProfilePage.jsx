import { Routes, Route, Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TestResults from './TestResults';
import Settings from './Settings';
import '../profile-page.css'

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="profile-page">
      <div className="profile-sidebar">
        <nav className="profile-nav">
          <NavLink to="results" className={({isActive}) => isActive ? 'active' : ''}>
            Результаты тестов
          </NavLink>
          <NavLink to="settings" className={({isActive}) => isActive ? 'active' : ''}>
            Настройки
          </NavLink>
        </nav>
      </div>
      
      <div className="profile-content">
        <Routes>
          <Route path="results" element={<TestResults />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<Navigate to="results" replace />} />
        </Routes>
      </div>
    </div>
  );
}