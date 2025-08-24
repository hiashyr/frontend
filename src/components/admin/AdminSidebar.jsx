import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../pages/admin/admin.css';

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <div className="admin-sidebar">
      <nav className="admin-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          Общий дашборд
        </NavLink>
        <NavLink
          to="/admin/questions"
          end
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          Управление вопросами
        </NavLink>
        <NavLink
          to="/admin/questions/add"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          Добавить вопрос
        </NavLink>
      </nav>
      <div className="admin-sidebar-footer">
        <button onClick={logout} className="logout-button">
          Выйти
        </button>
      </div>
    </div>
  );
}
