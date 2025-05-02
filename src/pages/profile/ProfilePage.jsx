import { Routes, Route, Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TestResults from './TestResults';
import Settings from './Settings';
import { FaTimes } from 'react-icons/fa';
import './profile-page.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="profile-page">
      <button className="profile-close-btn" onClick={handleClose}>
        <FaTimes />
      </button>
      
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