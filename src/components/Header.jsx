import { Link } from 'react-router-dom';
import { FaBook, FaClipboardList, FaUser } from 'react-icons/fa';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        {/* Логотип - всегда виден */}
        <Link to="/" className="logo">
          <span className="logo-text">ПДД Тренер</span>
        </Link>
        
        {/* Навигация */}
        <nav className="nav">
          <Link to="/rules" className="nav-link">
            <FaBook className="nav-icon" />
            <span className="nav-text">Правила ПДД</span>
          </Link>
          
          <Link to="/exam-info" className="nav-link">
            <FaClipboardList className="nav-icon" />
            <span className="nav-text">О экзамене</span>
          </Link>
          
          <Link to="/profile" className="nav-link">
            <FaUser className="nav-icon" />
            <span className="nav-text">Личный кабинет</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}