import { Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TestResults from './TestResults';
import Settings from './Settings';
import { FaTimes, FaChartLine, FaCog } from 'react-icons/fa';
import './profile-page.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="profile-page">
      <button
        className="profile-close-btn"
        onClick={handleClose}
        aria-label="Закрыть страницу настроек"
      >
        <FaTimes aria-hidden="true" />
      </button>

      <div className="profile-sidebar">
        <nav className="profile-nav">
          <NavLink
            to="/profile/results"
            className={({isActive}) => isActive ? 'active' : ''}
          >
            Результаты тестов
          </NavLink>
          <NavLink
            to="/profile/settings"
            className={({isActive}) => isActive ? 'active' : ''}
          >
            Настройки
          </NavLink>
        </nav>
      </div>

      <div className="profile-content">
        <Routes>
          <Route path="results" element={<TestResults />} />
          <Route path="settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="results" replace />} />
        </Routes>
      </div>

      <div className="mobile-nav">
        <NavLink
          to="/profile/results"
          className={({isActive}) => isActive ? 'active' : ''}
          aria-label="Результаты тестов"
        >
          <FaChartLine className="icon" />
        </NavLink>
        <NavLink
          to="/profile/settings"
          className={({isActive}) => isActive ? 'active' : ''}
          aria-label="Настройки"
        >
          <FaCog className="icon" />
        </NavLink>
      </div>
    </div>
  );
}
