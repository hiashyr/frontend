import { Link } from 'react-router-dom';
import { FaBook, FaClipboardList, FaUser, FaUserPlus } from 'react-icons/fa';
import './Header.css';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-text">ПДД Тренер</span>
        </Link>
        
        <nav className="nav">
          <Link to="/rules" className="nav-link">
            <FaBook className="nav-icon" />
            <span className="nav-text">Правила ПДД</span>
          </Link>
          
          <Link to="/exam-info" className="nav-link">
            <FaClipboardList className="nav-icon" />
            <span className="nav-text">О экзамене</span>
          </Link>
          
          {user ? (
            <Link to="/profile" className="nav-link">
              <FaUser className="nav-icon" />
              <span className="nav-text">Личный кабинет</span>
            </Link>
          ) : (
            <Link to="/register" className="nav-link register-btn">
              <FaUserPlus className="nav-icon" />
              <span className="nav-text">Зарегистрироваться</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}