import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../pages/admin/admin.css';

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h3>Панель управления</h3>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span>📊</span> Дашборд
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/questions" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span>❓</span> Вопросы
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span>👥</span> Пользователи
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <span>🚪</span> Выйти
        </button>
      </div>
    </aside>
  );
}